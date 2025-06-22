from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.schemas import DashboardMetrics, LowStockResponse
from services.product_service import ProductService

router = APIRouter()

@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Get dashboard metrics for the main dashboard page
    """
    try:
        service = ProductService(db)
        
        # Get counts
        all_products, total_products = service.get_products_paginated(page=1, per_page=1)
        low_stock_products = service.get_low_stock_products()
        out_of_stock_products = service.get_out_of_stock_products()
        expiring_products = service.get_expiring_products(days=7)
        
        # Calculate total inventory value
        all_products_full, _ = service.get_products_paginated(page=1, per_page=10000)  # Get all for value calc
        total_value = sum(p.quantity_in_stock * p.cost_price for p in all_products_full)
        
        return DashboardMetrics(
            total_products=total_products,
            low_stock_count=len(low_stock_products),
            out_of_stock_count=len(out_of_stock_products),
            expiring_soon_count=len(expiring_products),
            total_value=total_value
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard metrics: {str(e)}"
        )

@router.get("/low-stock", response_model=LowStockResponse)
async def get_low_stock_items(db: Session = Depends(get_db)):
    """
    Get detailed list of low stock items
    """
    try:
        service = ProductService(db)
        low_stock_products = service.get_low_stock_products()
        
        items = []
        for product in low_stock_products:
            location = f"{product.aisle}-{product.shelf}" if product.aisle and product.shelf else product.aisle
            items.append({
                "id": product.id,
                "name": product.name,
                "current_stock": product.quantity_in_stock,
                "min_threshold": product.min_stock_threshold,
                "location": location
            })
        
        return LowStockResponse(
            items=items,
            total_count=len(items)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch low stock items: {str(e)}"
        ) 