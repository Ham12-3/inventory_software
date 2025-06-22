# 🚀 Complete Setup Guide - AI-Powered Inventory Management System

## 📋 Prerequisites

1. **Node.js** (v16 or higher) - for Next.js frontend
2. **Python** (v3.8 or higher) - for FastAPI backend
3. **PostgreSQL** (v12 or higher) - for database

## 🗄️ Database Setup

### Option A: Local PostgreSQL (Recommended for Development)

#### 1. Install PostgreSQL
**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Run installer and set password for `postgres` user

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 2. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE inventory_db;

# Create user (optional)
CREATE USER inventory_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO inventory_user;

# Exit
\q
```

#### 3. Configure Environment
Create `app/backend/.env` file:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db

# Or if you created a specific user:
# DATABASE_URL=postgresql://inventory_user:your_password@localhost:5432/inventory_db

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# Application Configuration
APP_ENV=development
DEBUG=True
```

### Option B: Supabase (Cloud Database)

1. **Create Supabase Project**: https://supabase.com/
2. **Get Database URL** from Project Settings → Database
3. **Update `.env`**:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

## 🏃‍♂️ Running the System

### Step 1: Start the Backend (FastAPI)

```bash
# Navigate to backend directory
cd app/backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

**Backend will be available at:** `http://localhost:8000`
- **API Documentation:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

### Step 2: Start the Frontend (Next.js)

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd app/frontend

# Install dependencies (if not done already)
npm install

# Start development server
npm run dev
```

**Frontend will be available at:** `http://localhost:3000`

## 🔧 Verification Steps

### 1. Check Backend Health
Visit: `http://localhost:8000/health`
Should return:
```json
{
  "status": "healthy",
  "message": "AI-Powered Inventory Management API is running",
  "version": "1.0.0"
}
```

### 2. Check Database Tables
The backend automatically creates tables on startup. Check logs for:
```
✅ Database tables created successfully
```

### 3. Test Frontend
1. Visit: `http://localhost:3000/inventory`
2. Try adding a product (click "Add Product" button)
3. Test edit and delete functionality

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
# Windows: Check Services → PostgreSQL
# macOS: brew services list | grep postgresql
# Linux: sudo systemctl status postgresql

# Test connection manually
psql -U postgres -d inventory_db
```

### Backend Issues
```bash
# Check Python version
python --version

# Check if all dependencies installed
pip list

# Check environment variables
# Make sure .env file exists in app/backend/
```

### Frontend Issues
```bash
# Check Node.js version
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📱 API Endpoints Available

Once backend is running, you can test these endpoints:

- **GET** `/health` - Health check
- **GET** `/api/products` - List products
- **POST** `/api/products` - Create product
- **PUT** `/api/products/{id}` - Update product
- **DELETE** `/api/products/{id}` - Delete product
- **GET** `/api/dashboard/metrics` - Dashboard metrics

## 🎯 Quick Test Commands

### Test Backend API
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test products endpoint (requires auth header)
curl -H "Authorization: Bearer test-token" http://localhost:8000/api/products
```

### Database Quick Commands
```sql
-- Check if tables were created
\dt

-- Check products table
SELECT * FROM products LIMIT 5;

-- Check table structure
\d products
```

## 🔐 Authentication Note

Currently using **mock authentication** for development. The system accepts any Bearer token. For production, you'll need to integrate with Supabase JWT verification.

## ✅ Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `inventory_db` created
- [ ] Backend `.env` file configured
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Can access inventory page
- [ ] Add/Edit/Delete modals working
- [ ] API endpoints responding correctly 