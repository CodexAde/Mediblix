import { FileText } from 'lucide-react';

const PurchaseOrderForm = ({ onClose }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
          <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all cursor-pointer">
            <option>Apple Inc.</option>
            <option>Samsung Electronics</option>
            <option>Sony Corporation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PO Number</label>
          <input type="text" placeholder="PO-0001" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Date</label>
          <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all cursor-pointer" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Product name" className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all" />
              <input type="number" placeholder="Qty" className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all" />
              <input type="number" placeholder="Price" className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all" />
            </div>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium cursor-pointer">+ Add Another Product</button>
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
          <textarea rows={2} placeholder="Delivery address..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all resize-none" />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all cursor-pointer flex items-center justify-center gap-2">
          <FileText size={18} />
          Create Order
        </button>
        <button onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
