import { useState } from 'react';
import { Plus, ArrowUpDown, ShoppingCart, BarChart3, Sparkles } from 'lucide-react';

const QuickActions = ({ onActionClick }) => {
  const [fizzyId, setFizzyId] = useState(null);

  const quickActions = [
    { id: 'add-product', icon: Plus, label: 'Add New Product', description: 'Register new inventory item' },
    { id: 'stock-transfer', icon: ArrowUpDown, label: 'Stock Transfer', description: 'Move stock between locations' },
    { id: 'purchase-order', icon: ShoppingCart, label: 'Create Purchase Order', description: 'Order from suppliers' },
    { id: 'generate-report', icon: Sparkles, label: 'AI Analytics Report', description: 'Generate smart insights & forecasts' },
  ];

  const handleActionClick = (id) => {
    if (id === 'generate-report') {
      setFizzyId(id);
      setTimeout(() => {
        setFizzyId(null);
        onActionClick(id);
      }, 400); // Wait for animation
    } else {
      onActionClick(id);
    }
  };

  return (
    <div className="lg:col-span-1">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isAI = action.id === 'generate-report';
          const isFizzy = fizzyId === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className={`w-full flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-soft)] hover:border-[var(--accent)] hover:shadow-md transition-all text-left cursor-pointer group 
                ${isAI ? 'border-purple-200 bg-purple-50/30' : ''}
                ${isFizzy ? 'animate-fizzy ring-2 ring-purple-400 ring-offset-2' : ''}
              `}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isAI ? 'bg-purple-600' : 'bg-[var(--accent)]'} ${isFizzy ? 'scale-110 rotate-12' : ''}`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">{action.label}</span>
                  {isAI && <Sparkles size={14} className={`text-purple-600 ${isFizzy ? 'animate-spin' : 'animate-pulse'}`} />}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
