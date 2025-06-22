from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from routes import products, suppliers, inventory, dashboard, auth, purchase_orders
from database.connection import engine, get_db
from models.product import Base as ProductBase
from models.user import Base as UserBase

# Load environment variables
load_dotenv()

security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    ProductBase.metadata.create_all(bind=engine)
    UserBase.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
    
    # Create default admin user
    try:
        from services.user_service import UserService
        db = next(get_db())
        user_service = UserService(db)
        admin = user_service.create_default_admin()
        print(f"✅ Default admin user ensured: {admin.email}")
        db.close()
    except Exception as e:
        print(f"⚠️ Admin user setup: {e}")
    
    yield
    # Shutdown: Add cleanup code here if needed
    print("🔄 Application shutting down")

# Initialize FastAPI app with lifespan events
app = FastAPI(
    title="AI-Powered Inventory Management System",
    description="FastAPI backend for supermarket inventory management with AI insights",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development server
        "http://127.0.0.1:3000",
        "https://your-frontend-domain.com"  # Add your production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Authentication dependency (simplified for now)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify JWT token from our authentication system
    """
    from jose import JWTError, jwt
    
    try:
        # Use the same SECRET_KEY as in auth.py
        SECRET_KEY = "your-secret-key-change-in-production"
        ALGORITHM = "HS256"
        
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        return {"user_id": user_id, "email": email}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "message": "AI-Powered Inventory Management API is running",
        "version": "1.0.0"
    }

# Include route modules
# Auth routes (no authentication required)
app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"]
)

app.include_router(
    products.router,
    prefix="/api/products",
    tags=["Products"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    suppliers.router,
    prefix="/api/suppliers", 
    tags=["Suppliers"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    inventory.router,
    prefix="/api/inventory",
    tags=["Inventory"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    dashboard.router,
    prefix="/api/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    purchase_orders.router,
    prefix="/api/purchase-orders",
    tags=["Purchase Orders"],
    dependencies=[Depends(get_current_user)]
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to AI-Powered Inventory Management System API",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 