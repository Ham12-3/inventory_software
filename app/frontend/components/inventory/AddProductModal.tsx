import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductCreateData } from '../../services/productService';
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

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductCreateData) => void;
}

export interface ProductFormData {
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
  expiry_date?: string; // Date string from input (YYYY-MM-DD), converted to ISO datetime when sent to API
  days_until_expiry_warning: number;
  supplier_id?: string;
  supplier_sku?: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    category: '',
    subcategory: '',
    brand: '',
    cost_price: 0,
    selling_price: 0,
    quantity_in_stock: 0,
    min_stock_threshold: 10,
    max_stock_threshold: 1000,
    aisle: '',
    shelf: '',
    bin_location: '',
    warehouse_id: '',
    unit_of_measure: 'pieces',
    weight: 0,
    dimensions: '',
    is_perishable: false,
    expiry_date: '',
    days_until_expiry_warning: 7,
    supplier_id: '',
    supplier_sku: ''
  });

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

  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
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
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (formData.cost_price <= 0) newErrors.cost_price = 'Cost price must be greater than 0';
    if (formData.selling_price <= 0) newErrors.selling_price = 'Selling price must be greater than 0';
    if (formData.quantity_in_stock < 0) newErrors.quantity_in_stock = 'Stock quantity cannot be negative';
    if (formData.min_stock_threshold < 0) newErrors.min_stock_threshold = 'Minimum threshold cannot be negative';

    // Logical validations
    if (formData.max_stock_threshold && formData.max_stock_threshold <= formData.min_stock_threshold) {
      newErrors.max_stock_threshold = 'Maximum threshold must be greater than minimum threshold';
    }

    if (formData.selling_price <= formData.cost_price) {
      newErrors.selling_price = 'Selling price should be greater than cost price';
    }

    // Expiry date validation for perishable items
    if (formData.is_perishable && (!formData.expiry_date || formData.expiry_date.trim() === '')) {
      newErrors.expiry_date = 'Expiry date is required for perishable items';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Convert form data to proper types for API
      const productData = {
        ...formData,
        cost_price: Number(formData.cost_price) || 0,
        selling_price: Number(formData.selling_price) || 0,
        quantity_in_stock: Number(formData.quantity_in_stock) || 0,
        min_stock_threshold: Number(formData.min_stock_threshold) || 0,
        max_stock_threshold: formData.max_stock_threshold ? Number(formData.max_stock_threshold) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        days_until_expiry_warning: Number(formData.days_until_expiry_warning) || 7,
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
        expiry_date: (formData.expiry_date && formData.expiry_date.trim() !== '') ? new Date(formData.expiry_date + 'T00:00:00').toISOString() : undefined,
      };
      
      console.log('🔍 Debug - Form Data:', formData);
      console.log('🔍 Debug - Product Data being sent:', productData);
      console.log('🔍 Debug - Expiry Date Raw:', formData.expiry_date);
      console.log('🔍 Debug - Expiry Date Converted:', productData.expiry_date);
      
      await onSave(productData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        sku: '',
        barcode: '',
        category: '',
        subcategory: '',
        brand: '',
        cost_price: 0,
        selling_price: 0,
        quantity_in_stock: 0,
        min_stock_threshold: 10,
        max_stock_threshold: 1000,
        aisle: '',
        shelf: '',
        bin_location: '',
        warehouse_id: '',
        unit_of_measure: 'pieces',
        weight: 0,
        dimensions: '',
        is_perishable: false,
        expiry_date: '',
        days_until_expiry_warning: 7,
        supplier_id: '',
        supplier_sku: ''
      });
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
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
                    value={formData.name}
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
                    SKU *
                  </label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                    placeholder="Enter SKU"
                    className={errors.sku ? 'border-red-500' : ''}
                  />
                  {errors.sku && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.sku}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                  </label>
                  <div className="relative">
                    <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={formData.barcode}
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
                    value={formData.category}
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
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Enter brand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={formData.unit_of_measure}
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

            {/* Pricing & Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PoundSterling className="h-5 w-5" />
                  Pricing & Stock
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
                    value={formData.cost_price}
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
                    value={formData.selling_price}
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
                    Initial Stock
                  </label>
                  <Input
                    type="number"
                    value={formData.quantity_in_stock}
                    onChange={(e) => handleInputChange('quantity_in_stock', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className={errors.quantity_in_stock ? 'border-red-500' : ''}
                  />
                  {errors.quantity_in_stock && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.quantity_in_stock}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock Threshold
                  </label>
                  <Input
                    type="number"
                    value={formData.min_stock_threshold}
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
                    value={formData.max_stock_threshold}
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
                    value={formData.aisle}
                    onChange={(e) => handleInputChange('aisle', e.target.value)}
                    placeholder="A1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shelf
                  </label>
                  <Input
                    value={formData.shelf}
                    onChange={(e) => handleInputChange('shelf', e.target.value)}
                    placeholder="S3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bin Location
                  </label>
                  <Input
                    value={formData.bin_location}
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
                    checked={formData.is_perishable}
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
                        value={formData.expiry_date}
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
                        value={formData.days_until_expiry_warning}
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
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Add Product
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;