import { Link, useLocation } from 'react-router-dom';
import { useDevice } from '../context/DeviceContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Boxes, Calendar } from 'lucide-react';

const Navbar = () => {
  const { isMobile } = useDevice();
  const location = useLocation();

  if (isMobile) return null;

  const navItems = [
    { path: '/stock', label: 'Dashboard', icon: Boxes, isPrimary: true },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/inventory', label: 'Inventory', icon: Package },
  ];

  const rightNavItems = [
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="h-[60px] w-full flex items-center justify-between px-4 lg:px-6 border-b border-[var(--border-soft)] bg-[var(--bg-card)]">
      <div className="flex items-center gap-1 lg:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                active
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-primary)] hover:text-[var(--accent)]'
              }`}
            >
              <Icon size={16} />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="absolute left-1/2 -translate-x-1/2">
        <Link to="/billing" className="flex items-center gap-2 text-xl font-extrabold text-[var(--text-primary)] hover:opacity-80 transition-opacity">
          <img src="/spren-logo.png" alt="Spren Logo" className="w-9 h-9 object-contain" />
          <span>SPREN</span>
        </Link>
      </div>

      <div className="flex items-center gap-1 lg:gap-2">
        {rightNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                active
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-primary)] hover:text-[var(--accent)]'
              }`}
            >
              <Icon size={16} />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
