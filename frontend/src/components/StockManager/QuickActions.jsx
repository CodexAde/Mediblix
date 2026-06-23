import { useState } from 'react';
import { Plus, ClipboardList, ShoppingCart } from 'lucide-react';

const QuickActions = ({ onActionClick }) => {
  const [activeId, setActiveId] = useState(null);

  const quickActions = [
    { id: 'add-product', icon: Plus, label: 'Add New Product', description: 'Register new inventory item' },
    { id: 'purchase-order', icon: ShoppingCart, label: 'Create Purchase Order', description: 'Order from suppliers' },
    { id: 'generate-report', icon: ClipboardList, label: 'Generate Report', description: 'Generate and download inventory reports' },
  ];

  const handleActionClick = (id) => {
    setActiveId(id);
    setTimeout(() => {
      setActiveId(null);
      onActionClick(id);
    }, 200);
  };

  return (
    <div className="lg:col-span-1">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isActive = activeId === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className={`w-full flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-soft)] hover:border-[var(--accent)] hover:shadow-md transition-all text-left cursor-pointer group 
                ${isActive ? 'ring-2 ring-[var(--accent)] ring-offset-2' : ''}
              `}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 bg-[var(--accent)] ${isActive ? 'scale-110' : ''}`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">{action.label}</span>
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
