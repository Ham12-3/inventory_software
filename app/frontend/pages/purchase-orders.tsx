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
  Eye,
  CheckCircle,
  Truck,
  Package,
  AlertTriangle,
  Clock,
  ShoppingCart,
  FileText
} from 'lucide-react';

import { 
  PurchaseOrderService, 
  PurchaseOrder, 
  PurchaseOrderSummary,
  DeliveryMetrics,
  getCurrentUserId,
  showSuccessMessage, 
  showErrorMessage 
} from '../services/purchaseOrderService';
import { formatPrice, formatLargeCurrency } from '@/lib/currency';
import { useAuth } from '../hooks/useAuth';
import { useSessionManager } from '../hooks/useSessionManager';
import CreatePurchaseOrderModal from '../components/inventory/CreatePurchaseOrderModal';
import SessionExpiredDialog from '../components/ui/session-expired-dialog';

const PurchaseOrdersPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    showSessionExpiredDialog, 
    handleRefresh, 
    handleLoginRedirect 
  } = useSessionManager();
  
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [summary, setSummary] = useState<PurchaseOrderSummary | null>(null);
  const [deliveryMetrics, setDeliveryMetrics] = useState<DeliveryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Load purchase orders and summary data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load purchase orders
      const orders = await PurchaseOrderService.getPurchaseOrders({
        status: statusFilter || undefined,
        page: 1,
        per_page: 50
      });
      setPurchaseOrders(orders);

      // Load summary data
      const [summaryData, metricsData] = await Promise.all([
        PurchaseOrderService.getPurchaseOrderSummary(),
        PurchaseOrderService.getDeliveryMetrics()
      ]);
      
      setSummary(summaryData);
      setDeliveryMetrics(metricsData);
    } catch (error) {
      showErrorMessage(error);
      // Fallback to mock data if needed
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApproveOrder = async (orderId: string) => {
    try {
      await PurchaseOrderService.approvePurchaseOrder(orderId, getCurrentUserId());
      showSuccessMessage('Purchase order approved successfully!');
      loadData(); // Refresh data
    } catch (error) {
      showErrorMessage(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'ORDERED':
        return 'bg-purple-100 text-purple-800';
      case 'SHIPPED':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <FileText className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'ORDERED':
        return <ShoppingCart className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <Package className="h-4 w-4" />;
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
              <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage orders from suppliers and track deliveries</p>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Orders */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-2"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{summary?.total_orders || 0}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{formatLargeCurrency(summary?.total_value || 0)} total value</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Orders */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mt-2"></div>
                    ) : (
                      <p className="text-2xl font-bold text-yellow-600">{summary?.pending_orders || 0}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{formatLargeCurrency(summary?.pending_value || 0)} pending</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* In Transit */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Transit</p>
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mt-2"></div>
                    ) : (
                      <p className="text-2xl font-bold text-orange-600">{deliveryMetrics?.in_transit_count || 0}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Being delivered</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Truck className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivered Today */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered Today</p>
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mt-2"></div>
                    ) : (
                      <p className="text-2xl font-bold text-green-600">{deliveryMetrics?.delivered_today || 0}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Completed orders</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Bar */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search by order number or supplier..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="ORDERED">Ordered</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <Button variant="outline" className="text-gray-600 border-gray-300">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Orders Table */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Purchase Orders ({filteredOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="mt-2 text-gray-500">Loading purchase orders...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                              {order.tracking_number && (
                                <div className="text-xs text-gray-500">
                                  Tracking: {order.tracking_number}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.supplier.name}</div>
                            {order.supplier.contact_person && (
                              <div className="text-xs text-gray-500">{order.supplier.contact_person}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.items?.length || 0} items
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(order.total_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                              {getStatusIcon(order.status)}
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(order.order_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowDetailsModal(true);
                                }}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {order.status === 'PENDING' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleApproveOrder(order.id)}
                                  title="Approve order"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredOrders.length === 0 && (
                    <div className="p-8 text-center">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-gray-500">No purchase orders found</p>
                      <p className="text-sm text-gray-400">Create your first purchase order to get started</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CreatePurchaseOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />

      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Order Details - {selectedOrder.order_number}</h3>
              <Button variant="outline" size="sm" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium mb-2">Order Information</h4>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Total:</strong> {formatPrice(selectedOrder.total_amount)}</p>
                <p><strong>Order Date:</strong> {new Date(selectedOrder.order_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Supplier Information</h4>
                <p><strong>Name:</strong> {selectedOrder.supplier.name}</p>
                <p><strong>Contact:</strong> {selectedOrder.supplier.contact_person}</p>
                <p><strong>Email:</strong> {selectedOrder.supplier.email}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Order Items</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{item.product_name}</td>
                        <td className="px-4 py-2 text-sm">{item.quantity_ordered}</td>
                        <td className="px-4 py-2 text-sm">{formatPrice(item.unit_price)}</td>
                        <td className="px-4 py-2 text-sm">{formatPrice(item.total_price || 0)}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-sm text-gray-500 text-center">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Expired Dialog */}
      <SessionExpiredDialog
        isOpen={showSessionExpiredDialog}
        onRefresh={handleRefresh}
        onLogin={handleLoginRedirect}
      />
    </MainLayout>
  );
};

export default PurchaseOrdersPage; 