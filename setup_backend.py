#!/usr/bin/env python3
"""
Backend Setup Script for Inventory Management System
This script sets up the Python virtual environment and installs dependencies.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(cmd, cwd=None, check=True):
    """Run a command and return the result"""
    print(f"🔄 Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, check=check, cwd=cwd, 
                              capture_output=True, text=True)
        if result.stdout:
            print(result.stdout.strip())
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running command: {cmd}")
        print(f"Error: {e}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        if check:
            sys.exit(1)
        return e

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    if version.major == 3 and version.minor >= 13:
        print("⚠️  Python 3.13 detected - some packages may need special handling")
        return True
    
    return False

def setup_virtual_environment():
    """Create and setup virtual environment"""
    backend_dir = Path("app/backend").resolve()
    venv_path = backend_dir / "venv"
    
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        sys.exit(1)
    
    # Create virtual environment
    if not venv_path.exists():
        print("📦 Creating virtual environment...")
        run_command(f'"{sys.executable}" -m venv "{venv_path}"')
    else:
        print("✅ Virtual environment already exists")
    
    return venv_path

def get_activation_script(venv_path):
    """Get the appropriate activation script for the platform"""
    if platform.system() == "Windows":
        return venv_path / "Scripts" / "activate.bat"
    else:
        return venv_path / "bin" / "activate"

def install_dependencies(venv_path, python_313=False):
    """Install Python dependencies"""
    backend_dir = Path("app/backend").resolve()
    
    # Get the python executable in the virtual environment
    if platform.system() == "Windows":
        python_exe = venv_path / "Scripts" / "python.exe"
        pip_exe = venv_path / "Scripts" / "pip.exe"
    else:
        python_exe = venv_path / "bin" / "python"
        pip_exe = venv_path / "bin" / "pip"
    
    # Verify executables exist
    if not python_exe.exists():
        print(f"❌ Python executable not found: {python_exe}")
        sys.exit(1)
    
    # Upgrade pip first
    print("📦 Upgrading pip...")
    run_command(f'"{python_exe}" -m pip install --upgrade pip', cwd=backend_dir)
    
    # Install core dependencies
    print("📦 Installing core dependencies...")
    run_command(f'"{python_exe}" -m pip install -r requirements.txt', cwd=backend_dir)
    
    # Handle PostgreSQL dependencies for Python 3.13
    if python_313:
        print("\n🔧 Python 3.13 detected - handling PostgreSQL dependencies...")
        print("💡 Installing without PostgreSQL support first (using SQLite)")
        print("   You can add PostgreSQL support later if needed.")
        
        # Try to install a compatible psycopg2 version
        print("\n🔄 Attempting to install PostgreSQL support...")
        result = run_command(f'"{python_exe}" -m pip install psycopg2-binary==2.9.7', 
                           cwd=backend_dir, check=False)
        
        if result.returncode != 0:
            print("⚠️  PostgreSQL driver installation failed (this is OK for development)")
            print("   The system will use SQLite database instead.")
            print("   To add PostgreSQL support later, try:")
            print(f'   "{python_exe}" -m pip install psycopg2-binary==2.9.7')
            print("   - Or install PostgreSQL development libraries and compile from source")
        else:
            print("✅ PostgreSQL driver installed successfully!")

def create_env_file():
    """Create environment file if it doesn't exist"""
    backend_dir = Path("app/backend").resolve()
    env_file = backend_dir / ".env"
    env_example = backend_dir / "env.example"
    
    if not env_file.exists() and env_example.exists():
        print("📄 Creating .env file from template...")
        with open(env_example, 'r') as src, open(env_file, 'w') as dst:
            dst.write(src.read())
        print("✅ .env file created")
    elif env_file.exists():
        print("✅ .env file already exists")

def test_installation(venv_path):
    """Test if the installation was successful"""
    backend_dir = Path("app/backend").resolve()
    
    if platform.system() == "Windows":
        python_exe = venv_path / "Scripts" / "python.exe"
    else:
        python_exe = venv_path / "bin" / "python"
    
    print("\n🧪 Testing installation...")
    
    # Test basic imports
    test_cmd = f'"{python_exe}" -c "import fastapi, sqlalchemy, uvicorn; print(\'✅ Core dependencies OK\')"'
    result = run_command(test_cmd, cwd=backend_dir, check=False)
    
    if result.returncode != 0:
        print("❌ Basic dependency test failed")
        return False
    
    # Test database connection
    test_cmd = f'"{python_exe}" -c "from database.connection import test_db_connection; test_db_connection()"'
    result = run_command(test_cmd, cwd=backend_dir, check=False)
    
    return result.returncode == 0

def main():
    """Main setup function"""
    print("🚀 Setting up Inventory Management System Backend")
    print("=" * 50)
    
    # Check Python version
    python_313 = check_python_version()
    
    # Setup virtual environment
    venv_path = setup_virtual_environment()
    
    # Install dependencies
    install_dependencies(venv_path, python_313)
    
    # Create environment file
    create_env_file()
    
    # Test installation
    success = test_installation(venv_path)
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Backend setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Run: python run_backend.py")
        print("2. Open: http://localhost:8000/docs")
        print("3. Start the frontend in another terminal")
        
        activation_script = get_activation_script(venv_path)
        print(f"\n💡 To manually activate the virtual environment:")
        if platform.system() == "Windows":
            print(f"   {activation_script}")
        else:
            print(f"   source {activation_script}")
    else:
        print("⚠️  Setup completed with warnings")
        print("   The system will use SQLite database")
        print("   You can still run the backend with: python run_backend.py")

if __name__ == "__main__":
    main() 