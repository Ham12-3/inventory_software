from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.schemas import MessageResponse

router = APIRouter()

@router.get("/")
async def get_suppliers(db: Session = Depends(get_db)):
    """
    Get list of suppliers - placeholder for future implementation
    """
    return {"suppliers": [], "message": "Supplier management coming soon"}

@router.post("/")
async def create_supplier(db: Session = Depends(get_db)):
    """
    Create supplier - placeholder for future implementation
    """
    return MessageResponse(message="Supplier creation coming soon") 