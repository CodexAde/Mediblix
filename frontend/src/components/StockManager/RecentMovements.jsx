import { useState, useEffect } from 'react';
import { ArrowUpDown, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import importHistoryService from '../../services/importHistoryService';
import saleService from '../../services/saleService';
import productService from '../../services/productService';

const RecentMovements = () => {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const importHistory = await importHistoryService.getImportHistory();
        const sales = await saleService.getSales({});
        const dbProducts = await productService.getProducts();

        const skuToIdMap = {};
        dbProducts.forEach(p => {
          skuToIdMap[p.sku] = p._id;
        });

        const dynamicMovements = [];

        importHistory.forEach(record => {
          record.items.forEach((item, idx) => {
            dynamicMovements.push({
              id: `import-${record._id}-${item.sku}-${idx}`,
              product: item.name,
              productId: skuToIdMap[item.sku] || '',
              type: 'In',
              quantity: item.quantity,
              time: record.createdAt,
              location: 'Warehouse A',
              user: 'System',
              reference: record.fileName
            });
          });
        });

        sales.forEach(sale => {
          sale.items.forEach((item, idx) => {
            dynamicMovements.push({
              id: `sale-${sale._id}-${item.product?._id || idx}-${idx}`,
              product: item.product?.name || 'Deleted Product',
              productId: item.product?._id || '',
              type: 'Out',
              quantity: item.quantity,
              time: sale.createdAt,
              location: 'Store 1',
              user: sale.customer?.name || 'Walk-in',
              reference: sale.invoiceNumber
            });
          });
        });

        const mockMovements = [
          { id: 'mock-1', product: 'Calpol 650', productId: '', type: 'In', quantity: 500, time: new Date(Date.now() - 2 * 3600000).toISOString(), location: 'Warehouse A', user: 'System', reference: 'PO-2024-001' },
          { id: 'mock-2', product: 'Mox 500', productId: '', type: 'Out', quantity: 20, time: new Date(Date.now() - 4 * 3600000).toISOString(), location: 'Store 1', user: 'Jane Smith', reference: 'SO-2024-123' },
          { id: 'mock-3', product: 'Glycomet 500', productId: '', type: 'In', quantity: 300, time: new Date(Date.now() - 6 * 3600000).toISOString(), location: 'Warehouse B', user: 'System', reference: 'PO-2024-002' },
          { id: 'mock-4', product: 'Limcee 500', productId: '', type: 'Out', quantity: 45, time: new Date(Date.now() - 8 * 3600000).toISOString(), location: 'Store 2', user: 'Sarah Lee', reference: 'SO-2024-124' },
          { id: 'mock-5', product: 'Lipivas 10', productId: '', type: 'In', quantity: 150, time: new Date(Date.now() - 24 * 3600000).toISOString(), location: 'Warehouse A', user: 'System', reference: 'PO-2024-003' }
        ];

        const filteredMocks = mockMovements.filter(mock =>
          !dynamicMovements.some(m => m.product.toLowerCase() === mock.product.toLowerCase())
        );

        const combined = [...dynamicMovements, ...filteredMocks];
        combined.sort((a, b) => new Date(b.time) - new Date(a.time));

        setMovements(combined);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!showAll) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAll(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAll]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const filteredMovements = movements.filter(movement =>
    movement.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayMovements = movements.slice(0, 5);

  if (loading) {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Movements</h2>
        </div>
        <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl">
          Loading movements...
        </div>
      </div>
    );
  }

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
          {displayMovements.map((movement, index) => (
            <div
              key={movement.id}
              onClick={() => movement.productId && navigate(`/product/${movement.productId}`)}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-all ${
                movement.productId ? 'cursor-pointer' : ''
              } ${
                index !== displayMovements.length - 1 ? 'border-b border-[var(--border-soft)]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    movement.type === 'In' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <ArrowUpDown
                    size={16}
                    className={movement.type === 'In' ? 'text-green-600' : 'text-red-600'}
                  />
                </div>
                <div>
                  <div className={`font-medium text-[var(--text-primary)] text-sm ${movement.productId ? 'hover:text-[var(--accent)] transition-colors' : ''}`}>{movement.product}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{formatTimeAgo(movement.time)}</div>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  movement.type === 'In' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {movement.type === 'In' ? '+' : '-'}{movement.quantity}
              </span>
            </div>
          ))}
          {displayMovements.length === 0 && (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              No stock movements recorded.
            </div>
          )}
        </div>
      </div>

      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAll(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMovements.map((movement) => (
                      <tr
                        key={movement.id}
                        onClick={() => movement.productId && navigate(`/product/${movement.productId}`)}
                        className={`hover:bg-gray-50 transition-colors ${movement.productId ? 'cursor-pointer' : ''}`}
                      >
                        <td className={`px-4 py-3 text-sm font-medium text-gray-900 ${movement.productId ? 'hover:text-[var(--accent)] transition-colors' : ''}`}>{movement.product}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            movement.type === 'In' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {movement.type}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm font-semibold ${
                          movement.type === 'In' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'In' ? '+' : '-'}{movement.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{movement.location}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{movement.user}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{movement.reference}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(movement.time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
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
