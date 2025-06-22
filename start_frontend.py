#!/usr/bin/env python3
"""
Frontend Startup Script for Inventory Management System
This script starts the Next.js development server
"""

import os
import sys
import subprocess
from pathlib import Path

def check_node():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        print(f"✅ Node.js version: {result.stdout.strip()}")
        return True
    except FileNotFoundError:
        print("❌ Node.js is not installed")
        print("Please install Node.js from: https://nodejs.org/")
        return False

def install_dependencies():
    """Install npm dependencies"""
    print("📦 Installing frontend dependencies...")
    os.chdir('./app/frontend')
    
    # Check if node_modules exists
    if not Path('./node_modules').exists():
        print("Installing npm packages...")
        subprocess.run(['npm', 'install'], check=True)
        print("✅ Dependencies installed successfully")
    else:
        print("✅ Dependencies already installed")

def start_frontend():
    """Start the Next.js development server"""
    print("🚀 Starting Next.js development server...")
    print("🌐 Frontend will be available at: http://localhost:3000")
    print("📱 Inventory page: http://localhost:3000/inventory")
    print("\n" + "="*50)
    
    # Start Next.js development server
    subprocess.run(['npm', 'run', 'dev'])

if __name__ == "__main__":
    print("🔧 Setting up Inventory Management Frontend...")
    print("="*50)
    
    try:
        if not check_node():
            sys.exit(1)
            
        install_dependencies()
        start_frontend()
        
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1) 