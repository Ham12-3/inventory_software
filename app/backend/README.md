# AI-Powered Inventory Management System - Backend

FastAPI backend for the supermarket inventory management system with PostgreSQL database and comprehensive product CRUD operations.

## 🚀 **Features**

### ✅ **Implemented**
- **Product Management**: Full CRUD operations for products
- **Inventory Tracking**: Stock levels, location tracking, expiry dates
- **Search & Filtering**: Advanced product search and category filtering
- **Stock Management**: Automated stock level calculations and alerts
- **Transaction Logging**: All inventory movements tracked
- **Database Models**: Complete SQLAlchemy models with relationships
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

### 🔄 **Coming Soon**
- Supplier management
- Inventory transaction history
- AI-powered demand forecasting
- Anomaly detection
- Barcode scanning integration

## 🏗️ **Architecture**

```
backend/
├── models/           # Database models and schemas
│   ├── product.py    # SQLAlchemy models
│   └── schemas.py    # Pydantic schemas
├── routes/           # API endpoints
│   ├── products.py   # Product CRUD operations
│   ├── dashboard.py  # Dashboard metrics
│   ├── suppliers.py  # Supplier management (placeholder)
│   └── inventory.py  # Inventory transactions (placeholder)
├── services/         # Business logic
│   └── product_service.py  # Product service layer
├── database/         # Database configuration
│   └── connection.py # Database connection and session management
├── main.py          # FastAPI application entry point
└── requirements.txt # Python dependencies
```

## 🛠️ **Setup Instructions**

### 1. **Install Dependencies**
```bash
cd app/backend
pip install -r requirements.txt
```

### 2. **Environment Configuration**
Create a `.env` file from the example:
```bash
cp env.example .env
```

Edit `.env` with your database configuration:
```env
# For local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db

# For Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 3. **Database Setup**

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL and create database
createdb inventory_db
```

#### Option B: Supabase (Recommended)
1. Create a Supabase project at https://supabase.com
2. Go to Settings > Database and copy your connection string
3. Update DATABASE_URL in your `.env` file

### 4. **Run the Application**
```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 📚 **API Endpoints**

### **Products** (`/api/products`)
- `GET /` - List products with pagination and filters
- `POST /` - Create new product
- `GET /{product_id}` - Get product by ID
- `PUT /{product_id}` - Update product
- `DELETE /{product_id}` - Delete product (soft delete)
- `PATCH /{product_id}/stock` - Adjust stock quantity
- `GET /barcode/{barcode}` - Get product by barcode
- `GET /sku/{sku}` - Get product by SKU
- `GET /categories/list` - Get all categories

### **Dashboard** (`/api/dashboard`)
- `GET /metrics` - Get dashboard metrics
- `GET /low-stock` - Get low stock items

### **Health Check**
- `GET /health` - API health status

## 🔍 **API Usage Examples**

### Create a Product
```bash
curl -X POST "http://localhost:8000/api/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "name": "Whole Milk 1L",
    "sku": "MILK-001",
    "category": "Dairy",
    "cost_price": 1.00,
    "selling_price": 1.29,
    "quantity_in_stock": 50,
    "min_stock_threshold": 20,
    "aisle": "A1",
    "shelf": "S3",
    "is_perishable": true
  }'
```

### Get Products with Filters
```bash
curl "http://localhost:8000/api/products?category=Dairy&search=milk&page=1&per_page=20" \
  -H "Authorization: Bearer your-token"
```

### Get Dashboard Metrics
```bash
curl "http://localhost:8000/api/dashboard/metrics" \
  -H "Authorization: Bearer your-token"
```

## 🗄️ **Database Schema**

### Products Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Product name |
| sku | String | Stock keeping unit (unique) |
| barcode | String | Barcode (unique, optional) |
| category | String | Product category |
| quantity_in_stock | Integer | Current stock level |
| min_stock_threshold | Integer | Low stock alert threshold |
| selling_price | Float | Retail price |
| cost_price | Float | Cost price |
| aisle | String | Aisle location |
| shelf | String | Shelf location |
| is_perishable | Boolean | Has expiry date |
| expiry_date | DateTime | Expiry date (if perishable) |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

## 🔐 **Authentication**

Currently using simplified authentication for development. 

**Production Setup:**
- Integrate with Supabase JWT verification
- Add role-based access control
- Implement API key authentication for external systems

## 🧪 **Testing**

```bash
# Run tests (when implemented)
pytest

# Test API endpoints
curl http://localhost:8000/health
```

## 🚀 **Deployment**

### Docker Deployment
```bash
# Build image
docker build -t inventory-api .

# Run container
docker run -p 8000:8000 --env-file .env inventory-api
```

### Cloud Deployment
- **Railway**: Easy deployment with PostgreSQL addon
- **Fly.io**: Global deployment with auto-scaling
- **Heroku**: Simple git-based deployment

## 🔧 **Configuration**

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Local postgres |
| JWT_SECRET_KEY | JWT signing secret | - |
| DEBUG | Debug mode | True |
| CORS_ORIGINS | Allowed CORS origins | localhost:3000 |

## 📈 **Monitoring & Logging**

- **Health Check**: `/health` endpoint for uptime monitoring
- **Database Logging**: Enable with `echo=True` in database config
- **API Logging**: Built-in FastAPI request logging
- **Error Tracking**: Ready for Sentry integration

## 🤝 **Contributing**

1. Follow the existing code structure
2. Add tests for new features
3. Update API documentation
4. Follow Python PEP 8 style guidelines

## 📝 **Next Steps**

1. **Connect Frontend**: Integrate with Next.js frontend
2. **Add Authentication**: Implement Supabase JWT verification
3. **Add Suppliers**: Complete supplier management
4. **AI Integration**: Add demand forecasting models
5. **Mobile API**: Add mobile-specific endpoints 