import { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus, Edit2, Trash2, Eye, ArrowUpDown, ChevronLeft, ChevronRight, Download, Upload, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import AddProductDrawer from '../components/Inventory/AddProductDrawer';
import ExportModal from '../components/Inventory/ExportModal';
import ImportHistoryDrawer from '../components/Inventory/ImportHistoryDrawer';
import AddProductChoiceModal from '../components/Inventory/AddProductChoiceModal';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAIMode, setIsAIMode] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const navigate = useNavigate();

  const categories = ['All', 'Analgesics', 'Antibiotics', 'Diabetes', 'Vitamins', 'Cardiology', 'Antihistamines', 'Antacids', 'Antivirals'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch products", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    }
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-700';
      case 'Low Stock': return 'bg-amber-100 text-amber-700';
      case 'Out of Stock': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Inventory</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage your products and stock levels</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-purple-400 hover:text-purple-600 transition-all text-[var(--text-primary)] cursor-pointer"
              onClick={() => setIsHistoryDrawerOpen(true)}
            >
              <History size={18} />
              Import History
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] transition-all text-[var(--text-primary)] cursor-pointer"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download size={18} />
              Export
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 transition-all font-medium cursor-pointer"
              onClick={() => setIsChoiceModalOpen(true)}
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-soft)] flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isAIMode ? 'text-purple-600' : 'text-[var(--text-secondary)]'}`} />
            <input
              type="text"
              placeholder={isAIMode ? "Ask Ai about your inventory..." : "Search by name or Sku..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl focus:outline-none transition-all duration-300 ${
                isAIMode 
                  ? 'ai-mode-active text-purple-900 placeholder-purple-400 font-medium' 
                  : 'bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)]'
              }`}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[var(--text-secondary)]" />
            <div className="flex items-center gap-2">
              {categories.map((category) => (
                <button
                   key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--accent-light)]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">Loading inventory...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-soft)] bg-gray-50">
                  <th className="text-left p-4 font-semibold text-[var(--text-primary)]">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-[var(--accent)]">
                      Product <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-[var(--text-primary)]">Sku</th>
                  <th className="text-left p-4 font-semibold text-[var(--text-primary)]">Category</th>
                  <th className="text-left p-4 font-semibold text-[var(--text-primary)]">Packaging</th>
                  <th className="text-left p-4 font-semibold text-[var(--text-primary)]">Expiry Date</th>
                  <th className="text-left p-4 font-semibold text-[var(--text-primary)]">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-[var(--accent)]">
                      Quantity <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-[var(--text-primary)]">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-[var(--accent)]">
                      Price <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-[var(--text-primary)]">Status</th>
                  <th className="text-center p-4 font-semibold text-[var(--text-primary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className={`border-b border-[var(--border-soft)] hover:bg-gray-50 transition-colors cursor-pointer ${
                      index === filteredProducts.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                          <Package size={20} className="text-[var(--accent)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] font-mono text-sm">{product.sku}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] text-sm">{product.packaging || '10 Tablets / Strip'}</td>
                    <td className="p-4 text-[var(--text-secondary)] text-sm font-sans">
                      {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="p-4 font-semibold text-[var(--text-primary)]">{formatStock(product.quantity, product.tabletsPerStrip)}</td>
                    <td className="p-4 font-semibold text-[var(--text-primary)]">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleDelete(product._id); }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {/* Pagination (Static for now) */}
          <div className="p-4 border-t border-[var(--border-soft)] flex items-center justify-between bg-gray-50">
            <p className="text-sm text-[var(--text-secondary)]">
              Showing <span className="font-semibold">{filteredProducts.length}</span> products
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-soft)]">
            <p className="text-sm text-[var(--text-secondary)]">Total Products</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{products.length}</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-soft)]">
            <p className="text-sm text-[var(--text-secondary)]">In Stock</p>
            <p className="text-2xl font-bold text-green-600">{products.filter(p => p.status === 'In Stock').length}</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-soft)]">
            <p className="text-sm text-[var(--text-secondary)]">Low Stock</p>
            <p className="text-2xl font-bold text-amber-600">{products.filter(p => p.status === 'Low Stock').length}</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-soft)]">
            <p className="text-sm text-[var(--text-secondary)]">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{products.filter(p => p.status === 'Out of Stock').length}</p>
          </div>
        </div>
      </div>

      <AddProductDrawer 
        isOpen={isAddDrawerOpen} 
        onClose={() => setIsAddDrawerOpen(false)} 
        onProductAdded={fetchProducts}
      />

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        data={products} 
      />

      <ImportHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => {
          setIsHistoryDrawerOpen(false);
          fetchProducts();
        }}
      />

      <AddProductChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onManualSelect={() => setIsAddDrawerOpen(true)}
      />
    </div>
  );
};

export default Inventory;
