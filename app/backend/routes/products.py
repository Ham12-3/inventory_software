from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import math

from database.connection import get_db
from models.product import Product
from models.schemas import (
    ProductCreate, 
    ProductUpdate, 
    ProductResponse, 
    ProductListResponse,
    ProductFilter,
    StockAdjustment,
    MessageResponse
)
from services.product_service import ProductService

router = APIRouter()

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new product in the inventory
    """
    try:
        service = ProductService(db)
        
        # Check if SKU already exists
        if service.get_product_by_sku(product.sku):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product.sku}' already exists"
            )
        
        # Check if barcode already exists (if provided)
        if product.barcode and service.get_product_by_barcode(product.barcode):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with barcode '{product.barcode}' already exists"
            )
        
        db_product = service.create_product(product, "user-123")  # Mock user ID for now
        return db_product
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )

@router.get("/", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    subcategory: Optional[str] = Query(None, description="Filter by subcategory"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    supplier_id: Optional[str] = Query(None, description="Filter by supplier"),
    warehouse_id: Optional[str] = Query(None, description="Filter by warehouse"),
    is_perishable: Optional[bool] = Query(None, description="Filter by perishable status"),
    stock_status: Optional[str] = Query(None, description="Filter by stock status"),
    aisle: Optional[str] = Query(None, description="Filter by aisle"),
    search: Optional[str] = Query(None, description="Search in name, description, barcode, SKU"),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of products with optional filtering and search
    """
    try:
        service = ProductService(db)
        
        # Create filter object
        filters = ProductFilter(
            category=category,
            subcategory=subcategory,
            brand=brand,
            supplier_id=supplier_id,
            warehouse_id=warehouse_id,
            is_perishable=is_perishable,
            stock_status=stock_status,
            aisle=aisle,
            search=search
        )
        
        products, total_count = service.get_products_paginated(
            page=page,
            per_page=per_page,
            filters=filters
        )
        
        total_pages = math.ceil(total_count / per_page)
        
        return ProductListResponse(
            products=products,
            total_count=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch products: {str(e)}"
        )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific product by ID
    """
    service = ProductService(db)
    product = service.get_product(product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a product's information
    """
    try:
        service = ProductService(db)
        
        # Check if product exists
        existing_product = service.get_product(product_id)
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID '{product_id}' not found"
            )
        
        # Check for duplicate barcode if updating barcode
        if product_update.barcode and product_update.barcode != existing_product.barcode:
            if service.get_product_by_barcode(product_update.barcode):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product with barcode '{product_update.barcode}' already exists"
                )
        
        updated_product = service.update_product(product_id, product_update)
        return updated_product
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product: {str(e)}"
        )

@router.delete("/{product_id}", response_model=MessageResponse)
async def delete_product(
    product_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a product (soft delete - marks as inactive)
    """
    try:
        service = ProductService(db)
        
        if not service.get_product(product_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID '{product_id}' not found"
            )
        
        service.delete_product(product_id)
        return MessageResponse(message=f"Product '{product_id}' deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete product: {str(e)}"
        )

@router.patch("/{product_id}/stock", response_model=ProductResponse)
async def adjust_stock(
    product_id: str,
    adjustment: StockAdjustment,
    db: Session = Depends(get_db)
):
    """
    Adjust product stock quantity
    """
    try:
        service = ProductService(db)
        
        if not service.get_product(product_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID '{product_id}' not found"
            )
        
        updated_product = service.adjust_stock(
            product_id, 
            adjustment.new_quantity, 
            adjustment.reason,
            "user-123",  # Mock user ID for now
            adjustment.notes
        )
        
        return updated_product
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to adjust stock: {str(e)}"
        )

@router.get("/barcode/{barcode}", response_model=ProductResponse)
async def get_product_by_barcode(
    barcode: str,
    db: Session = Depends(get_db)
):
    """
    Get product by barcode (for barcode scanning)
    """
    service = ProductService(db)
    product = service.get_product_by_barcode(barcode)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with barcode '{barcode}' not found"
        )
    
    return product

@router.get("/sku/{sku}", response_model=ProductResponse)
async def get_product_by_sku(
    sku: str,
    db: Session = Depends(get_db)
):
    """
    Get product by SKU
    """
    service = ProductService(db)
    product = service.get_product_by_sku(sku)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with SKU '{sku}' not found"
        )
    
    return product

@router.get("/categories/list")
async def get_categories(
    db: Session = Depends(get_db)
):
    """
    Get list of all product categories and subcategories
    """
    try:
        service = ProductService(db)
        categories = service.get_categories()
        return {"categories": categories}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch categories: {str(e)}"
        ) 