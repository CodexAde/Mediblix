import { Download } from 'lucide-react';

const GenerateReportForm = ({ onClose }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all cursor-pointer">
            <option>Stock Summary</option>
            <option>Low Stock Report</option>
            <option>Stock Movement History</option>
            <option>Product Valuation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
          <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all cursor-pointer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
          <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all cursor-pointer" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
          <div className="flex gap-3">
            {['PDF', 'Excel', 'CSV'].map((format) => (
              <button key={format} className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all cursor-pointer font-medium">
                {format}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Include</label>
          <div className="space-y-2">
            {['Product Images', 'Price Details', 'Supplier Information', 'Stock Locations'].map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer" />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all cursor-pointer flex items-center justify-center gap-2">
          <Download size={18} />
          Generate & Download
        </button>
        <button onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GenerateReportForm;
