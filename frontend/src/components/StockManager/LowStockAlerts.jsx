import { useState } from 'react';
import { AlertTriangle, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LowStockAlerts = () => {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const allAlerts = [
    { id: 1, productId: '8', product: 'USB-C Cables', current: 12, minimum: 50, status: 'critical', category: 'Accessories', supplier: 'Tech Supplies Inc.', lastOrdered: '2 weeks ago' },
    { id: 2, productId: '9', product: 'Phone Cases', current: 28, minimum: 100, status: 'warning', category: 'Accessories', supplier: 'Case Pro Ltd.', lastOrdered: '1 week ago' },
    { id: 3, productId: '10', product: 'Screen Protectors', current: 45, minimum: 150, status: 'warning', category: 'Accessories', supplier: 'Screen Guard Co.', lastOrdered: '3 days ago' },
    { id: 4, productId: '11', product: 'Power Adapters', current: 8, minimum: 40, status: 'critical', category: 'Accessories', supplier: 'Tech Supplies Inc.', lastOrdered: '1 month ago' },
    { id: 5, productId: '12', product: 'Earphones', current: 55, minimum: 200, status: 'warning', category: 'Audio', supplier: 'Audio World', lastOrdered: '5 days ago' },
    { id: 6, productId: '13', product: 'SIM Card Trays', current: 3, minimum: 20, status: 'critical', category: 'Parts', supplier: 'Mobile Parts Co.', lastOrdered: '3 weeks ago' },
  ];

  const lowStockAlerts = allAlerts.slice(0, 3);

  const filteredAlerts = allAlerts.filter(alert =>
    alert.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Low Stock Alerts</h2>
          <button 
            onClick={() => setShowAll(true)}
            className="cursor-pointer"
          >
            <AlertTriangle size={20} className="text-yellow-500 hover:text-yellow-600 transition-colors" />
          </button>
        </div>
        <div className="space-y-3">
          {lowStockAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => navigate(`/product/${alert.productId}`)}
              className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-soft)] hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">{alert.product}</span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    alert.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {alert.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      alert.status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${(alert.current / alert.minimum) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Current: {alert.current}</span>
                <span>Minimum: {alert.minimum}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Modal */}
      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAll(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">All Low Stock Alerts</h2>
              </div>
              <button
                onClick={() => setShowAll(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all"
                />
              </div>

              <div className="overflow-y-auto max-h-[60vh]">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Current</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Minimum</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">To Order</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Ordered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{alert.product}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            alert.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {alert.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-red-600">{alert.current}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{alert.minimum}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">{alert.minimum - alert.current}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{alert.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{alert.supplier}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{alert.lastOrdered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LowStockAlerts;
