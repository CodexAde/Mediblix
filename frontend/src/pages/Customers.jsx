import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, TrendingUp, Mail, Phone, ShoppingBag, MoreVertical, Plus, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import customerService from '../services/customerService';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      setLoading(false);
    }
  };

  const filteredCustomers = searchTerm
    ? customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : customers;

  const totalRevenue = customers.reduce((sum, customer) => {
    return sum + (customer.purchaseHistory?.length || 0) * 1000;
  }, 0);

  const totalOrders = customers.reduce((sum, customer) => {
    return sum + (customer.purchaseHistory?.length || 0);
  }, 0);

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Customers</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage your customer relationships</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
                <Users size={24} className="text-[var(--accent)]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{customers.length}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Total Customers</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {customers.filter(c => c.purchaseHistory && c.purchaseHistory.length > 0).length}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Active Customers</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">$</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">${(totalRevenue / 1000).toFixed(1)}K</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Est. Revenue</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShoppingBag size={24} className="text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{totalOrders}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Total Orders</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">All Customers</h2>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[var(--border-soft)] flex items-center gap-4 flex-wrap mb-6">
            <div className="relative flex-1 min-w-[250px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search by name, mobile, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-[var(--bg-card)] rounded-2xl p-12 text-center border border-[var(--border-soft)] max-w-xl mx-auto space-y-4 my-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-green-50 text-green-700 flex items-center justify-center border border-green-100 shadow-xs">
                <Users size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {searchTerm ? 'No Matching Customers' : 'No Customers in Directory Yet'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  {searchTerm
                    ? 'Try searching with a different customer name or phone number.'
                    : 'Customers are automatically registered when you create invoices in Billing, or you can register new patients.'}
                </p>
              </div>
              {!searchTerm && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => navigate('/billing')}
                    className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Bill for Customer</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredCustomers.map((customer) => (
                  <div 
                    key={customer._id} 
                    onClick={() => navigate(`/customer/${customer._id}`)}
                    className="bg-white rounded-2xl p-5 border border-[var(--border-soft)] shadow-sm hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] font-bold text-lg">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-lg">
                        <MoreVertical size={18} className="text-[var(--text-secondary)]" />
                      </button>
                    </div>
                    
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">{customer.name}</h3>
                    
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Phone size={12} />
                        <span>{customer.mobile}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <Mail size={12} />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-soft)]">
                      <div>
                        <p className="font-bold text-[var(--accent)]">
                          {customer.purchaseHistory?.length || 0} orders
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Member since {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[var(--border-soft)] flex items-center justify-between">
                <p className="text-sm text-[var(--text-secondary)]">
                  Showing <span className="font-semibold">{filteredCustomers.length}</span> of <span className="font-semibold">{customers.length}</span> customers
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
