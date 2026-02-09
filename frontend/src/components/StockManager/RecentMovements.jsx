import { useState } from 'react';
import { ArrowUpDown, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentMovements = () => {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const allMovements = [
    { id: 1, product: 'iPhone 15 Pro', productId: '1', type: 'IN', quantity: 50, time: '2 hours ago', location: 'Warehouse A', user: 'John Doe', reference: 'PO-2024-001' },
    { id: 2, product: 'Samsung Galaxy S24', productId: '2', type: 'OUT', quantity: 25, time: '4 hours ago', location: 'Store 1', user: 'Jane Smith', reference: 'SO-2024-123' },
    { id: 3, product: 'MacBook Pro M3', productId: '3', type: 'IN', quantity: 30, time: '6 hours ago', location: 'Warehouse B', user: 'Mike Johnson', reference: 'PO-2024-002' },
    { id: 4, product: 'AirPods Pro', productId: '4', type: 'OUT', quantity: 100, time: '8 hours ago', location: 'Store 2', user: 'Sarah Lee', reference: 'SO-2024-124' },
    { id: 5, product: 'iPad Air', productId: '5', type: 'IN', quantity: 45, time: '1 day ago', location: 'Warehouse A', user: 'Tom Brown', reference: 'PO-2024-003' },
    { id: 6, product: 'Apple Watch S9', productId: '6', type: 'OUT', quantity: 15, time: '1 day ago', location: 'Store 1', user: 'Emily Davis', reference: 'SO-2024-125' },
    { id: 7, product: 'Sony WH-1000XM5', productId: '7', type: 'IN', quantity: 20, time: '2 days ago', location: 'Warehouse B', user: 'John Doe', reference: 'PO-2024-004' },
    { id: 8, product: 'USB-C Cable', productId: '8', type: 'OUT', quantity: 200, time: '2 days ago', location: 'Store 2', user: 'Jane Smith', reference: 'SO-2024-126' },
  ];

  const filteredMovements = allMovements.filter(movement =>
    movement.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Movements</h2>
          <button 
            onClick={() => setShowAll(true)}
            className="text-sm text-[var(--accent)] font-medium hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
          {allMovements.map((movement, index) => (
            <div
              key={movement.id}
              onClick={() => navigate(`/product/${movement.productId}`)}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-all cursor-pointer ${
                index !== allMovements.length - 1 ? 'border-b border-[var(--border-soft)]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    movement.type === 'IN' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <ArrowUpDown
                    size={16}
                    className={movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}
                  />
                </div>
                <div>
                  <div className="font-medium text-[var(--text-primary)] text-sm hover:text-[var(--accent)] transition-colors">{movement.product}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{movement.time}</div>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
              </span>
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
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">All Stock Movements</h2>
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
                  placeholder="Search by product name or reference..."
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMovements.map((movement) => (
                      <tr 
                        key={movement.id} 
                        onClick={() => navigate(`/product/${movement.productId}`)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 hover:text-[var(--accent)] transition-colors">{movement.product}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            movement.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {movement.type}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm font-semibold ${
                          movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{movement.location}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{movement.user}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{movement.reference}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{movement.time}</td>
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

export default RecentMovements;
