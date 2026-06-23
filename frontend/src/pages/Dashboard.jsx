import { Package, TrendingUp, AlertTriangle, Truck, IndianRupee, ArrowUp, ArrowDown, Users, ShoppingCart, Sparkles } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const revenueData = [
    { name: 'Jan', revenue: 4000, orders: 240 },
    { name: 'Feb', revenue: 3000, orders: 198 },
    { name: 'Mar', revenue: 5000, orders: 320 },
    { name: 'Apr', revenue: 4500, orders: 280 },
    { name: 'May', revenue: 6000, orders: 410 },
    { name: 'Jun', revenue: 5500, orders: 380 },
    { name: 'Jul', revenue: 7000, orders: 450 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: '#166534' },
    { name: 'Clothing', value: 25, color: '#22c55e' },
    { name: 'Home & Garden', value: 20, color: '#86efac' },
    { name: 'Sports', value: 12, color: '#bbf7d0' },
    { name: 'Others', value: 8, color: '#dcfce7' },
  ];

  const weeklyOrders = [
    { day: 'Mon', orders: 45 },
    { day: 'Tue', orders: 52 },
    { day: 'Wed', orders: 38 },
    { day: 'Thu', orders: 67 },
    { day: 'Fri', orders: 73 },
    { day: 'Sat', orders: 89 },
    { day: 'Sun', orders: 41 },
  ];

  const stats = [
    {
      title: 'Total Products',
      value: '2,543',
      change: 12,
      isPositive: true,
      icon: Package,
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-500',
    },
    {
      title: 'Low Stock Items',
      value: '23',
      change: null,
      warning: 'Needs attention',
      icon: AlertTriangle,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-500',
    },
    {
      title: 'Pending Orders',
      value: '156',
      change: 8,
      isPositive: true,
      icon: Truck,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Stock Value',
      value: '₹1.2M',
      change: 5.2,
      isPositive: true,
      icon: IndianRupee,
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-500',
    },
  ];

  const topProducts = [
    { id: '1', name: 'iPhone 15 Pro', sold: 234, revenue: '₹2,80,800' },
    { id: '3', name: 'MacBook Pro M3', sold: 156, revenue: '₹3,12,000' },
    { id: '4', name: 'AirPods Pro', sold: 412, revenue: '₹1,02,588' },
    { id: '5', name: 'iPad Air', sold: 189, revenue: '₹1,13,400' },
  ];

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-1">Overview of your inventory analytics</p>
        </div>

        {/* Stats Cards - Unique Style */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon size={24} className={stat.iconBg.replace('bg-', 'text-')} />
                  </div>
                  {stat.change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                      <span>{Math.abs(stat.change)}%</span>
                    </div>
                  )}
                  {stat.warning && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                      {stat.warning}
                    </span>
                  )}
                </div>
                <h3 className="text-sm text-[var(--text-secondary)] font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              </div>
            );
          })}
        </div> */}


        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Revenue Overview</h2>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium border border-purple-100">
                    <Sparkles size={12} />
                    AI Forecast
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">Monthly revenue and orders</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
                  <span className="text-[var(--text-secondary)]">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-300" />
                  <span className="text-[var(--text-secondary)]">Orders</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#166534" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#166534" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Line type="monotone" dataKey="orders" stroke="#86efac" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie Chart */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Sales by Category</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Product distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[var(--text-secondary)]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Orders Bar Chart */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Weekly Orders</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Orders received this week</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }} 
                />
                <Bar dataKey="orders" fill="#166534" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products Table */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Top Products</h2>
                <p className="text-sm text-[var(--text-secondary)]">Best selling items</p>
              </div>
              <button className="text-sm text-[var(--accent)] font-medium hover:underline cursor-pointer">View All</button>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div 
                  key={index} 
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center font-bold text-[var(--accent)]">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">{product.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{product.sold} units sold</p>
                    </div>
                  </div>
                  <span className="font-semibold text-[var(--accent)]">{product.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
