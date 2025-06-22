// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Import session manager
import { triggerSessionExpired } from '../hooks/useSessionManager';

// Types matching backend schemas
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  cost_price: number;
  selling_price: number;
  quantity_in_stock: number;
  min_stock_threshold: number;
  max_stock_threshold?: number;
  aisle?: string;
  shelf?: string;
  bin_location?: string;
  warehouse_id?: string;
  unit_of_measure: string;
  weight?: number;
  dimensions?: string;
  is_perishable: boolean;
  expiry_date?: string;
  days_until_expiry_warning: number;
  supplier_id?: string;
  supplier_sku?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  stock_status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'NORMAL' | 'OVERSTOCK';
  is_low_stock: boolean;
  is_out_of_stock: boolean;
}

export interface ProductCreateData {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  cost_price: number;
  selling_price: number;
  quantity_in_stock: number;
  min_stock_threshold: number;
  max_stock_threshold?: number;
  aisle?: string;
  shelf?: string;
  bin_location?: string;
  warehouse_id?: string;
  unit_of_measure: string;
  weight?: number;
  dimensions?: string;
  is_perishable: boolean;
  expiry_date?: string;
  days_until_expiry_warning: number;
  supplier_id?: string;
  supplier_sku?: string;
}

export interface ProductListResponse {
  products: Product[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ProductFilters {
  page?: number;
  per_page?: number;
  category?: string;
  subcategory?: string;
  brand?: string;
  supplier_id?: string;
  warehouse_id?: string;
  is_perishable?: boolean;
  stock_status?: string;
  aisle?: string;
  search?: string;
}

export interface DashboardMetrics {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  expiring_soon_count: number;
  total_value: number;
}

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Only add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Handle 401 Unauthorized - show session expired dialog
      if (response.status === 401) {
        console.warn('Authentication failed - showing session expired dialog');
        
        // Trigger the session expired dialog instead of throwing error
        triggerSessionExpired();
        throw new Error('Session expired');
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      
      // Handle different error response formats
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Handle FastAPI validation errors
          const validationErrors = errorData.detail.map((err: { loc: string[]; msg: string }) => 
            `${err.loc.join('.')}: ${err.msg}`
          ).join(', ');
          errorMessage = `Validation errors: ${validationErrors}`;
        } else {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Product Service Class
export class ProductService {
  // Get paginated list of products with filters
  static async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/products?${searchParams.toString()}`;
    return apiRequest<ProductListResponse>(endpoint);
  }

  // Get single product by ID
  static async getProduct(id: string): Promise<Product> {
    return apiRequest<Product>(`/api/products/${id}`);
  }

  // Create new product
  static async createProduct(productData: ProductCreateData): Promise<Product> {
    return apiRequest<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // Update existing product
  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return apiRequest<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Delete product (soft delete)
  static async deleteProduct(id: string): Promise<{ message: string; success: boolean }> {
    return apiRequest<{ message: string; success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Adjust product stock
  static async adjustStock(
    id: string, 
    newQuantity: number, 
    reason: string, 
    notes?: string
  ): Promise<Product> {
    return apiRequest<Product>(`/api/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({
        product_id: id,
        new_quantity: newQuantity,
        reason,
        notes,
      }),
    });
  }

  // Get product by barcode
  static async getProductByBarcode(barcode: string): Promise<Product> {
    return apiRequest<Product>(`/api/products/barcode/${barcode}`);
  }

  // Get product by SKU
  static async getProductBySku(sku: string): Promise<Product> {
    return apiRequest<Product>(`/api/products/sku/${sku}`);
  }

  // Get all categories
  static async getCategories(): Promise<{ categories: Array<{ name: string; subcategories: string[] }> }> {
    return apiRequest<{ categories: Array<{ name: string; subcategories: string[] }> }>('/api/products/categories/list');
  }

  // Get dashboard metrics
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    return apiRequest<DashboardMetrics>('/api/dashboard/metrics');
  }

  // Get low stock items
  static async getLowStockItems(): Promise<{ items: Array<{ id: string; name: string; current_stock: number; min_threshold: number; location?: string }>; total_count: number }> {
    return apiRequest<{ items: Array<{ id: string; name: string; current_stock: number; min_threshold: number; location?: string }>; total_count: number }>('/api/dashboard/low-stock');
  }
}

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Success message helper
export const showSuccessMessage = (message: string) => {
  // For now, just console.log - replace with your toast/notification system
  console.log('✅ Success:', message);
};

// Error message helper
export const showErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  // For now, just console.error - replace with your toast/notification system
  console.error('❌ Error:', message);
}; 