import { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Import modals and services
import AddProductModal, { ProductFormData } from '../components/inventory/AddProductModal';
import EditProductModal from '../components/inventory/EditProductModal';
import DeleteProductModal from '../components/inventory/DeleteProductModal';
import { 
  ProductService, 
  Product, 
  ProductFilters, 
  showSuccessMessage, 
  showErrorMessage 
} from '../services/productService';
import { formatPrice } from '@/lib/currency';
import { useAuth } from '../hooks/useAuth';
import { useSessionManager } from '../hooks/useSessionManager';
import SessionExpiredDialog from '../components/ui/session-expired-dialog';

// Mock data can be defined outside the component since it doesn't change
const getMockProducts = (): Product[] => [
  {
    id: '1',
    name: 'Whole Milk 1L',
    sku: 'MILK-001',
    category: 'Dairy',
    quantity_in_stock: 45,
    min_stock_threshold: 20,
    selling_price: 1.29,
    cost_price: 0.89,
    aisle: 'A1',
    shelf: 'S3',
    stock_status: 'NORMAL',
    is_perishable: true,
    expiry_date: '2024-12-15',
    unit_of_measure: 'liters',
    days_until_expiry_warning: 7,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_low_stock: false,
    is_out_of_stock: false
  },
  {
    id: '2',
    name: 'Bread White Sliced',
    sku: 'BREAD-001',
    category: 'Bakery',
    quantity_in_stock: 8,
    min_stock_threshold: 15,
    selling_price: 2.50,
    cost_price: 1.20,
    aisle: 'B2',
    shelf: 'S1',
    stock_status: 'LOW_STOCK',
    is_perishable: true,
    expiry_date: '2024-11-20',
    unit_of_measure: 'pieces',
    days_until_expiry_warning: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_low_stock: true,
    is_out_of_stock: false
  },
  {
    id: '3',
    name: 'Bananas',
    sku: 'FRUIT-001',
    category: 'Produce',
    quantity_in_stock: 0,
    min_stock_threshold: 10,
    selling_price: 0.99,
    cost_price: 0.45,
    aisle: 'C1',
    shelf: 'S2',
    stock_status: 'OUT_OF_STOCK',
    is_perishable: true,
    expiry_date: '2024-11-18',
    unit_of_measure: 'kg',
    days_until_expiry_warning: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_low_stock: false,
    is_out_of_stock: true
  }
];

const InventoryPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    showSessionExpiredDialog, 
    handleRefresh, 
    handleLoginRedirect 
  } = useSessionManager();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage] = useState(1); // TODO: Add pagination controls
  const [, setTotalPages] = useState(1); // TODO: Add pagination controls
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load products from API
  const loadProducts = useCallback(async (filters: ProductFilters = {}) => {
    setLoading(true);
    try {
      const response = await ProductService.getProducts({
        page: currentPage,
        per_page: 20,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        ...filters
      });
      
      setProducts(response.products);
      setTotalPages(response.total_pages);
    } catch (error) {
      showErrorMessage(error);
      // Fallback to mock data if API fails
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Modal handlers
  const handleAddProduct = async (productData: ProductFormData) => {
    try {
      const newProduct = await ProductService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      showSuccessMessage('Product added successfully!');
      setShowAddModal(false);
    } catch (error) {
      showErrorMessage(error);
    }
  };

  const handleEditProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await ProductService.updateProduct(productId, updates);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      showSuccessMessage('Product updated successfully!');
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error) {
      showErrorMessage(error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await ProductService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      showSuccessMessage('Product deleted successfully!');
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      showErrorMessage(error);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800';
      case 'LOW_STOCK':
        return 'bg-yellow-100 text-yellow-800';
      case 'NORMAL':
        return 'bg-green-100 text-green-800';
      case 'OVERSTOCK':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockIcon = (status: string) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'LOW_STOCK':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'NORMAL':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'OVERSTOCK':
        return <Package className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  // Show loading while checking authentication
  if (isLoading || isAuthenticated === false) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your store&apos;s product inventory</p>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search by name or SKU..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Button variant="outline" className="text-gray-600 border-gray-300">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {products.filter(p => p.stock_status === 'LOW_STOCK').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">
                      {products.filter(p => p.stock_status === 'OUT_OF_STOCK').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {products.filter(p => p.is_perishable).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Products ({filteredProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="mt-2 text-gray-500">Loading products...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              {product.is_perishable && product.expiry_date && (
                                <div className="text-xs text-gray-500">
                                  Expires: {new Date(product.expiry_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.quantity_in_stock} units
                            </div>
                            <div className="text-xs text-gray-500">
                              Min: {product.min_stock_threshold}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.aisle && product.shelf ? `${product.aisle}-${product.shelf}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(product.selling_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${getStockStatusColor(product.stock_status)} flex items-center gap-1 w-fit`}>
                              {getStockIcon(product.stock_status)}
                              {product.stock_status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openEditModal(product)}
                                title="Edit product"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => openDeleteModal(product)}
                                title="Delete product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredProducts.length === 0 && (
                    <div className="p-8 text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-gray-500">No products found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddProduct}
      />

      <EditProductModal
        isOpen={showEditModal}
        product={selectedProduct}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onSave={handleEditProduct}
      />

      <DeleteProductModal
        isOpen={showDeleteModal}
        product={selectedProduct}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteProduct}
      />

      {/* Session Expired Dialog */}
      <SessionExpiredDialog
        isOpen={showSessionExpiredDialog}
        onRefresh={handleRefresh}
        onLogin={handleLoginRedirect}
      />
    </MainLayout>
  );
};

export default InventoryPage;