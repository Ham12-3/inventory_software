from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    barcode = Column(String(50), unique=True, nullable=True)
    sku = Column(String(50), unique=True, nullable=False)
    
    # Category and Classification
    category = Column(String(100), nullable=False)
    subcategory = Column(String(100), nullable=True)
    brand = Column(String(100), nullable=True)
    
    # Pricing
    cost_price = Column(Float, nullable=False, default=0.0)
    selling_price = Column(Float, nullable=False, default=0.0)
    
    # Inventory Tracking
    quantity_in_stock = Column(Integer, nullable=False, default=0)
    min_stock_threshold = Column(Integer, nullable=False, default=10)
    max_stock_threshold = Column(Integer, nullable=True, default=1000)
    
    # Location Information
    aisle = Column(String(20), nullable=True)
    shelf = Column(String(20), nullable=True)
    bin_location = Column(String(20), nullable=True)
    warehouse_id = Column(String, nullable=True)  # For multi-warehouse support
    
    # Product Details
    unit_of_measure = Column(String(20), nullable=False, default="pieces")  # pieces, kg, liters, etc.
    weight = Column(Float, nullable=True)  # in grams
    dimensions = Column(String(100), nullable=True)  # "L x W x H"
    
    # Perishable Items
    is_perishable = Column(Boolean, default=False)
    expiry_date = Column(DateTime, nullable=True)
    days_until_expiry_warning = Column(Integer, default=7)
    
    # Supplier Information
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=True)
    supplier_sku = Column(String(100), nullable=True)
    
    # Status and Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)  # User ID
    
    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    inventory_transactions = relationship("InventoryTransaction", back_populates="product")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name}, stock={self.quantity_in_stock})>"
    
    @property
    def is_low_stock(self):
        return self.quantity_in_stock <= self.min_stock_threshold
    
    @property
    def is_out_of_stock(self):
        return self.quantity_in_stock <= 0
    
    @property
    def stock_status(self):
        if self.is_out_of_stock:
            return "OUT_OF_STOCK"
        elif self.is_low_stock:
            return "LOW_STOCK"
        elif self.quantity_in_stock >= self.max_stock_threshold:
            return "OVERSTOCK"
        else:
            return "NORMAL"


class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    contact_person = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    
    # Business Details
    tax_id = Column(String(50), nullable=True)
    payment_terms = Column(String(100), nullable=True, default="Net 30")
    lead_time_days = Column(Integer, default=7)
    minimum_order_value = Column(Float, default=0.0)
    
    # Rating and Performance
    rating = Column(Float, default=0.0)  # 0-5 stars
    total_orders = Column(Integer, default=0)
    on_time_delivery_rate = Column(Float, default=0.0)  # percentage
    
    # Status
    is_active = Column(Boolean, default=True)
    is_preferred = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    products = relationship("Product", back_populates="supplier")
    
    def __repr__(self):
        return f"<Supplier(id={self.id}, name={self.name})>"


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    
    # Transaction Details
    transaction_type = Column(String(20), nullable=False)  # IN, OUT, ADJUSTMENT, TRANSFER
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=True)  # Cost per unit for IN transactions
    
    # Reference Information
    reference_type = Column(String(50), nullable=True)  # PURCHASE_ORDER, SALE, MANUAL, RETURN
    reference_id = Column(String, nullable=True)  # ID of related document
    
    # Location (for transfers)
    from_location = Column(String(100), nullable=True)
    to_location = Column(String(100), nullable=True)
    
    # Batch/Lot Information
    batch_number = Column(String(100), nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    
    # Metadata
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, nullable=False)  # User ID
    
    # Relationships
    product = relationship("Product", back_populates="inventory_transactions")
    
    def __repr__(self):
        return f"<InventoryTransaction(id={self.id}, type={self.transaction_type}, qty={self.quantity})>" 