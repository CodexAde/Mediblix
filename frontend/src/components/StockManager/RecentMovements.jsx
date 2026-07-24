import { useState, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'; 

import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService'; 

const EXPIRY_ITEMS_PER_PAGE = 10;

const RecentMovements = () => {
 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [showAllExpiring, setShowAllExpiring] = useState(false);
  const [expirySearchTerm, setExpirySearchTerm] = useState('');
  const [expiryCurrentPage, setExpiryCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dbProducts = await productService.getProducts();

      
       
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

        const expiringSoon = dbProducts
          .filter(p => p.expiryDate && new Date(p.expiryDate) <= threeMonthsFromNow) // CHANGED: 
          .map(p => ({
            id: p._id,
            productId: p._id,
            product: p.name,
            sku: p.sku,
            expiryDate: p.expiryDate,
            quantity: p.quantity
          }))
          .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)); // soonest expiry first

        setExpiringProducts(expiringSoon);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  
  useEffect(() => {
    if (!showAllExpiring) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAllExpiring(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAllExpiring]);

  
  useEffect(() => {
    setExpiryCurrentPage(1);
  }, [expirySearchTerm, showAllExpiring]);

  
  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredExpiringProducts = expiringProducts.filter(p =>
    p.product.toLowerCase().includes(expirySearchTerm.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(expirySearchTerm.toLowerCase())
  );
  const displayExpiringProducts = expiringProducts.slice(0, 5);
  const expiryTotalPages = Math.max(1, Math.ceil(filteredExpiringProducts.length / EXPIRY_ITEMS_PER_PAGE));
  const paginatedExpiringProducts = filteredExpiringProducts.slice(
    (expiryCurrentPage - 1) * EXPIRY_ITEMS_PER_PAGE,
    expiryCurrentPage * EXPIRY_ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Action Required: Nearing Expiration Date</h2>
        </div>
        <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl">
          Loading products...
        </div>
      </div>
    );
  }

  return (
    <>
    
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Action Required Expiration Date</h2>
          <button
            onClick={() => setShowAllExpiring(true)}
            className="text-sm text-[var(--accent)] font-medium hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
          {displayExpiringProducts.map((p, index) => (
            <div
              key={p.id}
              onClick={() => p.productId && navigate(`/product/${p.productId}`)}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-all cursor-pointer ${
                index !== displayExpiringProducts.length - 1 ? 'border-b border-[var(--border-soft)]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-100">
                  <AlertTriangle size={16} className="text-yellow-600" />
                </div>
                <div>
                  <div className="font-medium text-[var(--text-primary)] text-sm hover:text-[var(--accent)] transition-colors">
                    {p.product}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Expires: {formatExpiryDate(p.expiryDate)}</div>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-600">
                Qty: {p.quantity}
              </span>
            </div>
          ))}
          {displayExpiringProducts.length === 0 && (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              No products expiring within 3 months.
            </div>
          )}
        </div>
      </div>


      {showAllExpiring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAllExpiring(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Products Expiring Within 3 Months</h2>
              <button
                onClick={() => setShowAllExpiring(false)}
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
                  placeholder="Search by product name or SKU..."
                  value={expirySearchTerm}
                  onChange={(e) => setExpirySearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-all"
                />
              </div>

              <div className="overflow-y-auto max-h-[55vh]">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Expiry Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedExpiringProducts.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => p.productId && navigate(`/product/${p.productId}`)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 hover:text-[var(--accent)] transition-colors">{p.product}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{p.sku}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatExpiryDate(p.expiryDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.quantity}</td>
                      </tr>
                    ))}
                    {paginatedExpiringProducts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                          No products expiring within 3 months.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredExpiringProducts.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    Showing {(expiryCurrentPage - 1) * EXPIRY_ITEMS_PER_PAGE + 1}
                    {'-'}
                    {Math.min(expiryCurrentPage * EXPIRY_ITEMS_PER_PAGE, filteredExpiringProducts.length)} of {filteredExpiringProducts.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpiryCurrentPage(p => Math.max(1, p - 1))}
                      disabled={expiryCurrentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-700 font-medium px-2">
                      Page {expiryCurrentPage} of {expiryTotalPages}
                    </span>
                    <button
                      onClick={() => setExpiryCurrentPage(p => Math.min(expiryTotalPages, p + 1))}
                      disabled={expiryCurrentPage === expiryTotalPages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentMovements;
