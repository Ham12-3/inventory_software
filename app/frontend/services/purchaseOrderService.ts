// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface Supplier {
  id: string;
  name: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  lead_time_days: number;
  minimum_order_value: number;
  rating: number;
  total_orders: number;
  on_time_delivery_rate: number;
  is_active: boolean;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id?: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_price: number;
  total_price?: number;
  product_name?: string;
  product_sku?: string;
  supplier_sku?: string;
  is_received?: boolean;
  is_quality_checked?: boolean;
  quality_notes?: string;
  received_date?: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  delivery_address?: string;
  delivery_instructions?: string;
  tracking_number?: string;
  reference_number?: string;
  notes?: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderData {
  supplier_id: string;
  expected_delivery_date?: string;
  delivery_address?: string;
  delivery_instructions?: string;
  notes?: string;
  items: {
    product_id: string;
    quantity_ordered: number;
    unit_price: number;
    supplier_sku?: string;
  }[];
}

export interface DeliveryTracking {
  id: string;
  purchase_order_id: string;
  tracking_number?: string;
  carrier?: string;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  shipped_date?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  current_location?: string;
  origin_location?: string;
  destination_location?: string;
  delivered_to?: string;
  delivery_signature?: string;
  delivery_photo_url?: string;
  delivery_notes?: string;
  last_status_update: string;
  status_history?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderSummary {
  total_orders: number;
  pending_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  total_value: number;
  pending_value: number;
}

export interface DeliveryMetrics {
  in_transit_count: number;
  delivered_today: number;
  delayed_deliveries: number;
  average_delivery_time: number;
}

export interface ReorderSuggestion {
  product_id: string;
  product_name: string;
  product_sku: string;
  current_stock: number;
  min_threshold: number;
  suggested_quantity: number;
  supplier?: {
    id: string;
    name: string;
    price: number;
    minimum_order: number;
    lead_time: number;
  };
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Helper function to get current user ID
export const getCurrentUserId = (): string => {
  if (typeof window !== 'undefined') {
    // Try to get user from localStorage first
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) return user.id;
        if (user.email) return user.email; // Fallback to email as ID
      } catch {
        console.warn('Failed to parse user from localStorage');
      }
    }
    
    // Try to decode JWT token to get user info
    const token = getAuthToken();
    if (token) {
      try {
        // Decode JWT payload (simple base64 decode, not verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) return payload.sub; // 'sub' is standard JWT claim for user ID
        if (payload.user_id) return payload.user_id;
        if (payload.email) return payload.email;
      } catch {
        console.warn('Failed to decode JWT token');
      }
    }
  }
  
  // Fallback to a default user ID
  return 'anonymous-user';
};

// Import session manager
import { triggerSessionExpired } from '../hooks/useSessionManager';

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  console.log('🔍 API Request:', { url, method: options.method || 'GET' });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

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
      if (response.status === 401) {
        console.warn('Authentication failed - showing session expired dialog');
        // Trigger the session expired dialog instead of throwing error
        triggerSessionExpired();
        // Return a rejected promise to stop execution
        return Promise.reject(new Error('Session expired'));
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
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
    
    // Enhanced error handling for network issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network Error Details:', {
        url,
        endpoint,
        API_BASE_URL,
        message: 'Backend server might not be running or CORS issue'
      });
      throw new Error(`Network Error: Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend server is running and accessible.`);
    }
    
    throw error;
  }
};

// Purchase Order Service
export class PurchaseOrderService {
  // Supplier methods
  static async getSuppliers(activeOnly: boolean = true): Promise<Supplier[]> {
    const params = new URLSearchParams();
    if (activeOnly) params.append('active_only', 'true');
    
    return apiRequest<Supplier[]>(`/api/purchase-orders/suppliers?${params.toString()}`);
  }

