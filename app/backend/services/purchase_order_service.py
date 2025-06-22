from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, func
from models.purchase_order import (
    PurchaseOrder, PurchaseOrderItem, SupplierProduct, 
    DeliveryTracking, PurchaseOrderStatus, DeliveryStatus
)
from models.product import Product, Supplier
from models.purchase_schemas import (
    PurchaseOrderCreate, PurchaseOrderUpdate, SupplierCreate,
    DeliveryTrackingUpdate, PurchaseOrderSummary, DeliveryMetrics,
    ReceiveItemsRequest
)
from services.product_service import ProductService
from datetime import datetime, timedelta
import uuid
import json

class PurchaseOrderService:
    def __init__(self, db: Session):
        self.db = db

    # Supplier Methods
    def get_suppliers(self, active_only: bool = True):
        """Get all suppliers"""
        query = self.db.query(Supplier)
        if active_only:
            query = query.filter(Supplier.is_active == True)
        return query.order_by(Supplier.name).all()

    def create_supplier(self, supplier_data: SupplierCreate):
        """Create a new supplier"""
        supplier = Supplier(
            id=str(uuid.uuid4()),
            **supplier_data.dict()
        )
        self.db.add(supplier)
        self.db.commit()
        self.db.refresh(supplier)
        return supplier

    def get_supplier_by_id(self, supplier_id: str):
        """Get supplier by ID"""
        return self.db.query(Supplier).filter(Supplier.id == supplier_id).first()

    # Purchase Order Methods
    def get_purchase_orders(self, status=None, supplier_id=None, page=1, per_page=20):
        """Get purchase orders with filtering"""
        query = self.db.query(PurchaseOrder).options(
            joinedload(PurchaseOrder.order_items),
            joinedload(PurchaseOrder.supplier)
        )
        
        if status:
            query = query.filter(PurchaseOrder.status == status)
        if supplier_id:
            query = query.filter(PurchaseOrder.supplier_id == supplier_id)
        
        offset = (page - 1) * per_page
        return query.order_by(desc(PurchaseOrder.created_at)).offset(offset).limit(per_page).all()

    def create_purchase_order(self, order_data: PurchaseOrderCreate, created_by: str):
        """Create a new purchase order"""
        # Generate order number
        order_number = self._generate_order_number()
        
        # Create purchase order
        purchase_order = PurchaseOrder(
            id=str(uuid.uuid4()),
            order_number=order_number,
            supplier_id=order_data.supplier_id,
            expected_delivery_date=order_data.expected_delivery_date,
            delivery_address=order_data.delivery_address,
            delivery_instructions=order_data.delivery_instructions,
            notes=order_data.notes,
            created_by=created_by,
            status=PurchaseOrderStatus.DRAFT
        )
        
        self.db.add(purchase_order)
        self.db.flush()  # Get the ID without committing
        
        # Create order items and calculate totals
        subtotal = 0.0
        for item_data in order_data.items:
            # Get product details
            product = self.db.query(Product).filter(Product.id == item_data.product_id).first()
            if not product:
                raise ValueError(f"Product with ID {item_data.product_id} not found")
            
            total_price = item_data.quantity_ordered * item_data.unit_price
            subtotal += total_price
            
            order_item = PurchaseOrderItem(
                id=str(uuid.uuid4()),
                purchase_order_id=purchase_order.id,
                product_id=item_data.product_id,
                quantity_ordered=item_data.quantity_ordered,
                unit_price=item_data.unit_price,
                total_price=total_price,
                product_name=product.name,
                product_sku=product.sku,
                supplier_sku=item_data.supplier_sku
            )
            self.db.add(order_item)
        
        # Calculate totals
        tax_amount = subtotal * 0.2  # 20% VAT for UK
        purchase_order.subtotal = subtotal
        purchase_order.tax_amount = tax_amount
        purchase_order.total_amount = subtotal + tax_amount + (purchase_order.shipping_cost or 0)
        
        # Create delivery tracking
        delivery_tracking = DeliveryTracking(
            id=str(uuid.uuid4()),
            purchase_order_id=purchase_order.id,
            status=DeliveryStatus.PENDING
        )
        self.db.add(delivery_tracking)
        
        self.db.commit()
        self.db.refresh(purchase_order)
        return purchase_order

    def get_purchase_order_by_id(self, order_id: str):
        """Get purchase order by ID with all related data"""
        return self.db.query(PurchaseOrder).options(
            joinedload(PurchaseOrder.order_items),
            joinedload(PurchaseOrder.supplier)
        ).filter(PurchaseOrder.id == order_id).first()

    def update_purchase_order(self, order_id: str, update_data: PurchaseOrderUpdate):
        """Update purchase order"""
        purchase_order = self.get_purchase_order_by_id(order_id)
        if not purchase_order:
            return None
        
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(purchase_order, field, value)
        
        purchase_order.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(purchase_order)
        return purchase_order

    def approve_purchase_order(self, order_id: str, approved_by: str):
        """Approve a purchase order"""
        purchase_order = self.get_purchase_order_by_id(order_id)
        if not purchase_order:
            return None
        
        purchase_order.status = PurchaseOrderStatus.APPROVED
        purchase_order.approved_by = approved_by
        purchase_order.approved_at = datetime.utcnow()
        purchase_order.updated_at = datetime.utcnow()
        
        self.db.commit()
        return True

    def receive_items(self, order_id: str, receive_data: ReceiveItemsRequest):
        """Receive items and automatically update inventory"""
        purchase_order = self.get_purchase_order_by_id(order_id)
        if not purchase_order:
            return None
        
        product_service = ProductService(self.db)
        received_items = 0
        
        for item_data in receive_data.items:
            # Find the order item
            order_item = self.db.query(PurchaseOrderItem).filter(
                and_(
                    PurchaseOrderItem.purchase_order_id == order_id,
                    PurchaseOrderItem.id == item_data["item_id"]
                )
            ).first()
            
            if order_item:
                # Update order item
                quantity_received = item_data.get("quantity_received", 0)
                order_item.quantity_received += quantity_received
                order_item.is_received = order_item.quantity_received >= order_item.quantity_ordered
                order_item.quality_notes = item_data.get("quality_notes")
                order_item.received_date = datetime.utcnow()
                
                # Update product inventory
                product = self.db.query(Product).filter(Product.id == order_item.product_id).first()
                if product:
                    product.quantity_in_stock += quantity_received
                    product.updated_at = datetime.utcnow()
                
                received_items += 1
        
        # Check if all items are received
        all_items_received = all(
            item.is_received for item in purchase_order.order_items
        )
        
        if all_items_received:
            purchase_order.status = PurchaseOrderStatus.DELIVERED
            purchase_order.actual_delivery_date = datetime.utcnow()
            
            # Update delivery tracking
            delivery_tracking = self.db.query(DeliveryTracking).filter(
                DeliveryTracking.purchase_order_id == order_id
            ).first()
            if delivery_tracking:
                delivery_tracking.status = DeliveryStatus.DELIVERED
                delivery_tracking.actual_delivery_date = datetime.utcnow()
                delivery_tracking.delivered_to = receive_data.received_by
        
        self.db.commit()
        return True

    # Delivery Tracking Methods
    def get_delivery_tracking(self, order_id: str):
        """Get delivery tracking for a purchase order"""
        return self.db.query(DeliveryTracking).filter(
            DeliveryTracking.purchase_order_id == order_id
        ).first()

    def update_delivery_tracking(self, order_id: str, tracking_data: DeliveryTrackingUpdate):
        """Update delivery tracking"""
        tracking = self.get_delivery_tracking(order_id)
        if not tracking:
            return None
        
        update_dict = tracking_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(tracking, field, value)
        
        tracking.last_status_update = datetime.utcnow()
        tracking.updated_at = datetime.utcnow()
        
        # Update purchase order status based on delivery status
        purchase_order = self.get_purchase_order_by_id(order_id)
        if purchase_order and tracking.status == DeliveryStatus.DELIVERED:
            purchase_order.status = PurchaseOrderStatus.DELIVERED
            purchase_order.actual_delivery_date = tracking.actual_delivery_date
        elif purchase_order and tracking.status == DeliveryStatus.IN_TRANSIT:
            purchase_order.status = PurchaseOrderStatus.SHIPPED
        
        self.db.commit()
        self.db.refresh(tracking)
        return tracking

    # Dashboard/Summary Methods
    def get_purchase_order_summary(self):
        """Get purchase order summary for dashboard"""
        total_orders = self.db.query(PurchaseOrder).count()
        pending_orders = self.db.query(PurchaseOrder).filter(
            PurchaseOrder.status.in_([PurchaseOrderStatus.PENDING, PurchaseOrderStatus.APPROVED])
        ).count()
        shipped_orders = self.db.query(PurchaseOrder).filter(
            PurchaseOrder.status == PurchaseOrderStatus.SHIPPED
        ).count()
        delivered_orders = self.db.query(PurchaseOrder).filter(
            PurchaseOrder.status == PurchaseOrderStatus.DELIVERED
        ).count()
        
        # Calculate total value
        total_value_result = self.db.query(
            func.sum(PurchaseOrder.total_amount)
        ).scalar() or 0.0
        
        pending_value_result = self.db.query(
            func.sum(PurchaseOrder.total_amount)
        ).filter(
            PurchaseOrder.status.in_([PurchaseOrderStatus.PENDING, PurchaseOrderStatus.APPROVED])
        ).scalar() or 0.0
        
        return PurchaseOrderSummary(
            total_orders=total_orders,
            pending_orders=pending_orders,
            shipped_orders=shipped_orders,
            delivered_orders=delivered_orders,
            total_value=float(total_value_result),
            pending_value=float(pending_value_result)
        )

    def get_delivery_metrics(self):
        """Get delivery metrics for dashboard"""
        in_transit_count = self.db.query(DeliveryTracking).filter(
            DeliveryTracking.status.in_([DeliveryStatus.IN_TRANSIT, DeliveryStatus.OUT_FOR_DELIVERY])
        ).count()
        
        # Delivered today
        today = datetime.utcnow().date()
        delivered_today = self.db.query(DeliveryTracking).filter(
            and_(
                DeliveryTracking.status == DeliveryStatus.DELIVERED,
                func.date(DeliveryTracking.actual_delivery_date) == today
            )
        ).count()
        
        # Delayed deliveries (past expected delivery date)
        delayed_deliveries = self.db.query(PurchaseOrder).filter(
            and_(
                PurchaseOrder.expected_delivery_date < datetime.utcnow(),
                PurchaseOrder.status.in_([
                    PurchaseOrderStatus.APPROVED, 
                    PurchaseOrderStatus.ORDERED, 
                    PurchaseOrderStatus.SHIPPED
                ])
            )
        ).count()
        
        # Calculate average delivery time
        delivered_orders = self.db.query(PurchaseOrder).filter(
            and_(
                PurchaseOrder.status == PurchaseOrderStatus.DELIVERED,
                PurchaseOrder.actual_delivery_date.isnot(None)
            )
        ).all()
        
        if delivered_orders:
            total_delivery_days = sum(
                (order.actual_delivery_date - order.order_date).days
                for order in delivered_orders
            )
            average_delivery_time = total_delivery_days / len(delivered_orders)
        else:
            average_delivery_time = 0.0
        
        return DeliveryMetrics(
            in_transit_count=in_transit_count,
            delivered_today=delivered_today,
            delayed_deliveries=delayed_deliveries,
            average_delivery_time=average_delivery_time
        )

    def get_reorder_suggestions(self, limit: int = 10):
        """Get products that need reordering based on stock levels"""
        low_stock_products = self.db.query(Product).filter(
            Product.quantity_in_stock <= Product.min_stock_threshold,
            Product.is_active == True
        ).limit(limit).all()
        
        suggestions = []
        for product in low_stock_products:
            # Find preferred supplier for this product
            supplier_product = self.db.query(SupplierProduct).filter(
                and_(
                    SupplierProduct.product_id == product.id,
                    SupplierProduct.is_available == True
                )
            ).order_by(SupplierProduct.is_preferred.desc()).first()
            
            suggestion = {
                "product_id": product.id,
                "product_name": product.name,
                "product_sku": product.sku,
                "current_stock": product.quantity_in_stock,
                "min_threshold": product.min_stock_threshold,
                "suggested_quantity": max(product.max_stock_threshold or 100, product.min_stock_threshold * 3),
                "supplier": None
            }
            
            if supplier_product:
                supplier = self.get_supplier_by_id(supplier_product.supplier_id)
                suggestion["supplier"] = {
                    "id": supplier.id,
                    "name": supplier.name,
                    "price": supplier_product.supplier_price,
                    "minimum_order": supplier_product.minimum_order_quantity,
                    "lead_time": supplier_product.lead_time_days
                }
            
            suggestions.append(suggestion)
        
        return {"suggestions": suggestions, "total_count": len(suggestions)}

    def _generate_order_number(self):
        """Generate a unique order number"""
        today = datetime.utcnow()
        date_prefix = today.strftime("%Y%m%d")
        
        # Count orders created today
        orders_today = self.db.query(PurchaseOrder).filter(
            func.date(PurchaseOrder.created_at) == today.date()
        ).count()
        
        sequence = str(orders_today + 1).zfill(3)
        return f"PO-{date_prefix}-{sequence}" 