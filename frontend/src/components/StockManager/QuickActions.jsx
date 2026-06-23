import { Plus, ShoppingCart, Clock, Sparkles } from 'lucide-react';

const QuickActions = ({ onActionClick }) => {
  const quickActions = [
    { id: 'add-product', icon: Plus, label: 'Add New Product', description: 'Register new inventory item', isAI: false },
    { id: 'purchase-order', icon: ShoppingCart, label: 'Create Purchase Order', description: 'Order from suppliers', isAI: false },
    { id: 'bill-history', icon: Clock, label: 'Bill History', description: 'View and manage past sales bills', isAI: false },
    { id: 'generate-report', icon: Sparkles, label: 'Ai Analytics Report', description: 'Generate smart insights & forecasts', isAI: true },
  ];

  return (
    <div className="lg:col-span-1">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.id)}
              className={`w-full flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-soft)] hover:border-[var(--accent)] hover:shadow-md transition-all active:scale-[0.99] text-left cursor-pointer group 
                ${action.isAI ? 'border-purple-200 bg-purple-50/30 hover:border-purple-400' : ''}
              `}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${action.isAI ? 'bg-purple-600' : 'bg-[var(--accent)]'}`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">{action.label}</span>
                  {action.isAI && <Sparkles size={14} className="text-purple-600 animate-pulse" />}
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
