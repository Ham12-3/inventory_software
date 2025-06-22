from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from .product import Base

class PurchaseOrderStatus(enum.Enum):
    DRAFT = "DRAFT"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    ORDERED = "ORDERED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class DeliveryStatus(enum.Enum):
    PENDING = "PENDING"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"

class SupplierProduct(Base):
    __tablename__ = "supplier_products"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    
    # Supplier-specific product details
    supplier_sku = Column(String(100), nullable=True)
    supplier_price = Column(Float, nullable=False)
    minimum_order_quantity = Column(Integer, default=1)
    lead_time_days = Column(Integer, default=7)
    
    # Status
    is_preferred = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    last_order_date = Column(DateTime, nullable=True)
    last_price_update = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<SupplierProduct(supplier_id={self.supplier_id}, product_id={self.product_id})>"

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(50), unique=True, nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    
    # Order Details
    status = Column(Enum(PurchaseOrderStatus), default=PurchaseOrderStatus.DRAFT)
    order_date = Column(DateTime, default=datetime.utcnow)
    expected_delivery_date = Column(DateTime, nullable=True)
    actual_delivery_date = Column(DateTime, nullable=True)
    
    # Financial Details
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    shipping_cost = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    
    # Delivery Information
    delivery_address = Column(Text, nullable=True)
    delivery_instructions = Column(Text, nullable=True)
    tracking_number = Column(String(100), nullable=True)
    
    # Notes and References
    notes = Column(Text, nullable=True)
    reference_number = Column(String(100), nullable=True)  # Supplier's reference
    
    # Metadata
    created_by = Column(String, nullable=False)  # User ID
    approved_by = Column(String, nullable=True)  # User ID
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")
    delivery_tracking = relationship("DeliveryTracking", back_populates="purchase_order", uselist=False)
    
    def __repr__(self):
        return f"<PurchaseOrder(id={self.id}, order_number={self.order_number}, status={self.status})>"

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    purchase_order_id = Column(String, ForeignKey("purchase_orders.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    
    # Order Item Details
    quantity_ordered = Column(Integer, nullable=False)
    quantity_received = Column(Integer, default=0)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Product Details (snapshot at time of order)
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(50), nullable=False)
    supplier_sku = Column(String(100), nullable=True)
    
    # Quality Control
    is_received = Column(Boolean, default=False)
    is_quality_checked = Column(Boolean, default=False)
    quality_notes = Column(Text, nullable=True)
    received_date = Column(DateTime, nullable=True)
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="order_items")
    
    def __repr__(self):
        return f"<PurchaseOrderItem(id={self.id}, product_sku={self.product_sku}, qty={self.quantity_ordered})>"

class DeliveryTracking(Base):
    __tablename__ = "delivery_tracking"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    purchase_order_id = Column(String, ForeignKey("purchase_orders.id"), nullable=False)
    
    # Tracking Details
    tracking_number = Column(String(100), nullable=True)
    carrier = Column(String(100), nullable=True)  # FedEx, UPS, DHL, etc.
    status = Column(Enum(DeliveryStatus), default=DeliveryStatus.PENDING)
    
    # Timeline
    shipped_date = Column(DateTime, nullable=True)
    estimated_delivery_date = Column(DateTime, nullable=True)
    actual_delivery_date = Column(DateTime, nullable=True)
    
    # Location Tracking
    current_location = Column(String(255), nullable=True)
    origin_location = Column(String(255), nullable=True)
    destination_location = Column(String(255), nullable=True)
    
    # Delivery Details
    delivered_to = Column(String(255), nullable=True)
    delivery_signature = Column(String(255), nullable=True)
    delivery_photo_url = Column(String(500), nullable=True)
    delivery_notes = Column(Text, nullable=True)
    
    # Status Updates
    last_status_update = Column(DateTime, default=datetime.utcnow)
    status_history = Column(Text, nullable=True)  # JSON string of status updates
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="delivery_tracking")
    
    def __repr__(self):
        return f"<DeliveryTracking(id={self.id}, tracking_number={self.tracking_number}, status={self.status})>" 