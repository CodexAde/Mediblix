import { Package, TrendingUp, AlertTriangle, Truck, DollarSign } from 'lucide-react';

const StatsCards = () => {
  const stockCards = [
    {
      icon: Package,
      title: 'Total Products',
      value: '2,543',
      change: '+12%',
      changeType: 'positive',
      color: '#dcfce7',
      iconColor: '#166534',
    },
    {
      icon: AlertTriangle,
      title: 'Low Stock Items',
      value: '23',
      change: 'Needs attention',
      changeType: 'warning',
      color: '#fef3c7',
      iconColor: '#d97706',
    },
    {
      icon: Truck,
      title: 'Pending Orders',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      color: '#dbeafe',
      iconColor: '#2563eb',
    },
    {
      icon: DollarSign,
      title: 'Stock Value',
      value: '$1.2M',
      change: '+5.2%',
      changeType: 'positive',
      color: '#f3e8ff',
      iconColor: '#9333ea',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stockCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: card.color }}
              >
                <Icon size={24} style={{ color: card.iconColor }} />
              </div>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-lg ${
                  card.changeType === 'positive'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {card.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{card.value}</div>
            <div className="text-sm text-[var(--text-secondary)]">{card.title}</div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
