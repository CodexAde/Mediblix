import { useState } from 'react';
import { Users, Search, Crown, TrendingUp, Mail, MapPin, ShoppingBag, MoreVertical, Plus, Filter, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const navigate = useNavigate();

  const statuses = ['All', 'Active', 'Inactive', 'New'];

  const topCustomers = [
    { id: 1, name: 'Alexander Thompson', email: 'alex.t@email.com', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', totalSpent: 284500, orders: 47, rating: 'Gold', joinDate: 'Jan 2023' },
    { id: 2, name: 'Sophia Williams', email: 'sophia.w@email.com', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', totalSpent: 212000, orders: 38, rating: 'Gold', joinDate: 'Mar 2023' },
    { id: 3, name: 'Marcus Chen', email: 'marcus.c@email.com', avatar: 'https://randomuser.me/api/portraits/men/52.jpg', totalSpent: 189000, orders: 31, rating: 'Silver', joinDate: 'Feb 2023' },
  ];

  const allCustomers = [
    { id: 1, name: 'Alexander Thompson', email: 'alex.t@email.com', phone: '+91 98765-43210', location: 'Mumbai, India', orders: 47, spent: 284500, status: 'Active', lastOrder: '2 days ago', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, name: 'Sophia Williams', email: 'sophia.w@email.com', phone: '+91 87654-32109', location: 'Delhi, India', orders: 38, spent: 212000, status: 'Active', lastOrder: '1 week ago', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 3, name: 'Marcus Chen', email: 'marcus.c@email.com', phone: '+91 76543-21098', location: 'Bangalore, India', orders: 31, spent: 189000, status: 'Active', lastOrder: '3 days ago', avatar: 'https://randomuser.me/api/portraits/men/52.jpg' },
    { id: 4, name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '+91 65432-10987', location: 'Hyderabad, India', orders: 24, spent: 126000, status: 'Active', lastOrder: '5 days ago', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { id: 5, name: 'James Wilson', email: 'james.w@email.com', phone: '+91 54321-09876', location: 'Chennai, India', orders: 19, spent: 98000, status: 'Inactive', lastOrder: '1 month ago', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
    { id: 6, name: 'Olivia Brown', email: 'olivia.b@email.com', phone: '+91 43210-98765', location: 'Pune, India', orders: 15, spent: 75000, status: 'Active', lastOrder: '1 day ago', avatar: 'https://randomuser.me/api/portraits/women/90.jpg' },
    { id: 7, name: 'Daniel Kim', email: 'daniel.k@email.com', phone: '+91 32109-87654', location: 'Kolkata, India', orders: 12, spent: 54000, status: 'Active', lastOrder: '4 days ago', avatar: 'https://randomuser.me/api/portraits/men/85.jpg' },
    { id: 8, name: 'Isabella Martinez', email: 'isabella.m@email.com', phone: '+91 21098-76543', location: 'Ahmedabad, India', orders: 8, spent: 32000, status: 'New', lastOrder: '2 days ago', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
  ];

  const getRatingBadge = (rating) => {
    switch (rating) {
      case 'Gold': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Silver': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'Bronze': return 'bg-orange-100 text-orange-700 border border-orange-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Inactive': return 'bg-gray-50 text-gray-600 border border-gray-200';
      case 'New': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const filteredCustomers = allCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = allCustomers.reduce((a, c) => a + c.spent, 0);
  const totalOrders = allCustomers.reduce((a, c) => a + c.orders, 0);

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Customers</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage your customer relationships</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 transition-all font-medium">
            <Plus size={18} />
            Add Customer
          </button>
        </div>

        {/* Stats - Clean White Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
                <Users size={24} className="text-[var(--accent)]" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUp size={14} />
                <span>12%</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{allCustomers.length}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Total Customers</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUp size={14} />
                <span>8%</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{allCustomers.filter(c => c.status === 'Active').length}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Active Customers</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">₹</span>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUp size={14} />
                <span>15%</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">₹{(totalRevenue / 100000).toFixed(1)}L</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Total Revenue</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShoppingBag size={24} className="text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUp size={14} />
                <span>5%</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{totalOrders}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Total Orders</p>
          </div>
        </div>

        {/* Top Customers Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Crown size={24} className="text-amber-500" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Top Customers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCustomers.map((customer, index) => (
              <div 
                key={customer.id} 
                onClick={() => navigate(`/customer/${customer.id}`)}
                className="bg-white rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative cursor-pointer"
              >
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  #{index + 1}
                </div>
                
                <img 
                  src={customer.avatar} 
                  alt={customer.name}
                  className="w-16 h-16 rounded-2xl object-cover mb-4 border-2 border-[var(--border-soft)]"
                />
                
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{customer.name}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{customer.email}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRatingBadge(customer.rating)}`}>
                    {customer.rating} Member
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">Since {customer.joinDate}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-soft)]">
                  <div>
                    <p className="text-xl font-bold text-[var(--accent)]">₹{(customer.totalSpent / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-[var(--text-secondary)]">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{customer.orders}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Orders</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Customers Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">All Customers</h2>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[var(--border-soft)] flex items-center gap-4 flex-wrap mb-6">
            <div className="relative flex-1 min-w-[250px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[var(--text-secondary)]" />
              <div className="flex items-center gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedStatus === status
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--accent-light)]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {filteredCustomers.map((customer) => (
              <div 
                key={customer.id} 
                onClick={() => navigate(`/customer/${customer.id}`)}
                className="bg-white rounded-2xl p-5 border border-[var(--border-soft)] shadow-sm hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <img 
                    src={customer.avatar} 
                    alt={customer.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[var(--border-soft)]"
                  />
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={18} className="text-[var(--text-secondary)]" />
                  </button>
                </div>
                
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">{customer.name}</h3>
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Mail size={12} />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <MapPin size={12} />
                    <span>{customer.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-soft)]">
                  <div>
                    <p className="font-bold text-[var(--accent)]">₹{(customer.spent / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-[var(--text-secondary)]">{customer.orders} orders</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-2xl p-4 border border-[var(--border-soft)] flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              Showing <span className="font-semibold">{filteredCustomers.length}</span> of <span className="font-semibold">{allCustomers.length}</span> customers
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
      </div>
    </div>
  );
};

export default Customers;
