import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, 
  Package, 
  PoundSterling, 
  MapPin, 
  Calendar,
  Barcode,
  Save,
  AlertCircle
} from 'lucide-react';
import { Product } from '../../services/productService';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (productId: string, updates: Partial<Product>) => Promise<void>;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, product, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const categories = [
    'Dairy', 'Bakery', 'Produce', 'Meat & Poultry', 'Seafood', 
    'Frozen Foods', 'Canned Goods', 'Beverages', 'Snacks', 
    'Health & Beauty', 'Household', 'Other'
  ];

  const unitOptions = [
    'pieces', 'kg', 'g', 'liters', 'ml', 'lbs', 'oz', 'boxes', 'packs'
  ];

  // Pre-populate form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        cost_price: product.cost_price || 0,
        selling_price: product.selling_price || 0,
        min_stock_threshold: product.min_stock_threshold || 10,
        max_stock_threshold: product.max_stock_threshold || 1000,
        aisle: product.aisle || '',
        shelf: product.shelf || '',
        bin_location: product.bin_location || '',
        warehouse_id: product.warehouse_id || '',
        unit_of_measure: product.unit_of_measure || 'pieces',
        weight: product.weight || 0,
        dimensions: product.dimensions || '',
        is_perishable: product.is_perishable || false,
        expiry_date: product.expiry_date ? product.expiry_date.split('T')[0] : '', // Convert to date string
        days_until_expiry_warning: product.days_until_expiry_warning || 7,
        supplier_id: product.supplier_id || '',
        supplier_sku: product.supplier_sku || ''
      });
      setErrors({});
    }
  }, [product]);

  const handleInputChange = (field: keyof Product, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    if ((formData.cost_price || 0) <= 0) newErrors.cost_price = 'Cost price must be greater than 0';
    if ((formData.selling_price || 0) <= 0) newErrors.selling_price = 'Selling price must be greater than 0';
    if ((formData.min_stock_threshold || 0) < 0) newErrors.min_stock_threshold = 'Minimum threshold cannot be negative';

    // Logical validations
    if ((formData.max_stock_threshold || 0) <= (formData.min_stock_threshold || 0)) {
      newErrors.max_stock_threshold = 'Maximum threshold must be greater than minimum threshold';
    }

    if ((formData.selling_price || 0) <= (formData.cost_price || 0)) {
      newErrors.selling_price = 'Selling price should be greater than cost price';
    }

    // Expiry date validation for perishable items
    if (formData.is_perishable && !formData.expiry_date) {
      newErrors.expiry_date = 'Expiry date is required for perishable items';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !product) {
      return;
    }

    setLoading(true);
    try {
      // Convert form data to proper types for API, similar to AddProductModal
      const updatedData = {
        ...formData,
        // Convert expiry_date from date input format to ISO datetime
        expiry_date: (formData.expiry_date && typeof formData.expiry_date === 'string' && formData.expiry_date.trim() !== '') 
          ? new Date(formData.expiry_date + 'T00:00:00').toISOString() 
          : undefined,
        // Handle empty strings for optional fields
        description: formData.description || undefined,
        barcode: formData.barcode || undefined,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
        aisle: formData.aisle || undefined,
        shelf: formData.shelf || undefined,
        bin_location: formData.bin_location || undefined,
        warehouse_id: formData.warehouse_id || undefined,
        dimensions: formData.dimensions || undefined,
        supplier_id: formData.supplier_id || undefined,
        supplier_sku: formData.supplier_sku || undefined,
      };
      
      console.log('🔍 Debug Edit - Form Data:', formData);
      console.log('🔍 Debug Edit - Updated Data being sent:', updatedData);
      console.log('🔍 Debug Edit - Expiry Date Raw:', formData.expiry_date);
      console.log('🔍 Debug Edit - Expiry Date Converted:', updatedData.expiry_date);
      
      await onSave(product.id, updatedData);
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose} type="button">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU * (Read-only)
                  </label>
                  <Input
                    value={formData.sku || ''}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">SKU cannot be changed after creation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                  </label>
                  <div className="relative">
                    <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={formData.barcode || ''}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      placeholder="Enter barcode"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <Input
                    value={formData.brand || ''}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Enter brand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={formData.unit_of_measure || 'pieces'}
                    onChange={(e) => handleInputChange('unit_of_measure', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {unitOptions.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PoundSterling className="h-5 w-5" />
                  Pricing & Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cost_price || 0}
                    onChange={(e) => handleInputChange('cost_price', parseFloat(e.target.value) || 0)}
                    placeholder="£0.00"
                    className={errors.cost_price ? 'border-red-500' : ''}
                  />
                  {errors.cost_price && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.cost_price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.selling_price || 0}
                    onChange={(e) => handleInputChange('selling_price', parseFloat(e.target.value) || 0)}
                    placeholder="£0.00"
                    className={errors.selling_price ? 'border-red-500' : ''}
                  />
                  {errors.selling_price && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.selling_price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock (Read-only)
                  </label>
                  <Input
                    type="number"
                    value={product.quantity_in_stock}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use stock adjustment to change quantity</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock Threshold
                  </label>
                  <Input
                    type="number"
                    value={formData.min_stock_threshold || 0}
                    onChange={(e) => handleInputChange('min_stock_threshold', parseInt(e.target.value) || 0)}
                    placeholder="10"
                    className={errors.min_stock_threshold ? 'border-red-500' : ''}
                  />
                  {errors.min_stock_threshold && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.min_stock_threshold}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Stock Threshold
                  </label>
                  <Input
                    type="number"
                    value={formData.max_stock_threshold || 0}
                    onChange={(e) => handleInputChange('max_stock_threshold', parseInt(e.target.value) || 0)}
                    placeholder="1000"
                    className={errors.max_stock_threshold ? 'border-red-500' : ''}
                  />
                  {errors.max_stock_threshold && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.max_stock_threshold}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aisle
                  </label>
                  <Input
                    value={formData.aisle || ''}
                    onChange={(e) => handleInputChange('aisle', e.target.value)}
                    placeholder="A1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shelf
                  </label>
                  <Input
                    value={formData.shelf || ''}
                    onChange={(e) => handleInputChange('shelf', e.target.value)}
                    placeholder="S3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bin Location
                  </label>
                  <Input
                    value={formData.bin_location || ''}
                    onChange={(e) => handleInputChange('bin_location', e.target.value)}
                    placeholder="B001"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Perishable Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Expiry Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_perishable"
                    checked={formData.is_perishable || false}
                    onChange={(e) => handleInputChange('is_perishable', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_perishable" className="text-sm font-medium text-gray-700">
                    This product is perishable
                  </label>
                </div>

                {formData.is_perishable && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.expiry_date || ''}
                        onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                        className={errors.expiry_date ? 'border-red-500' : ''}
                      />
                      {errors.expiry_date && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.expiry_date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warning Days Before Expiry
                      </label>
                      <Input
                        type="number"
                        value={formData.days_until_expiry_warning || 7}
                        onChange={(e) => handleInputChange('days_until_expiry_warning', parseInt(e.target.value) || 7)}
                        placeholder="7"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Update Product
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;