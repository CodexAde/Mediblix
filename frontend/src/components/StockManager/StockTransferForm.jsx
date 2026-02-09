import { MapPin } from 'lucide-react';

const StockTransferForm = ({ onClose }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
          <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all cursor-pointer">
            <option>iPhone 15 Pro</option>
            <option>Samsung Galaxy S24</option>
            <option>MacBook Pro M3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Location</label>
          <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all cursor-pointer">
            <option>Warehouse A</option>
            <option>Warehouse B</option>
            <option>Store 1</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To Location</label>
          <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all cursor-pointer">
            <option>Warehouse A</option>
            <option>Warehouse B</option>
            <option>Store 1</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input type="number" placeholder="0" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Date</label>
          <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all cursor-pointer" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea rows={2} placeholder="Additional notes..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all resize-none" />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all cursor-pointer flex items-center justify-center gap-2">
          <MapPin size={18} />
          Transfer Stock
        </button>
        <button onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default StockTransferForm;
