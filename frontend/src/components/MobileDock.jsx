import { Link, useLocation } from 'react-router-dom';
import { useDevice } from '../context/DeviceContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, FileSpreadsheet } from 'lucide-react';

const MobileDock = () => {
  const { isMobile } = useDevice();
  const location = useLocation();

  if (!isMobile) return null;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/audits', icon: FileSpreadsheet, label: 'Audits' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-[var(--bg-card)] rounded-2xl px-6 py-3 flex items-center gap-4 border border-[var(--border-soft)]"
           style={{ boxShadow: 'var(--shadow-strong)' }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'scale-110' : 'scale-100 opacity-70'
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                    : 'hover:bg-[var(--border-soft)]'
                }`}
              >
                <Icon size={20} strokeWidth={2.5} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileDock;
