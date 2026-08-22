import { useState } from 'react';
import { LayoutDashboard, Package, Users, BarChart3, Clock, Plus, Menu, Sparkles, ShoppingCart, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [fizzyId, setFizzyId] = useState(null);

  const dashboards = [
    {
      id: 'inventory',
      icon: Package,
      title: 'Inventory Control',
      description: 'Track stock levels & movements',
      color: '#dcfce7',
      iconColor: '#166534',
      path: '/inventory'
    },
    {
      id: 'orders',
      icon: ShoppingCart,
      title: 'Order Management',
      description: 'Process supplier & customer orders',
      color: '#dbeafe',
      iconColor: '#1e40af',
      path: '/orders'
    },
    {
      id: 'suppliers',
      icon: Truck,
      title: 'Supplier Network',
      description: 'Manage supplier relationships',
      color: '#fee2e2',
      iconColor: '#991b1b',
      path: '/suppliers'
    },
    {
      id: 'analytics',
      icon: Sparkles,
      title: 'AI Forecast',
      description: 'Ask AI for everything...',
      color: '#f3e8ff',
      iconColor: '#7e22ce',
      isAI: true
    },
  ];

  const handleCardClick = (dashboard) => {
    if (dashboard.isAI) {
      setFizzyId(dashboard.id);
      setTimeout(() => {
        setFizzyId(null);
        // Navigate or trigger AI modal here if needed
      }, 400);
    } else if (dashboard.path) {
      navigate(dashboard.path);
    }
  };

  const proTips = [
    'Use AI Search to quickly find low stock items',
    'Click on product names to view detailed history',
    'Generate AI reports for smart forecasting',
  ];

  const recentActivity = [
    { text: 'Stock alert: "Calpol 650" is running low', status: 'warning' },
    { text: 'New shipment received from Cipla Pharmaceuticals', status: 'success' },
    { text: 'Purchase order #PO-003 approved', status: 'success' },
  ];

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] flex items-center justify-center p-8">
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center">
                <LayoutDashboard size={28} className="text-[var(--accent)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Inventory Hub</h1>
                <p className="text-[var(--text-secondary)]">Manage your business with AI precision</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-[var(--text-secondary)] text-lg">
              Centralized control for your products, orders, and suppliers. Use AI-powered insights to optimize your stock levels.
            </p>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboards.map((dashboard, index) => {
                const Icon = dashboard.icon;
                const isFizzy = fizzyId === dashboard.id;
                
                return (
                  <div
                    key={index}
                    onClick={() => handleCardClick(dashboard)}
                    className={`bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] hover:border-[var(--accent)] hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden
                      ${dashboard.isAI ? 'hover:border-purple-400' : ''}
                      ${isFizzy ? 'animate-fizzy ring-2 ring-purple-400 ring-offset-2' : ''}
                    `}
                  >
                    {dashboard.isAI && <div className="absolute top-0 right-0 p-2"><Sparkles size={16} className="text-purple-400 opacity-50" /></div>}
                    
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 ${isFizzy ? 'scale-110 rotate-12' : ''}`}
                      style={{ backgroundColor: dashboard.color }}
                    >
                      <Icon size={24} style={{ color: dashboard.iconColor }} className={dashboard.isAI && !isFizzy ? 'animate-pulse' : ''} />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                      {dashboard.title}
                    </h3>
                    <p className={`text-sm ${dashboard.isAI ? 'text-purple-600 font-medium' : 'text-[var(--text-secondary)]'}`}>
                      {dashboard.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/inventory')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[var(--accent)] text-white font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                <Package size={20} />
                Go to Inventory
              </button>
              <button className="px-6 py-4 bg-[var(--bg-card)] text-[var(--text-primary)] font-semibold rounded-xl border border-[var(--border-soft)] hover:border-[var(--accent)] transition-all flex items-center gap-2 cursor-pointer">
                <Plus size={20} />
                Quick Add
              </button>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Pro Tips */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#fef3c7] flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Smart Tips</h2>
              </div>
              <div className="space-y-4">
                {proTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#fef3c7] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#d97706]">{index + 1}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{tip}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 border-2 border-[#fef3c7] text-[var(--text-primary)] font-medium rounded-xl hover:bg-[#fef3c7] transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Sparkles size={18} className="text-amber-600" />
                Ask AI Assistant
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} className="text-[var(--text-secondary)]" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Updates</h2>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        activity.status === 'success' ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                    />
                    <p className="text-sm text-[var(--text-secondary)]">{activity.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
