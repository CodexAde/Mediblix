import { useState } from 'react';
import { Package, Search, Filter, Plus, Edit2, Trash2, Eye, ArrowUpDown, ChevronLeft, ChevronRight, Download, Upload, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAIMode, setIsAIMode] = useState(false);
  const navigate = useNavigate();

  const categories = ['All', 'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Accessories'];

  const products = [
    { id: '1', name: 'iPhone 15 Pro Max', category: 'Electronics', sku: 'APL-IP15PM-256', quantity: 145, price: 1199, status: 'In Stock' },
    { id: '2', name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', sku: 'SAM-GS24U-512', quantity: 89, price: 1299, status: 'In Stock' },
    { id: '3', name: 'MacBook Pro 14" M3', category: 'Electronics', sku: 'APL-MBP14-M3', quantity: 52, price: 1999, status: 'In Stock' },
    { id: '4', name: 'AirPods Pro 2nd Gen', category: 'Electronics', sku: 'APL-APP2-WHT', quantity: 234, price: 249, status: 'In Stock' },
    { id: '5', name: 'Nike Air Max 90', category: 'Clothing', sku: 'NK-AM90-BLK', quantity: 67, price: 130, status: 'In Stock' },
    { id: '6', name: 'Dyson V15 Detect', category: 'Home & Garden', sku: 'DYS-V15-DET', quantity: 8, price: 749, status: 'Low Stock' },
    { id: '7', name: 'Sony WH-1000XM5', category: 'Electronics', sku: 'SNY-WH1KXM5', quantity: 0, price: 399, status: 'Out of Stock' },
    { id: '8', name: 'iPad Air 5th Gen', category: 'Electronics', sku: 'APL-IPA5-64', quantity: 112, price: 599, status: 'In Stock' },
    { id: '9', name: 'Adidas Ultraboost 23', category: 'Clothing', sku: 'ADI-UB23-WHT', quantity: 23, price: 190, status: 'Low Stock' },
    { id: '10', name: 'Apple Watch Series 9', category: 'Electronics', sku: 'APL-AWS9-45', quantity: 78, price: 429, status: 'In Stock' },
  ];

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
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] transition-all text-[var(--text-primary)] cursor-pointer">
              <Upload size={18} />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] transition-all text-[var(--text-primary)] cursor-pointer">
              <Download size={18} />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 transition-all font-medium cursor-pointer">
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
              placeholder={isAIMode ? "Ask AI about your inventory (e.g., 'Which products are low on stock?')" : "Search by name or SKU..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl focus:outline-none transition-all duration-300 ${
                isAIMode 
                  ? 'ai-mode-active text-purple-900 placeholder-purple-400 font-medium' 
                  : 'bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)]'
              }`}
            />
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 group cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors" 
              title={isAIMode ? "Turn off AI Mode" : "Turn on AI Mode"}
              onClick={() => setIsAIMode(!isAIMode)}
            >
              <Sparkles size={16} className={`${isAIMode ? 'text-purple-600 animate-spin' : 'text-purple-500 group-hover:animate-pulse'}`} />
            </div>
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-soft)] bg-gray-50">
                <th className="text-left p-4 font-semibold text-[var(--text-primary)]">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-[var(--accent)]">
                    Product <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-[var(--text-primary)]">SKU</th>
                <th className="text-left p-4 font-semibold text-[var(--text-primary)]">Category</th>
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
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
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
                        <p className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">{product.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)] font-mono text-sm">{product.sku}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-[var(--text-primary)]">{product.quantity}</td>
                  <td className="p-4 font-semibold text-[var(--text-primary)]">${product.price}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-4 border-t border-[var(--border-soft)] flex items-center justify-between bg-gray-50">
            <p className="text-sm text-[var(--text-secondary)]">
              Showing <span className="font-semibold">{filteredProducts.length}</span> of <span className="font-semibold">{products.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-lg hover:border-[var(--accent)] transition-colors">
                <ChevronLeft size={18} className="text-[var(--text-secondary)]" />
              </button>
              <button className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium">1</button>
              <button className="px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--accent)]">2</button>
              <button className="px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--accent)]">3</button>
              <button className="p-2 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-lg hover:border-[var(--accent)] transition-colors">
                <ChevronRight size={18} className="text-[var(--text-secondary)]" />
              </button>
            </div>
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
    </div>
  );
};

export default Inventory;
