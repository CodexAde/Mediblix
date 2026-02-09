import { useState } from 'react';
import { ShoppingCart, Search, Truck, Clock, CheckCircle, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Supplier purchase orders
  const supplierOrders = [
    { id: '1', supplier: 'Tech Supplies Inc.', products: 5, total: 45000, status: 'Delivered', date: '2024-12-01', items: 'USB-C Cables, Power Adapters, Phone Cases', deliveryTime: '3 days' },
    { id: '2', supplier: 'Apple Inc.', products: 3, total: 185000, status: 'In Transit', date: '2024-12-03', items: 'iPhone 15 Pro, AirPods Pro, MacBook Pro', deliveryTime: '5 days' },
    { id: '3', supplier: 'Samsung Electronics', products: 2, total: 65000, status: 'Processing', date: '2024-12-04', items: 'Galaxy S24, Galaxy Watch', deliveryTime: '7 days' },
    { id: '4', supplier: 'Audio World', products: 4, total: 32000, status: 'Delivered', date: '2024-11-28', items: 'Earphones, Headsets, Speakers', deliveryTime: '2 days' },
    { id: '5', supplier: 'Screen Guard Co.', products: 6, total: 18000, status: 'Pending', date: '2024-12-05', items: 'Screen Protectors, Tempered Glass', deliveryTime: '4 days' },
    { id: '6', supplier: 'Case Pro Ltd.', products: 8, total: 24000, status: 'In Transit', date: '2024-12-02', items: 'Phone Cases, Tablet Cases', deliveryTime: '6 days' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'In Transit': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Processing': return <ShoppingCart size={16} />;
      case 'In Transit': return <Truck size={16} />;
      case 'Delivered': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredOrders = supplierOrders.filter(order =>
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Purchase Orders</h1>
          <p className="text-[var(--text-secondary)] mt-1">Track orders placed to suppliers</p>
        </div>

        {/* Search */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-soft)]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search by supplier or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/order-detail/${order.id}`)}
              className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-soft)] hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]  transition-colors">{order.supplier}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Order #{order.id}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Products:</span>
                  <span className="font-medium text-[var(--text-primary)]">{order.products} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Total:</span>
                  <span className="font-semibold text-green-600">₹{order.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Delivery:</span>
                  <span className="font-medium text-[var(--text-primary)]">{order.deliveryTime}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Items:</p>
                <p className="text-sm text-[var(--text-primary)] line-clamp-2">{order.items}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-[var(--text-secondary)]">{order.date}</span>
                <button className="text-xs text-[var(--accent)] font-medium hover:underline">View Details →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