  static async createSupplier(supplierData: Omit<Supplier, 'id' | 'rating' | 'total_orders' | 'on_time_delivery_rate' | 'is_active' | 'is_preferred' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    return apiRequest<Supplier>('/api/purchase-orders/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  static async getSupplier(supplierId: string): Promise<Supplier> {
    return apiRequest<Supplier>(`/api/purchase-orders/suppliers/${supplierId}`);
  }

  // Purchase Order methods
  static async getPurchaseOrders(filters: {
    status?: string;
    supplier_id?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PurchaseOrder[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const result = await apiRequest<PurchaseOrder[]>(`/api/purchase-orders?${params.toString()}`);
    console.log('🔍 Purchase Orders Response:', result);
    
    // Debug: Log the first order to see its structure
    if (result && result.length > 0) {
      console.log('🔍 First Order Structure:', {
        id: result[0].id,
        order_number: result[0].order_number,
        has_items: !!result[0].items,
        items_length: result[0].items?.length,
        has_supplier: !!result[0].supplier,
        supplier_name: result[0].supplier?.name
      });
    }
    
    return result;
  }

  static async createPurchaseOrder(orderData: CreatePurchaseOrderData, createdBy: string): Promise<PurchaseOrder> {
    console.log('🔍 Debug - createdBy value:', createdBy);
    console.log('🔍 Debug - createdBy type:', typeof createdBy);
    console.log('🔍 Debug - createdBy length:', createdBy?.length);
    
    if (!createdBy || createdBy.trim() === '') {
      throw new Error('User ID is required but not found. Please log in again.');
    }
    
    const params = new URLSearchParams();
    params.append('created_by', createdBy);
    
    const url = `/api/purchase-orders?${params.toString()}`;
    console.log('🔍 Debug - Final URL:', url);
    
    return apiRequest<PurchaseOrder>(url, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  static async getPurchaseOrder(orderId: string): Promise<PurchaseOrder> {
    return apiRequest<PurchaseOrder>(`/api/purchase-orders/${orderId}`);
  }

  static async updatePurchaseOrder(orderId: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return apiRequest<PurchaseOrder>(`/api/purchase-orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async approvePurchaseOrder(orderId: string, approvedBy: string): Promise<{ message: string; success: boolean }> {
    const params = new URLSearchParams();
    params.append('approved_by', approvedBy);
    
    return apiRequest<{ message: string; success: boolean }>(`/api/purchase-orders/${orderId}/approve?${params.toString()}`, {
      method: 'POST',
    });
  }

  static async receiveItems(orderId: string, receiveData: {
    items: Array<{
      item_id: string;
      quantity_received: number;
      quality_notes?: string;
    }>;
    received_by: string;
    notes?: string;
  }): Promise<{ message: string; success: boolean; items_processed: number }> {
    return apiRequest<{ message: string; success: boolean; items_processed: number }>(`/api/purchase-orders/${orderId}/receive`, {
      method: 'POST',
      body: JSON.stringify(receiveData),
    });
  }

  // Delivery Tracking methods
  static async getDeliveryTracking(orderId: string): Promise<DeliveryTracking> {
    return apiRequest<DeliveryTracking>(`/api/purchase-orders/${orderId}/tracking`);
  }

  static async updateDeliveryTracking(orderId: string, trackingData: Partial<DeliveryTracking>): Promise<DeliveryTracking> {
    return apiRequest<DeliveryTracking>(`/api/purchase-orders/${orderId}/tracking`, {
      method: 'PUT',
      body: JSON.stringify(trackingData),
    });
  }

  // Dashboard/Summary methods
  static async getPurchaseOrderSummary(): Promise<PurchaseOrderSummary> {
    return apiRequest<PurchaseOrderSummary>('/api/purchase-orders/summary/orders');
  }

  static async getDeliveryMetrics(): Promise<DeliveryMetrics> {
    return apiRequest<DeliveryMetrics>('/api/purchase-orders/summary/deliveries');
  }

  static async getReorderSuggestions(limit: number = 10): Promise<{ suggestions: ReorderSuggestion[]; total_count: number }> {
    return apiRequest<{ suggestions: ReorderSuggestion[]; total_count: number }>(`/api/purchase-orders/products/reorder-suggestions?limit=${limit}`);
  }
}

// Success/Error message helpers
export const showSuccessMessage = (message: string) => {
  console.log('✅ Success:', message);
};

export const showErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('❌ Error:', message);
}; 