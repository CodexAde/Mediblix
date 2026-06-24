import { useState, useEffect } from 'react';
import { AlertTriangle, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const LowStockAlerts = () => {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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

  const formatStock = (qty, tabletsPerStrip) => {
    if (qty <= 0) return '0 Strips';
    if (!tabletsPerStrip || tabletsPerStrip <= 1) {
      return `${qty} Strips`;
    }
    const totalTablets = Math.round(qty * tabletsPerStrip);
    const strips = Math.floor(totalTablets / tabletsPerStrip);
    const tablets = totalTablets % tabletsPerStrip;
    if (strips > 0 && tablets > 0) {
      return `${strips} Strips, ${tablets} Tablets`;
    } else if (strips > 0) {
      return `${strips} Strips`;
    } else {
      return `${tablets} Tablets`;
    }
  };

  const dbAlerts = products
    .filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock' || p.quantity < 10)
    .map(p => {
      const status = p.quantity === 0 ? 'critical' : 'warning';
      return {
        id: p._id,
        productId: p._id,
        product: p.name,
        current: p.quantity,
        minimum: 10,
        status: status,
        category: p.category,
        supplier: 'Unknown Supplier',
        lastOrdered: 'N/A',
        tabletsPerStrip: p.tabletsPerStrip || 10
      };
    });

  const mockAlerts = [
    { id: 'mock-a1', productId: '', product: 'Antiflu 75', current: 9, minimum: 10, status: 'warning', category: 'Tablet', supplier: 'Apex Labs', lastOrdered: '2 days ago', tabletsPerStrip: 10 },
    { id: 'mock-a2', productId: '', product: 'Digene Gel', current: 0, minimum: 10, status: 'critical', category: 'Syrup', supplier: 'Abbott Healthcare', lastOrdered: 'Yesterday', tabletsPerStrip: 1 },
    { id: 'mock-a3', productId: '', product: 'Azithral 500', current: 3, minimum: 10, status: 'warning', category: 'Tablet', supplier: 'Alembic Pharma', lastOrdered: '5 days ago', tabletsPerStrip: 5 },
    { id: 'mock-a4', productId: '', product: 'Crocin Pain Relief', current: 0, minimum: 10, status: 'critical', category: 'Tablet', supplier: 'GlaxoSmithKline', lastOrdered: '3 days ago', tabletsPerStrip: 15 }
  ];

  const filteredMocks = mockAlerts.filter(mock =>
    !dbAlerts.some(da => da.product.toLowerCase() === mock.product.toLowerCase())
  );

  const allAlerts = [...dbAlerts, ...filteredMocks];
  const lowStockAlerts = allAlerts.slice(0, 4);

  const filteredAlerts = allAlerts.filter(alert =>
    alert.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Low Stock Alerts</h2>
        </div>
        <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl">
          Loading alerts...
        </div>
      </div>
    );
  }

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
              onClick={() => alert.productId && navigate(`/product/${alert.productId}`)}
              className={`bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-soft)] hover:shadow-md transition-all ${
                alert.productId ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium text-[var(--text-primary)] ${alert.productId ? 'hover:text-[var(--accent)] transition-colors' : ''}`}>{alert.product}</span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    alert.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
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
                <span>Current: {formatStock(alert.current, alert.tabletsPerStrip)}</span>
                <span>Minimum: {alert.minimum} Strips</span>
              </div>
            </div>
          ))}
          {allAlerts.length === 0 && (
            <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl">
              No low stock alerts
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Current</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Minimum</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">To order</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Supplier</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Last ordered</th>
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
                            {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-red-600">{formatStock(alert.current, alert.tabletsPerStrip)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{alert.minimum} Strips</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatStock(Math.max(0, alert.minimum - alert.current), alert.tabletsPerStrip)}</td>
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
