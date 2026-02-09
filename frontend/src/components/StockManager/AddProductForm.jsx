import { Plus } from 'lucide-react';

const AddProductForm = ({ onClose }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
          <input type="text" placeholder="Enter product name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
          <input type="text" placeholder="Product SKU" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all cursor-pointer">
            <option>Electronics</option>
            <option>Accessories</option>
            <option>Wearables</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
          <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
          <input type="number" placeholder="0" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stock</label>
          <input type="number" placeholder="0" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea rows={3} placeholder="Product description..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all resize-none" />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all cursor-pointer flex items-center justify-center gap-2">
          <Plus size={18} />
          Add Product
        </button>
        <button onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddProductForm;
