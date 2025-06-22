from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
import os
import warnings
from typing import Generator

# Database configuration with smart fallback
def get_database_url():
    """
    Get database URL with intelligent fallback handling
    """
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if DATABASE_URL:
        # Check if it's a PostgreSQL URL
        if DATABASE_URL.startswith(('postgresql://', 'postgres://')):
            try:
                # Test if PostgreSQL dependencies are available
                import psycopg2
                print("✅ PostgreSQL driver (psycopg2) available")
                return DATABASE_URL
            except ImportError:
                try:
                    import asyncpg
                    # Convert to asyncpg format if needed
                    if DATABASE_URL.startswith('postgresql://'):
                        DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')
                    print("✅ PostgreSQL driver (asyncpg) available")
                    return DATABASE_URL
                except ImportError:
                    warnings.warn(
                        "PostgreSQL URL provided but no PostgreSQL drivers available. "
                        "Falling back to SQLite. Install psycopg2-binary or asyncpg for PostgreSQL support."
                    )
                    return "sqlite:///./inventory.db"
        else:
            return DATABASE_URL
    
    # Default to SQLite for easy development
    print("📁 Using SQLite database for development")
    return "sqlite:///./inventory.db"

DATABASE_URL = get_database_url()

# Create SQLAlchemy engine with appropriate settings
def create_db_engine():
    """
    Create database engine with appropriate settings based on database type
    """
    if DATABASE_URL.startswith('sqlite'):
        # SQLite-specific settings
        return create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            echo=False,  # Set to True for SQL query logging in development
            connect_args={"check_same_thread": False}  # Required for SQLite
        )
    else:
        # PostgreSQL settings
        return create_engine(
            DATABASE_URL,
            pool_size=20,
            max_overflow=0,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False  # Set to True for SQL query logging in development
        )

engine = create_db_engine()

# Create SessionLocal class
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Database dependency for FastAPI
def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test database connection
def test_db_connection():
    """
    Test if database connection is working
    """
    try:
        db = SessionLocal()
        # Use text() for proper SQL execution
        db.execute(text("SELECT 1"))
        db.close()
        print(f"✅ Database connection successful: {DATABASE_URL.split('://')[0].upper()}")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False 