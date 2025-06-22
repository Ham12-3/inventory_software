#!/usr/bin/env python3
"""
Backend Startup Script for Inventory Management System
This script sets up the environment and starts the FastAPI server
"""

import os
import sys
import subprocess
import sqlite3
from pathlib import Path

def setup_environment():
    """Set up environment variables for development"""
    # Set environment variables for SQLite (easier than PostgreSQL)
    os.environ['DATABASE_URL'] = 'sqlite:///./inventory.db'
    os.environ['JWT_SECRET_KEY'] = 'dev-secret-key-change-in-production-123456789'
    os.environ['JWT_ALGORITHM'] = 'HS256'
    os.environ['JWT_EXPIRE_MINUTES'] = '30'
    os.environ['APP_ENV'] = 'development'
    os.environ['DEBUG'] = 'True'
    
    print("✅ Environment variables configured")

def check_dependencies():
    """Check if required Python packages are installed"""
    required_packages = [
        'fastapi', 'uvicorn', 'sqlalchemy', 'pydantic', 'python-dotenv'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {missing_packages}")
        print("Installing missing packages...")
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', 
            'fastapi', 'uvicorn[standard]', 'sqlalchemy', 'pydantic', 
            'python-dotenv', 'python-multipart'
        ])
        print("✅ Packages installed successfully")
    else:
        print("✅ All required packages are installed")

def create_sqlite_db():
    """Create SQLite database if it doesn't exist"""
    db_path = Path('./app/backend/inventory.db')
    if not db_path.exists():
        # Create empty database
        conn = sqlite3.connect(db_path)
        conn.close()
        print("✅ SQLite database created")
    else:
        print("✅ Database already exists")

def start_server():
    """Start the FastAPI development server"""
    os.chdir('./app/backend')
    print("🚀 Starting FastAPI server...")
    print("📡 Backend will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("\n" + "="*50)
    
    # Start uvicorn server
    subprocess.run([
        sys.executable, '-m', 'uvicorn', 
        'main:app', 
        '--host', '0.0.0.0', 
        '--port', '8000', 
        '--reload'
    ])

if __name__ == "__main__":
    print("🔧 Setting up Inventory Management Backend...")
    print("="*50)
    
    try:
        setup_environment()
        check_dependencies()
        create_sqlite_db()
        start_server()
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1) 