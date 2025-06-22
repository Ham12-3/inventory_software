from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class PurchaseOrderStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    ORDERED = "ORDERED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class DeliveryStatus(str, Enum):
    PENDING = "PENDING"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    company_name: Optional[str] = Field(None, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    payment_terms: Optional[str] = Field("Net 30", max_length=100)
    lead_time_days: int = Field(default=7, ge=0)
    minimum_order_value: float = Field(default=0.0, ge=0)

class SupplierCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: str
    rating: float
    total_orders: int
    on_time_delivery_rate: float
    is_active: bool
    is_preferred: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Supplier Product Schemas
class SupplierProductBase(BaseModel):
    supplier_id: str
    product_id: str
    supplier_sku: Optional[str] = Field(None, max_length=100)
    supplier_price: float = Field(..., gt=0)
    minimum_order_quantity: int = Field(default=1, ge=1)
    lead_time_days: int = Field(default=7, ge=0)

class SupplierProductCreate(SupplierProductBase):
    pass

class SupplierProductResponse(SupplierProductBase):
    id: str
    is_preferred: bool
    is_available: bool
    last_order_date: Optional[datetime]
    last_price_update: datetime
    
    class Config:
        from_attributes = True

# Purchase Order Item Schemas
class PurchaseOrderItemBase(BaseModel):
    product_id: str
    quantity_ordered: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    supplier_sku: Optional[str] = None

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItemResponse(PurchaseOrderItemBase):
    id: str
    quantity_received: int
    total_price: float
    product_name: str
    product_sku: str
    is_received: bool
    is_quality_checked: bool
    quality_notes: Optional[str]
    received_date: Optional[datetime]
    
    class Config:
        from_attributes = True

# Purchase Order Schemas
class PurchaseOrderBase(BaseModel):
    supplier_id: str
    expected_delivery_date: Optional[datetime] = None
    delivery_address: Optional[str] = None
    delivery_instructions: Optional[str] = None
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate] = Field(..., min_items=1)

class PurchaseOrderUpdate(BaseModel):
    status: Optional[PurchaseOrderStatus] = None
    expected_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    tracking_number: Optional[str] = None
    delivery_address: Optional[str] = None
    delivery_instructions: Optional[str] = None
    notes: Optional[str] = None
    reference_number: Optional[str] = None

class PurchaseOrderResponse(PurchaseOrderBase):
    id: str
    order_number: str
    status: PurchaseOrderStatus
    order_date: datetime
    actual_delivery_date: Optional[datetime]
    subtotal: float
    tax_amount: float
    shipping_cost: float
    discount_amount: float
    total_amount: float
    tracking_number: Optional[str]
    reference_number: Optional[str]
    created_by: str
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Related data
    supplier: SupplierResponse
    items: List[PurchaseOrderItemResponse]
    
    class Config:
        from_attributes = True

# Delivery Tracking Schemas
class DeliveryTrackingBase(BaseModel):
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    shipped_date: Optional[datetime] = None
    estimated_delivery_date: Optional[datetime] = None
    current_location: Optional[str] = None
    origin_location: Optional[str] = None
    destination_location: Optional[str] = None

class DeliveryTrackingCreate(DeliveryTrackingBase):
    purchase_order_id: str

class DeliveryTrackingUpdate(BaseModel):
    status: Optional[DeliveryStatus] = None
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    shipped_date: Optional[datetime] = None
    estimated_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    current_location: Optional[str] = None
    delivered_to: Optional[str] = None
    delivery_signature: Optional[str] = None
    delivery_photo_url: Optional[str] = None
    delivery_notes: Optional[str] = None

class DeliveryTrackingResponse(DeliveryTrackingBase):
    id: str
    purchase_order_id: str
    status: DeliveryStatus
    actual_delivery_date: Optional[datetime]
    delivered_to: Optional[str]
    delivery_signature: Optional[str]
    delivery_photo_url: Optional[str]
    delivery_notes: Optional[str]
    last_status_update: datetime
    status_history: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard/Summary Schemas
class PurchaseOrderSummary(BaseModel):
    total_orders: int
    pending_orders: int
    shipped_orders: int
    delivered_orders: int
    total_value: float
    pending_value: float

class DeliveryMetrics(BaseModel):
    in_transit_count: int
    delivered_today: int
    delayed_deliveries: int
    average_delivery_time: float  # in days

# Receive Items Schema
class ReceiveItemsRequest(BaseModel):
    items: List[dict] = Field(..., description="List of items with quantities received")
    # Example: [{"item_id": "123", "quantity_received": 10, "quality_notes": "Good condition"}]
    received_by: str
    notes: Optional[str] = None 