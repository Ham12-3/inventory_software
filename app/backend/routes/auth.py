from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional

from database.connection import get_db
from models.schemas import LoginRequest, LoginResponse, SignupRequest, MessageResponse
from services.user_service import UserService

router = APIRouter()
security = HTTPBearer()

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return access token
    """
    user_service = UserService(db)
    
    # Authenticate user with database
    user = user_service.authenticate_user(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email
    )

@router.post("/signup", response_model=MessageResponse)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Create a new user account in database
    """
    user_service = UserService(db)
    
    try:
        # Create user in database with hashed password
        user = user_service.create_user(
            email=request.email,
            password=request.password
        )
        
        return MessageResponse(
            message=f"Account created successfully for {user.email}. You can now log in."
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account. Please try again."
        )

@router.get("/me")
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user from database
    """
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        
        if email is None or user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Verify user still exists and is active
        user_service = UserService(db)
        user = user_service.get_user_by_id(user_id)
        
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User account not found or inactive")
            
        return {
            "user_id": user.id, 
            "email": user.email,
            "is_admin": user.is_admin,
            "created_at": user.created_at
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/create-admin")
async def create_admin_user(db: Session = Depends(get_db)):
    """
    Create default admin user (for development)
    """
    user_service = UserService(db)
    
    try:
        admin = user_service.create_default_admin()
        return MessageResponse(
            message=f"Admin user created: {admin.email}"
        )
    except ValueError:
        return MessageResponse(
            message="Admin user already exists"
        ) 