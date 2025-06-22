from pydantic import BaseModel, Field, validator
from typing import Optional, List, Union, Annotated
from datetime import datetime
from enum import Enum

# Enums
class TransactionType(str, Enum):
    IN = "IN"
    OUT = "OUT"
    ADJUSTMENT = "ADJUSTMENT"
    TRANSFER = "TRANSFER"

class ReferenceType(str, Enum):
    PURCHASE_ORDER = "PURCHASE_ORDER"
    SALE = "SALE"
    MANUAL = "MANUAL"
    RETURN = "RETURN"

class StockStatus(str, Enum):
    OUT_OF_STOCK = "OUT_OF_STOCK"
    LOW_STOCK = "LOW_STOCK"
    NORMAL = "NORMAL"
    OVERSTOCK = "OVERSTOCK"

# Product Schemas
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    description: Optional[str] = Field(None, description="Product description")
    barcode: Optional[str] = Field(None, max_length=50, description="Product barcode")
    sku: str = Field(..., min_length=1, max_length=50, description="Stock Keeping Unit")
    category: str = Field(..., min_length=1, max_length=100, description="Product category")
    subcategory: Optional[str] = Field(None, max_length=100, description="Product subcategory")
    brand: Optional[str] = Field(None, max_length=100, description="Product brand")
    cost_price: float = Field(..., ge=0, description="Cost price in currency units")
    selling_price: float = Field(..., ge=0, description="Selling price in currency units")
    min_stock_threshold: int = Field(..., ge=0, description="Minimum stock threshold for alerts")
    max_stock_threshold: Optional[int] = Field(None, ge=0, description="Maximum stock threshold")
    aisle: Optional[str] = Field(None, max_length=20, description="Aisle location")
    shelf: Optional[str] = Field(None, max_length=20, description="Shelf location")
    bin_location: Optional[str] = Field(None, max_length=20, description="Bin location")
    warehouse_id: Optional[str] = Field(None, description="Warehouse identifier")
    unit_of_measure: str = Field(default="pieces", max_length=20, description="Unit of measurement")
    weight: Optional[float] = Field(None, ge=0, description="Product weight")
    dimensions: Optional[str] = Field(None, max_length=100, description="Product dimensions")
    is_perishable: bool = Field(default=False, description="Whether the product is perishable")
    expiry_date: Optional[datetime] = Field(None, description="Product expiry date")
    days_until_expiry_warning: int = Field(default=7, ge=0, description="Days before expiry to show warning")
    supplier_id: Optional[str] = Field(None, description="Supplier identifier")
    supplier_sku: Optional[str] = Field(None, max_length=100, description="Supplier's SKU for this product")

    @validator('max_stock_threshold')
    def validate_max_threshold(cls, v, values):
        if v is not None and 'min_stock_threshold' in values:
            if v <= values['min_stock_threshold']:
                raise ValueError('max_stock_threshold must be greater than min_stock_threshold')
        return v

class ProductCreate(ProductBase):
    quantity_in_stock: int = Field(default=0, ge=0, description="Initial stock quantity")
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Organic Whole Milk 1L",
                "description": "Fresh organic whole milk from local farms",
                "sku": "MILK-ORG-001",
                "barcode": "1234567890123",
                "category": "Dairy",
                "subcategory": "Milk",
                "brand": "FreshFarm",
                "cost_price": 1.20,
                "selling_price": 2.50,
                "quantity_in_stock": 50,
                "min_stock_threshold": 10,
                "max_stock_threshold": 100,
                "aisle": "A1",
                "shelf": "S2",
                "bin_location": "B3",
                "unit_of_measure": "liters",
                "weight": 1.0,
                "is_perishable": True,
                "days_until_expiry_warning": 3
            }
        }

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    barcode: Optional[str] = Field(None, max_length=50)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    subcategory: Optional[str] = Field(None, max_length=100)
    brand: Optional[str] = Field(None, max_length=100)
    cost_price: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    min_stock_threshold: Optional[int] = Field(None, ge=0)
    max_stock_threshold: Optional[int] = Field(None, ge=0)
    aisle: Optional[str] = Field(None, max_length=20)
    shelf: Optional[str] = Field(None, max_length=20)
    bin_location: Optional[str] = Field(None, max_length=20)
    warehouse_id: Optional[str] = None
    unit_of_measure: Optional[str] = Field(None, max_length=20)
    weight: Optional[float] = Field(None, ge=0)
    dimensions: Optional[str] = Field(None, max_length=100)
    is_perishable: Optional[bool] = None
    expiry_date: Optional[datetime] = None
    days_until_expiry_warning: Optional[int] = Field(None, ge=0)
    supplier_id: Optional[str] = None
    supplier_sku: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str
    quantity_in_stock: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    stock_status: StockStatus
    is_low_stock: bool
    is_out_of_stock: bool

    class Config:
        from_attributes = True

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    tax_id: Optional[str] = Field(None, max_length=50)
    payment_terms: Optional[str] = Field(None, max_length=100)

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    tax_id: Optional[str] = Field(None, max_length=50)
    payment_terms: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

class SupplierResponse(SupplierBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Inventory Transaction Schemas
class InventoryTransactionBase(BaseModel):
    product_id: str
    transaction_type: TransactionType
    quantity: int = Field(..., ne=0)  # Cannot be zero
    unit_cost: Optional[float] = Field(None, ge=0)
    reference_type: Optional[ReferenceType] = None
    reference_id: Optional[str] = None
    from_location: Optional[str] = Field(None, max_length=100)
    to_location: Optional[str] = Field(None, max_length=100)
    batch_number: Optional[str] = Field(None, max_length=100)
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None

class InventoryTransactionCreate(InventoryTransactionBase):
    created_by: str

class InventoryTransactionResponse(InventoryTransactionBase):
    id: str
    created_at: datetime
    created_by: str

    class Config:
        from_attributes = True

# Stock Adjustment Schema
class StockAdjustment(BaseModel):
    product_id: str
    new_quantity: int = Field(..., ge=0)
    reason: str = Field(..., min_length=1)
    notes: Optional[str] = None

# Bulk Operations
class BulkStockUpdate(BaseModel):
    products: List[dict] = Field(..., min_items=1)

# Dashboard/Analytics Schemas
class DashboardMetrics(BaseModel):
    total_products: int
    low_stock_count: int
    out_of_stock_count: int
    expiring_soon_count: int
    total_value: float

class LowStockItem(BaseModel):
    id: str
    name: str
    current_stock: int
    min_threshold: int
    location: Optional[str] = None

class LowStockResponse(BaseModel):
    items: List[LowStockItem]
    total_count: int

# Search and Filter Schemas
class ProductFilter(BaseModel):
    category: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    supplier_id: Optional[str] = None
    warehouse_id: Optional[str] = None
    is_perishable: Optional[bool] = None
    stock_status: Optional[StockStatus] = None
    aisle: Optional[str] = None
    search: Optional[str] = None  # Search in name, description, barcode, sku

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total_count: int
    page: int
    per_page: int
    total_pages: int

# API Response Schemas
class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    message: str
    success: bool = False
    error_code: Optional[str] = None

# Authentication Schemas
class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

class SignupRequest(BaseModel):
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v 