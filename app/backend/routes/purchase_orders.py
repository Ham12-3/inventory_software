from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.connection import get_db
from models.purchase_order import (
    PurchaseOrder, PurchaseOrderItem, SupplierProduct, 
    DeliveryTracking, PurchaseOrderStatus, DeliveryStatus
)
from models.product import Product, Supplier
from models.purchase_schemas import (
    PurchaseOrderCreate, PurchaseOrderResponse, PurchaseOrderUpdate,
    SupplierCreate, SupplierResponse, DeliveryTrackingUpdate,
    PurchaseOrderSummary, DeliveryMetrics, ReceiveItemsRequest
)
from services.purchase_order_service import PurchaseOrderService
from datetime import datetime
import uuid

router = APIRouter()

# Supplier Routes
@router.get("/suppliers", response_model=List[SupplierResponse])
async def get_suppliers(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all suppliers"""
    try:
        service = PurchaseOrderService(db)
        return service.get_suppliers(active_only=active_only)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch suppliers: {str(e)}"
        )

@router.post("/suppliers", response_model=SupplierResponse)
async def create_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db)
):
    """Create a new supplier"""
    try:
        service = PurchaseOrderService(db)
        return service.create_supplier(supplier_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create supplier: {str(e)}"
        )

@router.get("/suppliers/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: str,
    db: Session = Depends(get_db)
):
    """Get supplier by ID"""
    try:
        service = PurchaseOrderService(db)
        supplier = service.get_supplier_by_id(supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        return supplier
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch supplier: {str(e)}"
        )

# Purchase Order Routes
@router.get("/", response_model=List[PurchaseOrderResponse])
async def get_purchase_orders(
    status: Optional[PurchaseOrderStatus] = None,
    supplier_id: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db)
):
    """Get purchase orders with filtering"""
    try:
        service = PurchaseOrderService(db)
        return service.get_purchase_orders(
            status=status,
            supplier_id=supplier_id,
            page=page,
            per_page=per_page
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch purchase orders: {str(e)}"
        )

@router.post("/", response_model=PurchaseOrderResponse)
async def create_purchase_order(
    order_data: PurchaseOrderCreate,
    created_by: str = Query(..., description="User ID who created the order"),
    db: Session = Depends(get_db)
):
    """Create a new purchase order"""
    try:
        service = PurchaseOrderService(db)
        return service.create_purchase_order(order_data, created_by)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create purchase order: {str(e)}"
        )

@router.get("/{order_id}", response_model=PurchaseOrderResponse)
async def get_purchase_order(
    order_id: str,
    db: Session = Depends(get_db)
):
    """Get purchase order by ID"""
    try:
        service = PurchaseOrderService(db)
        order = service.get_purchase_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase order not found"
            )
        return order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch purchase order: {str(e)}"
        )

@router.put("/{order_id}", response_model=PurchaseOrderResponse)
async def update_purchase_order(
    order_id: str,
    update_data: PurchaseOrderUpdate,
    db: Session = Depends(get_db)
):
    """Update purchase order"""
    try:
        service = PurchaseOrderService(db)
        order = service.update_purchase_order(order_id, update_data)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase order not found"
            )
        return order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update purchase order: {str(e)}"
        )

@router.post("/{order_id}/approve")
async def approve_purchase_order(
    order_id: str,
    approved_by: str,  # This would come from auth token
    db: Session = Depends(get_db)
):
    """Approve a purchase order"""
    try:
        service = PurchaseOrderService(db)
        result = service.approve_purchase_order(order_id, approved_by)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase order not found"
            )
        return {"message": "Purchase order approved successfully", "success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve purchase order: {str(e)}"
        )

@router.post("/{order_id}/receive")
async def receive_items(
    order_id: str,
    receive_data: ReceiveItemsRequest,
    db: Session = Depends(get_db)
):
    """Mark items as received and automatically update inventory"""
    try:
        service = PurchaseOrderService(db)
        result = service.receive_items(order_id, receive_data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase order not found"
            )
        return {
            "message": "Items received and inventory updated successfully", 
            "success": True,
            "items_processed": len(receive_data.items)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to receive items: {str(e)}"
        )

# Delivery Tracking Routes
@router.get("/{order_id}/tracking")
async def get_delivery_tracking(
    order_id: str,
    db: Session = Depends(get_db)
):
    """Get delivery tracking information for a purchase order"""
    try:
        service = PurchaseOrderService(db)
        tracking = service.get_delivery_tracking(order_id)
        if not tracking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery tracking not found"
            )
        return tracking
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch delivery tracking: {str(e)}"
        )

@router.put("/{order_id}/tracking")
async def update_delivery_tracking(
    order_id: str,
    tracking_data: DeliveryTrackingUpdate,
    db: Session = Depends(get_db)
):
    """Update delivery tracking information"""
    try:
        service = PurchaseOrderService(db)
        tracking = service.update_delivery_tracking(order_id, tracking_data)
        if not tracking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase order or tracking not found"
            )
        return tracking
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update delivery tracking: {str(e)}"
        )

# Dashboard/Summary Routes
@router.get("/summary/orders", response_model=PurchaseOrderSummary)
async def get_purchase_order_summary(
    db: Session = Depends(get_db)
):
    """Get purchase order summary for dashboard"""
    try:
        service = PurchaseOrderService(db)
        return service.get_purchase_order_summary()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch purchase order summary: {str(e)}"
        )

@router.get("/summary/deliveries", response_model=DeliveryMetrics)
async def get_delivery_metrics(
    db: Session = Depends(get_db)
):
    """Get delivery metrics for dashboard"""
    try:
        service = PurchaseOrderService(db)
        return service.get_delivery_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch delivery metrics: {str(e)}"
        )

# Quick Actions
@router.get("/products/reorder-suggestions")
async def get_reorder_suggestions(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get products that need reordering based on stock levels"""
    try:
        service = PurchaseOrderService(db)
        return service.get_reorder_suggestions(limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch reorder suggestions: {str(e)}"
        ) 