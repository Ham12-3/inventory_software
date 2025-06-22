#!/usr/bin/env python3
"""
Run Backend Script - Start the FastAPI server
Use this after running setup_backend.py
"""

import os
import sys
import subprocess
from pathlib import Path

def find_python_executable():
    """Find the Python executable in virtual environment"""
    backend_dir = Path('./app/backend')
    venv_dir = backend_dir / 'venv'
    
    if not venv_dir.exists():
        print("❌ Virtual environment not found!")
        print("Please run: python setup_backend.py")
        return None
    
    if os.name == 'nt':  # Windows
        python_exe = venv_dir / 'Scripts' / 'python.exe'
    else:  # Unix/Linux/macOS
        python_exe = venv_dir / 'bin' / 'python'
    
    if not python_exe.exists():
        print("❌ Python executable not found in virtual environment!")
        return None
    
    return python_exe

def check_environment():
    """Check if environment is properly set up"""
    backend_dir = Path('./app/backend')
    
    # Check if main.py exists
    if not (backend_dir / 'main.py').exists():
        print("❌ main.py not found in app/backend/")
        return False
    
    # Check if .env exists (optional)
    env_file = backend_dir / '.env'
    if env_file.exists():
        print("✅ Environment file found")
    else:
        print("⚠️  No .env file found, using defaults")
    
    return True

def start_server(python_exe):
    """Start the FastAPI development server"""
    backend_dir = Path('./app/backend')
    
    print("🚀 Starting FastAPI Backend Server...")
    print("="*50)
    print("📡 Backend URL: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("🛑 Press Ctrl+C to stop the server")
    print("="*50)
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Start the server using uvicorn
    try:
        subprocess.run([
            str(python_exe), '-m', 'uvicorn',
            'main:app',
            '--host', '0.0.0.0',
            '--port', '8000',
            '--reload'
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")

def main():
    """Main function"""
    print("🔧 Starting Inventory Management Backend...")
    
    # Check if setup was run
    python_exe = find_python_executable()
    if not python_exe:
        return False
    
    # Check environment
    if not check_environment():
        return False
    
    # Start server
    start_server(python_exe)
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 