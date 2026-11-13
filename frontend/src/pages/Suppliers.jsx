import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Search, Mail, Phone, MapPin, Plus, Trash2, X, AlertCircle, ArrowLeft } from 'lucide-react';
import supplierService from '../services/supplierService';

const Suppliers = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getSuppliers();
      setSuppliers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await supplierService.deleteSupplier(id);
        fetchSuppliers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await supplierService.createSupplier(formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
      setIsDrawerOpen(false);
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create supplier");
    } finally {
      setSaving(false);
    }
  };

  const filteredSuppliers = searchTerm
    ? suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : suppliers;

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <button 
          onClick={() => navigate('/orders')} 
          className="flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:opacity-80 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back To Orders
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Suppliers</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage your supplier network</p>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 transition-all font-medium cursor-pointer"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Plus size={18} />
            Add Supplier
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[var(--border-soft)] shadow-sm flex items-center gap-4 flex-wrap mb-6">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search by name, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[var(--text-secondary)]">Loading suppliers...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="bg-[var(--bg-card)] rounded-2xl p-12 text-center border border-[var(--border-soft)] max-w-xl mx-auto space-y-4 my-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-green-50 text-green-700 flex items-center justify-center border border-green-100 shadow-xs">
              <Building size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {searchTerm ? 'No Matching Suppliers' : 'No Suppliers in Directory Yet'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                {searchTerm
                  ? 'Try searching with a different supplier company name or contact info.'
                  : 'Add medicine distributors, pharmaceutical manufacturers, and vendors to manage stock shipments.'}
              </p>
            </div>
            {!searchTerm && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add New Supplier</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredSuppliers.map((supplier) => (
              <div 
                key={supplier._id} 
                className="bg-white rounded-2xl p-5 border border-[var(--border-soft)] shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold text-lg">
                    {supplier.name.charAt(0).toUpperCase()}
                  </div>
                  <button 
                    onClick={(e) => handleDelete(supplier._id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="font-semibold text-[var(--text-primary)] mb-2 text-lg">{supplier.name}</h3>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Phone size={14} className="text-gray-400" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col z-10 transition-transform duration-350">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Add Supplier
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-sm"
                  placeholder="e.g. Cipla Pharmaceuticals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-sm"
                  placeholder="e.g. info@cipla.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-sm"
                  placeholder="e.g. +1 (555) 234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all resize-none text-sm"
                  placeholder="e.g. Peninsula Chambers, Lower Parel, Mumbai, Maharashtra 400013"
                />
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Supplier
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-5 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
