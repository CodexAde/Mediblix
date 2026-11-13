import { useState, useEffect, useMemo } from 'react';
import { Package, AlertTriangle, Truck, IndianRupee, Sparkles, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import saleService from '../services/saleService';
import purchaseOrderService from '../services/purchaseOrderService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [productsRes, salesRes, ordersRes] = await Promise.allSettled([
        productService.getProducts(),
        saleService.getSales(),
        purchaseOrderService.getPurchaseOrders(),
      ]);

      if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)) {
        setProducts(productsRes.value);
      }
      if (salesRes.status === 'fulfilled' && Array.isArray(salesRes.value)) {
        setSales(salesRes.value);
      }
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setPurchaseOrders(ordersRes.value);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    setLoading(true);
    loadData();
  };

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      productService.getProducts(),
      saleService.getSales(),
      purchaseOrderService.getPurchaseOrders(),
    ]).then(([productsRes, salesRes, ordersRes]) => {
      if (!isMounted) return;
      if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)) {
        setProducts(productsRes.value);
      }
      if (salesRes.status === 'fulfilled' && Array.isArray(salesRes.value)) {
        setSales(salesRes.value);
      }
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setPurchaseOrders(ordersRes.value);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const lowStockCount = products.filter(
      (p) => Number(p.quantity || 0) <= Number(p.minStockThreshold || 20)
    ).length;

    const pendingOrdersCount = purchaseOrders.filter(
      (po) => (po.status || '').toLowerCase() === 'pending'
    ).length;

    const totalStockVal = products.reduce(
      (acc, p) => acc + Number(p.price || 0) * Number(p.quantity || 0),
      0
    );

    const totalRevenueVal = sales.reduce(
      (acc, s) => acc + Number(s.totalAmount || 0),
      0
    );

    const formatRupee = (val) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    };

    return [
      {
        title: 'Total Products',
        value: products.length.toLocaleString('en-IN'),
        icon: Package,
        bgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-700',
        onClick: () => navigate('/inventory'),
      },
      {
        title: 'Low Stock Items',
        value: lowStockCount.toLocaleString('en-IN'),
        warning: lowStockCount > 0 ? 'Needs Attention' : 'Healthy',
        icon: AlertTriangle,
        bgColor: lowStockCount > 0 ? 'bg-amber-50' : 'bg-emerald-50',
        iconColor: lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-700',
        onClick: () => navigate('/inventory'),
      },
      {
        title: 'Pending Orders',
        value: pendingOrdersCount.toLocaleString('en-IN'),
        warning: pendingOrdersCount > 0 ? 'In Pipeline' : 'Cleared',
        icon: Truck,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        onClick: () => navigate('/orders'),
      },
      {
        title: 'Stock Value',
        value: formatRupee(totalStockVal),
        subtitle: `Revenue: ${formatRupee(totalRevenueVal)}`,
        icon: IndianRupee,
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
        onClick: () => navigate('/inventory'),
      },
    ];
  }, [products, sales, purchaseOrders, navigate]);

  const revenueData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });

      const filtered = sales.filter((s) => {
        const itemDate = new Date(s.createdAt || s.date);
        return itemDate.getMonth() === monthIdx && itemDate.getFullYear() === year;
      });

      const rev = filtered.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);
      months.push({
        name: monthLabel,
        revenue: Math.round(rev),
        orders: filtered.length,
      });
    }

    return months;
  }, [sales]);

  const categoryData = useMemo(() => {
    const catMap = {};
    products.forEach((p) => {
      const cat = (p.category || 'General').trim();
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const total = products.length || 1;
    const palette = ['#166534', '#15803d', '#22c55e', '#4ade80', '#86efac', '#a7f3d0'];

    const sorted = Object.entries(catMap)
      .map(([name, count]) => ({
        name,
        count,
        value: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    if (sorted.length === 0) {
      return [{ name: 'No Products', value: 100, color: '#e5e7eb', count: 0 }];
    }

    return sorted.slice(0, 5).map((item, idx) => ({
      ...item,
      color: palette[idx % palette.length],
    }));
  }, [products]);

  const weeklyOrders = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return weekLabels.map((day, idx) => {
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + idx);
      const targetStr = targetDate.toDateString();

      const count = sales.filter((s) => {
        const saleDate = new Date(s.createdAt || s.date);
        return saleDate.toDateString() === targetStr;
      }).length;

      return { day, orders: count };
    });
  }, [sales]);

  const topProducts = useMemo(() => {
    const prodMap = {};

    sales.forEach((s) => {
      if (Array.isArray(s.items)) {
        s.items.forEach((item) => {
          const id = item.product?._id || item.product || item._id;
          const name = item.product?.name || item.name || 'Medicine Product';
          const qty = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          const total = Number(item.subtotal) || qty * price;

          if (!prodMap[id]) {
            prodMap[id] = { id, name, sold: 0, revenue: 0 };
          }
          prodMap[id].sold += qty;
          prodMap[id].revenue += total;
        });
      }
    });

    const ranked = Object.values(prodMap)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map((p) => ({
        ...p,
        revenueFormatted: `₹${Math.round(p.revenue).toLocaleString('en-IN')}`,
      }));

    if (ranked.length > 0) return ranked;

    return products.slice(0, 5).map((p) => ({
      id: p._id,
      name: p.name,
      sold: 0,
      revenueFormatted: `₹${Number(p.price || 0).toLocaleString('en-IN')}`,
    }));
  }, [sales, products]);

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-[var(--text-secondary)] mt-1">Overview of your live pharmacy inventory and sales analytics</p>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] transition-all text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Live Data</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={stat.onClick}
                className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon size={24} className={stat.iconColor} />
                  </div>
                  {stat.warning && (
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        stat.warning === 'Needs Attention'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {stat.warning}
                    </span>
                  )}
                </div>
                <h3 className="text-sm text-[var(--text-secondary)] font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">{stat.subtitle}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Revenue Overview</h2>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium border border-emerald-200">
                    <Sparkles size={12} />
                    Live Analytics
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">Monthly revenue and invoice count</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#166534]" />
                  <span className="text-[var(--text-secondary)]">Revenue (₹)</span>
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
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#166534" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Line type="monotone" dataKey="orders" stroke="#86efac" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Inventory by Category</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Stock distribution</p>
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
                  formatter={(val, name, item) => [`${val}% (${item.payload.count || 0} items)`, item.payload.name]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[var(--text-secondary)] truncate max-w-[140px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Weekly Orders</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Invoices generated this week</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [`${val} Invoices`, 'Orders']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="orders" fill="#166534" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Top Products</h2>
                <p className="text-sm text-[var(--text-secondary)]">Best selling medicine stock</p>
              </div>
              <button
                onClick={() => navigate('/inventory')}
                className="text-sm text-[var(--accent)] font-medium hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--text-secondary)] bg-gray-50 rounded-xl">
                  No products found in inventory.
                </div>
              ) : (
                topProducts.map((product, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(product.id ? `/product/${product.id}` : '/inventory')}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center font-bold text-[var(--accent)]">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                          {product.name}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">{product.sold} units sold</p>
                      </div>
                    </div>
                    <span className="font-semibold text-[var(--accent)]">{product.revenueFormatted}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
