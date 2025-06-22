import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, 
  Plus, 
  Trash2, 
  ShoppingCart,
  Building,
  Package,
  MapPin,
  Save,
  AlertCircle
} from 'lucide-react';

import { 
  PurchaseOrderService, 
  CreatePurchaseOrderData, 
  Supplier,
  getCurrentUserId,
  showSuccessMessage, 
  showErrorMessage 
} from '../../services/purchaseOrderService';
import { ProductService, Product } from '../../services/productService';
import { formatPrice } from '@/lib/currency';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity_ordered: number;
  unit_price: number;
  supplier_sku?: string;
  total_price: number;
}

const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Form data
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // UI states
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      setLoadingData(true);
      try {
        const [suppliersData, productsData] = await Promise.all([
          PurchaseOrderService.getSuppliers(),
          ProductService.getProducts({ per_page: 100 })
        ]);
        
        setSuppliers(suppliersData);
        setProducts(productsData.products);
      } catch (error) {
        showErrorMessage(error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [isOpen]);

  const resetForm = () => {
    setSelectedSupplierId('');
    setExpectedDeliveryDate('');
    setDeliveryAddress('');
    setDeliveryInstructions('');
    setNotes('');
    setOrderItems([]);
    setErrors({});
    setProductSearchTerm('');
    setShowProductSearch(false);
  };

  const addProduct = (product: Product) => {
    // Check if product already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      // Increase quantity of existing item
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity_ordered += 1;
      updatedItems[existingItemIndex].total_price = 
        updatedItems[existingItemIndex].quantity_ordered * updatedItems[existingItemIndex].unit_price;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: Date.now().toString(),
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity_ordered: 1,
        unit_price: product.cost_price, // Start with cost price
        total_price: product.cost_price,
      };
      setOrderItems([...orderItems, newItem]);
    }
    
    setShowProductSearch(false);
    setProductSearchTerm('');
  };

  const updateOrderItem = (itemId: string, field: keyof OrderItem, value: number | string) => {
    const updatedItems = orderItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total price when quantity or unit price changes
        if (field === 'quantity_ordered' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity_ordered * updatedItem.unit_price;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setOrderItems(updatedItems);
  };

  const removeOrderItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = subtotal * 0.2; // 20% VAT
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedSupplierId) newErrors.supplier = 'Please select a supplier';
    if (orderItems.length === 0) newErrors.items = 'Please add at least one product';
    if (!expectedDeliveryDate) newErrors.deliveryDate = 'Please set expected delivery date';
    
    // Validate order items
    orderItems.forEach((item, index) => {
      if (item.quantity_ordered <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unit_price <= 0) {
        newErrors[`item_${index}_price`] = 'Unit price must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const orderData: CreatePurchaseOrderData = {
        supplier_id: selectedSupplierId,
        expected_delivery_date: expectedDeliveryDate ? new Date(expectedDeliveryDate + 'T00:00:00').toISOString() : undefined,
        delivery_address: deliveryAddress || undefined,
        delivery_instructions: deliveryInstructions || undefined,
        notes: notes || undefined,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity_ordered: item.quantity_ordered,
          unit_price: item.unit_price,
          supplier_sku: item.supplier_sku || undefined,
        })),
      };

      await PurchaseOrderService.createPurchaseOrder(orderData, getCurrentUserId());
      showSuccessMessage('Purchase order created successfully!');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      showErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const { subtotal, taxAmount, total } = calculateTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Create Purchase Order</h2>
            </div>
            <Button variant="outline" size="sm" onClick={onClose} type="button">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loadingData ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-500">Loading suppliers and products...</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Supplier Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Supplier Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier *
                    </label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${errors.supplier ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} {supplier.company_name && `(${supplier.company_name})`}
                        </option>
                      ))}
                    </select>
                    {errors.supplier && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.supplier}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Delivery Date *
                    </label>
                    <Input
                      type="date"
                      value={expectedDeliveryDate}
                      onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={errors.deliveryDate ? 'border-red-500' : ''}
                    />
                    {errors.deliveryDate && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.deliveryDate}
                      </p>
                    )}
                  </div>

                  {selectedSupplier && (
                    <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">Supplier Details</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                        <p><strong>Contact:</strong> {selectedSupplier.contact_person || 'N/A'}</p>
                        <p><strong>Email:</strong> {selectedSupplier.email || 'N/A'}</p>
                        <p><strong>Payment Terms:</strong> {selectedSupplier.payment_terms || 'N/A'}</p>
                        <p><strong>Lead Time:</strong> {selectedSupplier.lead_time_days} days</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Products Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Items
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowProductSearch(!showProductSearch)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Product Search */}
                  {showProductSearch && (
                    <div className="mb-4 border rounded-lg p-4 bg-gray-50">
                      <Input
                        placeholder="Search products by name or SKU..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="mb-3"
                      />
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-2 border rounded hover:bg-white cursor-pointer"
                            onClick={() => addProduct(product)}
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">SKU: {product.sku} | Stock: {product.quantity_in_stock}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatPrice(product.cost_price)}</p>
                              <p className="text-xs text-gray-500">Cost Price</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Items Table */}
                  {orderItems.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orderItems.map((item, index) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2">
                                <div>
                                  <p className="font-medium">{item.product_name}</p>
                                  <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity_ordered}
                                  onChange={(e) => updateOrderItem(item.id, 'quantity_ordered', parseInt(e.target.value) || 1)}
                                  className="w-20"
                                />
                                {errors[`item_${index}_quantity`] && (
                                  <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                                )}
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={item.unit_price}
                                  onChange={(e) => updateOrderItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                  className="w-24"
                                />
                                {errors[`item_${index}_price`] && (
                                  <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_price`]}</p>
                                )}
                              </td>
                              <td className="px-4 py-2 font-medium">
                                {formatPrice(item.total_price)}
                              </td>
                              <td className="px-4 py-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeOrderItem(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-right font-medium">Subtotal:</td>
                            <td className="px-4 py-2 font-bold">{formatPrice(subtotal)}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-right font-medium">VAT (20%):</td>
                            <td className="px-4 py-2 font-bold">{formatPrice(taxAmount)}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-right font-bold text-lg">Total:</td>
                            <td className="px-4 py-2 font-bold text-lg text-green-600">{formatPrice(total)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2">No products added yet</p>
                      <p className="text-sm">Click &quot;Add Product&quot; to start building your order</p>
                      {errors.items && (
                        <p className="text-red-500 text-sm mt-2 flex items-center justify-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.items}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter delivery address..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Instructions
                    </label>
                    <textarea
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Special delivery instructions..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes for this order..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              {orderItems.length} items • Total: <span className="font-bold text-lg text-green-600">{formatPrice(total)}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || loadingData}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Order...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Create Purchase Order
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderModal; 