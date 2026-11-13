import { useState, useEffect, useMemo } from 'react';
import { Package, AlertTriangle, Truck, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import purchaseOrderService from '../../services/purchaseOrderService';

const StatsCards = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      productService.getProducts(),
      purchaseOrderService.getPurchaseOrders(),
    ]).then(([prodRes, poRes]) => {
      if (!isMounted) return;
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setProducts(prodRes.value);
      }
      if (poRes.status === 'fulfilled' && Array.isArray(poRes.value)) {
        setPurchaseOrders(poRes.value);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const stockCards = useMemo(() => {
    const totalStockValue = products.reduce(
      (acc, p) => acc + Number(p.price || 0) * Number(p.quantity || 0),
      0
    );

    const lowStockCount = products.filter(
      (p) =>
        Number(p.quantity || 0) <= Number(p.minStockThreshold || 10) ||
        p.status === 'Low Stock' ||
        p.status === 'Out of Stock'
    ).length;

    const pendingOrdersCount = purchaseOrders.filter(
      (po) => (po.status || '').toLowerCase() === 'pending'
    ).length;

    const formatRupee = (val) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    };

    return [
      {
        icon: IndianRupee,
        title: 'Stock value',
        value: formatRupee(totalStockValue),
        change: 'Live Total',
        changeType: 'positive',
        color: '#f3e8ff',
        iconColor: '#9333ea',
        onClick: () => navigate('/inventory'),
      },
      {
        icon: Package,
        title: 'Total products',
        value: products.length.toLocaleString('en-IN'),
        change: `${products.length} SKUs`,
        changeType: 'positive',
        color: '#dcfce7',
        iconColor: '#166534',
        onClick: () => navigate('/inventory'),
      },
      {
        icon: AlertTriangle,
        title: 'Low stock items',
        value: lowStockCount.toLocaleString('en-IN'),
        change: lowStockCount > 0 ? 'Needs attention' : 'Optimal',
        changeType: lowStockCount > 0 ? 'warning' : 'positive',
        color: lowStockCount > 0 ? '#fef3c7' : '#dcfce7',
        iconColor: lowStockCount > 0 ? '#d97706' : '#166534',
        onClick: () => navigate('/inventory'),
      },
      {
        icon: Truck,
        title: 'Pending orders',
        value: pendingOrdersCount.toLocaleString('en-IN'),
        change: pendingOrdersCount > 0 ? `${pendingOrdersCount} Active` : 'All Cleared',
        changeType: pendingOrdersCount > 0 ? 'warning' : 'positive',
        color: '#dbeafe',
        iconColor: '#2563eb',
        onClick: () => navigate('/orders'),
      },
    ];
  }, [products, purchaseOrders, navigate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stockCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            onClick={card.onClick}
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
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
              {loading ? '...' : card.value}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">{card.title}</div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
