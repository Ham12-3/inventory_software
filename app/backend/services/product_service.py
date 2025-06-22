from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Tuple, Optional
from datetime import datetime

from models.product import Product, InventoryTransaction
from models.schemas import (
    ProductCreate, 
    ProductUpdate, 
    ProductFilter,
    ProductResponse,
    TransactionType
)

class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def create_product(self, product: ProductCreate, user_id: str) -> ProductResponse:
        """
        Create a new product in the database
        """
        db_product = Product(
            **product.dict(),
            created_by=user_id
        )
        
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        
        # Create initial stock transaction if quantity > 0
        if product.quantity_in_stock > 0:
            self._create_stock_transaction(
                product_id=db_product.id,
                transaction_type=TransactionType.IN,
                quantity=product.quantity_in_stock,
                reference_type="MANUAL",
                notes="Initial stock",
                user_id=user_id
            )
        
        return self._to_response(db_product)

    def get_product(self, product_id: str) -> Optional[ProductResponse]:
        """
        Get a product by ID
        """
        product = self.db.query(Product).filter(
            and_(Product.id == product_id, Product.is_active == True)
        ).first()
        
        return self._to_response(product) if product else None

    def get_product_by_sku(self, sku: str) -> Optional[ProductResponse]:
        """
        Get a product by SKU
        """
        product = self.db.query(Product).filter(
            and_(Product.sku == sku, Product.is_active == True)
        ).first()
        
        return self._to_response(product) if product else None

    def get_product_by_barcode(self, barcode: str) -> Optional[ProductResponse]:
        """
        Get a product by barcode
        """
        product = self.db.query(Product).filter(
            and_(Product.barcode == barcode, Product.is_active == True)
        ).first()
        
        return self._to_response(product) if product else None

    def get_products_paginated(
        self, 
        page: int = 1, 
        per_page: int = 20, 
        filters: Optional[ProductFilter] = None
    ) -> Tuple[List[ProductResponse], int]:
        """
        Get paginated list of products with filters
        """
        query = self.db.query(Product).filter(Product.is_active == True)
        
        # Apply filters
        if filters:
            if filters.category:
                query = query.filter(Product.category.ilike(f"%{filters.category}%"))
            
            if filters.subcategory:
                query = query.filter(Product.subcategory.ilike(f"%{filters.subcategory}%"))
            
            if filters.brand:
                query = query.filter(Product.brand.ilike(f"%{filters.brand}%"))
            
            if filters.supplier_id:
                query = query.filter(Product.supplier_id == filters.supplier_id)
            
            if filters.warehouse_id:
                query = query.filter(Product.warehouse_id == filters.warehouse_id)
            
            if filters.is_perishable is not None:
                query = query.filter(Product.is_perishable == filters.is_perishable)
            
            if filters.aisle:
                query = query.filter(Product.aisle.ilike(f"%{filters.aisle}%"))
            
            if filters.stock_status:
                if filters.stock_status == "OUT_OF_STOCK":
                    query = query.filter(Product.quantity_in_stock <= 0)
                elif filters.stock_status == "LOW_STOCK":
                    query = query.filter(
                        and_(
                            Product.quantity_in_stock > 0,
                            Product.quantity_in_stock <= Product.min_stock_threshold
                        )
                    )
                elif filters.stock_status == "OVERSTOCK":
                    query = query.filter(Product.quantity_in_stock >= Product.max_stock_threshold)
                elif filters.stock_status == "NORMAL":
                    query = query.filter(
                        and_(
                            Product.quantity_in_stock > Product.min_stock_threshold,
                            Product.quantity_in_stock < Product.max_stock_threshold
                        )
                    )
            
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.filter(
                    or_(
                        Product.name.ilike(search_term),
                        Product.description.ilike(search_term),
                        Product.barcode.ilike(search_term),
                        Product.sku.ilike(search_term)
                    )
                )
        
        # Get total count before pagination
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        products = query.offset(offset).limit(per_page).all()
        
        return [self._to_response(product) for product in products], total_count

    def update_product(self, product_id: str, product_update: ProductUpdate) -> ProductResponse:
        """
        Update a product's information
        """
        product = self.db.query(Product).filter(
            and_(Product.id == product_id, Product.is_active == True)
        ).first()
        
        if not product:
            raise ValueError(f"Product with ID '{product_id}' not found")
        
        # Update only provided fields
        update_data = product_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        product.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(product)
        
        return self._to_response(product)

    def delete_product(self, product_id: str) -> bool:
        """
        Soft delete a product (mark as inactive)
        """
        product = self.db.query(Product).filter(
            and_(Product.id == product_id, Product.is_active == True)
        ).first()
        
        if not product:
            return False
        
        product.is_active = False
        product.updated_at = datetime.utcnow()
        
        self.db.commit()
        return True

    def adjust_stock(
        self, 
        product_id: str, 
        new_quantity: int, 
        reason: str,
        user_id: str,
        notes: Optional[str] = None
    ) -> ProductResponse:
        """
        Adjust product stock quantity and create transaction record
        """
        product = self.db.query(Product).filter(
            and_(Product.id == product_id, Product.is_active == True)
        ).first()
        
        if not product:
            raise ValueError(f"Product with ID '{product_id}' not found")
        
        old_quantity = product.quantity_in_stock
        quantity_change = new_quantity - old_quantity
        
        # Update product quantity
        product.quantity_in_stock = new_quantity
        product.updated_at = datetime.utcnow()
        
        # Create inventory transaction
        transaction_type = TransactionType.IN if quantity_change > 0 else TransactionType.OUT
        
        self._create_stock_transaction(
            product_id=product_id,
            transaction_type=TransactionType.ADJUSTMENT,
            quantity=quantity_change,
            reference_type="MANUAL",
            notes=f"Stock adjustment: {reason}. {notes or ''}",
            user_id=user_id
        )
        
        self.db.commit()
        self.db.refresh(product)
        
        return self._to_response(product)

    def get_categories(self) -> List[dict]:
        """
        Get all unique categories and subcategories
        """
        categories_query = self.db.query(
            Product.category,
            Product.subcategory
        ).filter(Product.is_active == True).distinct().all()
        
        categories_dict = {}
        for category, subcategory in categories_query:
            if category not in categories_dict:
                categories_dict[category] = set()
            if subcategory:
                categories_dict[category].add(subcategory)
        
        # Convert to list format
        categories = []
        for category, subcategories in categories_dict.items():
            categories.append({
                "name": category,
                "subcategories": list(subcategories)
            })
        
        return categories

    def get_low_stock_products(self) -> List[ProductResponse]:
        """
        Get products with low stock levels
        """
        products = self.db.query(Product).filter(
            and_(
                Product.is_active == True,
                Product.quantity_in_stock <= Product.min_stock_threshold,
                Product.quantity_in_stock > 0
            )
        ).all()
        
        return [self._to_response(product) for product in products]

    def get_out_of_stock_products(self) -> List[ProductResponse]:
        """
        Get products that are out of stock
        """
        products = self.db.query(Product).filter(
            and_(
                Product.is_active == True,
                Product.quantity_in_stock <= 0
            )
        ).all()
        
        return [self._to_response(product) for product in products]

    def get_expiring_products(self, days: int = 7) -> List[ProductResponse]:
        """
        Get products expiring within specified days
        """
        from datetime import timedelta
        
        expiry_threshold = datetime.utcnow() + timedelta(days=days)
        
        products = self.db.query(Product).filter(
            and_(
                Product.is_active == True,
                Product.is_perishable == True,
                Product.expiry_date <= expiry_threshold,
                Product.expiry_date >= datetime.utcnow()
            )
        ).all()
        
        return [self._to_response(product) for product in products]

    def _create_stock_transaction(
        self,
        product_id: str,
        transaction_type: TransactionType,
        quantity: int,
        reference_type: str,
        notes: str,
        user_id: str,
        unit_cost: Optional[float] = None
    ):
        """
        Create an inventory transaction record
        """
        transaction = InventoryTransaction(
            product_id=product_id,
            transaction_type=transaction_type,
            quantity=quantity,
            unit_cost=unit_cost,
            reference_type=reference_type,
            notes=notes,
            created_by=user_id
        )
        
        self.db.add(transaction)

    def _to_response(self, product: Product) -> ProductResponse:
        """
        Convert Product model to ProductResponse schema
        """
        return ProductResponse(
            id=product.id,
            name=product.name,
            description=product.description,
            barcode=product.barcode,
            sku=product.sku,
            category=product.category,
            subcategory=product.subcategory,
            brand=product.brand,
            cost_price=product.cost_price,
            selling_price=product.selling_price,
            quantity_in_stock=product.quantity_in_stock,
            min_stock_threshold=product.min_stock_threshold,
            max_stock_threshold=product.max_stock_threshold,
            aisle=product.aisle,
            shelf=product.shelf,
            bin_location=product.bin_location,
            warehouse_id=product.warehouse_id,
            unit_of_measure=product.unit_of_measure,
            weight=product.weight,
            dimensions=product.dimensions,
            is_perishable=product.is_perishable,
            expiry_date=product.expiry_date,
            days_until_expiry_warning=product.days_until_expiry_warning,
            supplier_id=product.supplier_id,
            supplier_sku=product.supplier_sku,
            is_active=product.is_active,
            created_at=product.created_at,
            updated_at=product.updated_at,
            created_by=product.created_by,
            stock_status=product.stock_status,
            is_low_stock=product.is_low_stock,
            is_out_of_stock=product.is_out_of_stock
        ) 