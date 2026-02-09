import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, Package, TrendingUp, Clock, ShoppingBag, CreditCard, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock customer data
  const customer = {
    id: id,
    name: 'Alexander Thompson',
    email: 'alex.t@email.com',
    phone: '+91 98765-43210',
    location: 'Mumbai, India',
    joinDate: 'January 15, 2023',
    status: 'Active',
    rating: 'Gold',
    totalSpent: 284500,
    totalOrders: 47,
    avgOrderValue: 6053,
    lastOrder: '2 days ago',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    preferences: {
      category: 'Electronics',
      payment: 'Credit Card',
      shipping: 'Express'
    }
  };

  // Spending history data
  const spendingData = [
    { month: 'Jul', amount: 12000 },
    { month: 'Aug', amount: 18500 },
    { month: 'Sep', amount: 15000 },
    { month: 'Oct', amount: 25000 },
    { month: 'Nov', amount: 22000 },
    { month: 'Dec', amount: 35000 },
  ];

  const recentOrders = [
    { id: 'ORD-2024-001', date: 'Dec 02, 2024', items: 3, total: 24999, status: 'Delivered' },
    { id: 'ORD-2024-002', date: 'Nov 28, 2024', items: 1, total: 12500, status: 'Delivered' },
    { id: 'ORD-2024-003', date: 'Nov 15, 2024', items: 5, total: 8499, status: 'Delivered' },
    { id: 'ORD-2024-004', date: 'Nov 02, 2024', items: 2, total: 4500, status: 'Returned' },
  ];

  return (
    <div className="h-[calc(100vh-70px)] w-full bg-gray-50 overflow-hidden">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header & Navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span>Back to Customers</span>
          </button>

          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--accent-light)] to-transparent opacity-20 rounded-bl-full -mr-16 -mt-16" />
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <img 
                src={customer.avatar} 
                alt={customer.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold border border-amber-200 flex items-center gap-1">
                    <Star size={14} fill="currentColor" />
                    {customer.rating} Member
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Mail size={16} />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={16} />
                    {customer.phone}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    {customer.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    Joined {customer.joinDate}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  Edit Profile
                </button>
                <button className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-colors cursor-pointer">
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <CreditCard size={20} />
                </div>
                <span className="text-sm text-gray-500 font-medium">Total Spent</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{(customer.totalSpent).toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <ShoppingBag size={20} />
                </div>
                <span className="text-sm text-gray-500 font-medium">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <TrendingUp size={20} />
                </div>
                <span className="text-sm text-gray-500 font-medium">Avg. Order</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{customer.avgOrderValue.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <Clock size={20} />
                </div>
                <span className="text-sm text-gray-500 font-medium">Last Active</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{customer.lastOrder}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spending Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Spending Overview</h3>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium border border-purple-100">
                  <Sparkles size={12} />
                  AI Projection
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendingData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                <button className="text-sm text-[var(--accent)] font-medium hover:underline cursor-pointer">View All</button>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{order.id}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">₹{order.total.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                    Top Category: {customer.preferences.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                    Payment: {customer.preferences.payment}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                    Shipping: {customer.preferences.shipping}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
