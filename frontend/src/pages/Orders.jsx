import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Truck, Clock, CheckCircle, Building, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import purchaseOrderService from '../services/purchaseOrderService';
import AddPurchaseOrderChoiceModal from '../components/Orders/AddPurchaseOrderChoiceModal';
import AddPurchaseOrderDrawer from '../components/Orders/AddPurchaseOrderDrawer';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await purchaseOrderService.getPurchaseOrders();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      try {
        await purchaseOrderService.deletePurchaseOrder(id);
        fetchOrders();
      } catch (error) {
        console.error(error);
      }
    }
  };

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

  const mockOrders = [
    { _id: '1', supplierName: 'Tech Supplies Inc.', items: [{ productName: 'USB-C Cables' }, { productName: 'Power Adapters' }, { productName: 'Phone Cases' }], totalAmount: 45000, status: 'Delivered', createdAt: '2024-12-01T12:00:00.000Z' },
    { _id: '2', supplierName: 'Apple Inc.', items: [{ productName: 'iPhone 15 Pro' }, { productName: 'AirPods Pro' }, { productName: 'MacBook Pro' }], totalAmount: 185000, status: 'In Transit', createdAt: '2024-12-03T12:00:00.000Z' },
    { _id: '3', supplierName: 'Samsung Electronics', items: [{ productName: 'Galaxy S24' }, { productName: 'Galaxy Watch' }], totalAmount: 65000, status: 'Processing', createdAt: '2024-12-04T12:00:00.000Z' }
  ];

  const displayedOrders = orders.length > 0 ? orders : mockOrders;

  const filteredOrders = displayedOrders.filter(order => {
    const supplier = order.supplierName || '';
    const itemsList = order.items ? order.items.map(it => it.productName).join(', ') : '';
    return supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
           itemsList.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Purchase Orders</h1>
            <p className="text-[var(--text-secondary)] mt-1">Track orders placed to suppliers</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border-soft)] bg-white text-[var(--text-primary)] rounded-xl hover:bg-gray-50 transition-all font-medium cursor-pointer"
              onClick={() => navigate('/suppliers')}
            >
              <Building size={18} className="text-green-600" />
              Suppliers
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 transition-all font-medium cursor-pointer"
              onClick={() => setIsChoiceModalOpen(true)}
            >
              <Plus size={18} />
              Create Order
            </button>
          </div>
        </div>

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

        {loading ? (
          <div className="p-8 text-center text-[var(--text-secondary)]">Loading purchase orders...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString();
              const itemsList = order.items ? order.items.map(it => it.productName).join(', ') : '';
              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/order-detail/${order._id}`)}
                  className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-soft)] hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors truncate max-w-[130px]">{order.supplierName}</p>
                        <p className="text-xs text-[var(--text-secondary)] truncate max-w-[130px]">Order #{order._id}</p>
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
                      <span className="font-medium text-[var(--text-primary)]">{order.items ? order.items.length : 0} items</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Total Amount:</span>
                      <span className="font-semibold text-green-600">${order.totalAmount ? order.totalAmount.toLocaleString() : 0}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Items:</p>
                    <p className="text-sm text-[var(--text-primary)] line-clamp-2">{itemsList}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-[var(--text-secondary)]">{formattedDate}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDelete(order._id, e)}
                        className="p-1.5 bg-white border border-gray-100 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button className="text-xs text-[var(--accent)] font-medium hover:underline">View Details →</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddPurchaseOrderChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onManualSelect={() => setIsDrawerOpen(true)}
      />

      <AddPurchaseOrderDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOrderCreated={fetchOrders}
      />
    </div>
  );
};

export default Orders;
