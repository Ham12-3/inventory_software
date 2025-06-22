import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Product } from '../../services/productService';

interface DeleteProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (productId: string) => void;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({ 
  isOpen, 
  product, 
  onClose, 
  onConfirm 
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      await onConfirm(product.id);
      onClose();
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Delete Product</h2>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this product? This will remove it from your inventory.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Product:</span>
              <span className="text-gray-900">{product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">SKU:</span>
              <span className="text-gray-900">{product.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Current Stock:</span>
              <span className={`font-medium ${product.quantity_in_stock > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {product.quantity_in_stock} units
              </span>
            </div>
          </div>

          {product.quantity_in_stock > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This product still has {product.quantity_in_stock} units in stock. 
                  Consider adjusting the stock to zero before deletion.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Product
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal; 