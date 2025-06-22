from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.schemas import MessageResponse

router = APIRouter()

@router.get("/transactions")
async def get_inventory_transactions(db: Session = Depends(get_db)):
    """
    Get inventory transaction history - placeholder for future implementation
    """
    return {"transactions": [], "message": "Inventory transaction history coming soon"}

@router.post("/adjust")
async def create_inventory_adjustment(db: Session = Depends(get_db)):
    """
    Create inventory adjustment - placeholder for future implementation
    """
    return MessageResponse(message="Inventory adjustments coming soon") 