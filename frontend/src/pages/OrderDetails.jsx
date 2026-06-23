import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Package, Truck, Calendar, DollarSign, MapPin, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import purchaseOrderService from '../services/purchaseOrderService';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState('');

  const mockOrders = {
    '1': {
      id: '1',
      supplier: 'Cipla Pharmaceuticals',
      contact: 'info@cipla.com',
      phone: '+91 98765 43210',
      status: 'Delivered',
      orderDate: '2024-12-01',
      deliveryDate: '2024-12-04',
      total: 4500,
      items: [
        { name: 'Calpol 650', quantity: 100, price: 32, total: 3200 },
        { name: 'Combiflam', quantity: 27, price: 48, total: 1300 },
      ],
      shipping: {
        address: 'Peninsula Chambers, Ganpatrao Kadam Marg, Lower Parel, Mumbai, Maharashtra 400013',
        carrier: 'BlueDart Express',
        tracking: 'BD1234567890',
      },
    },
    '2': {
      id: '2',
      supplier: 'Sun Pharma Industries',
      contact: 'contact@sunpharma.com',
      phone: '+91 87654 32109',
      status: 'In Transit',
      orderDate: '2024-12-03',
      deliveryDate: '2024-12-08',
      total: 18500,
      items: [
        { name: 'Mox 500', quantity: 100, price: 115, total: 11500 },
        { name: 'Limcee 500', quantity: 166, price: 42, total: 7000 },
      ],
      shipping: {
        address: 'Sun House, Western Express Highway, Goregaon East, Mumbai, Maharashtra 400063',
        carrier: 'Delhivery',
        tracking: 'DV987654321',
      },
    },
    '3': {
      id: '3',
      supplier: 'Dr. Reddy\'s Laboratories',
      contact: 'support@drreddys.com',
      phone: '+91 76543 21098',
      status: 'Processing',
      orderDate: '2024-12-04',
      deliveryDate: '2024-12-11',
      total: 6500,
      items: [
        { name: 'Glycomet 500', quantity: 50, price: 85, total: 4250 },
        { name: 'Pan 40', quantity: 18, price: 122, total: 2250 },
      ],
      shipping: {
        address: '8-2-337, Road No. 3, Banjara Hills, Hyderabad, Telangana 500034',
        carrier: 'BlueDart Express',
        tracking: 'BD456789123',
      },
    }
  };

  useEffect(() => {
    const loadOrder = async () => {
      if (id.length < 12) {
        if (mockOrders[id]) {
          setOrder(mockOrders[id]);
        }
        setLoading(false);
        return;
      }

      try {
        const data = await purchaseOrderService.getPurchaseOrderById(id);
        const mappedOrder = {
          id: data._id,
          supplier: data.supplierName,
          contact: data.supplierEmail || `info@${data.supplierName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          phone: data.supplierPhone || '+91 98765 43210',
          status: data.status,
          orderDate: new Date(data.createdAt).toLocaleDateString(),
          deliveryDate: new Date(new Date(data.createdAt).getTime() + 3*24*60*60*1000).toLocaleDateString(),
          total: data.totalAmount,
          items: data.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price
          })),
          shipping: {
            address: data.deliveryAddress || 'Peninsula Chambers, Ganpatrao Kadam Marg, Lower Parel, Mumbai, Maharashtra 400013',
            carrier: 'BlueDart Express',
            tracking: 'BD' + data._id.substring(data._id.length - 10).toUpperCase(),
          }
        };
        setOrder(mappedOrder);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (id.length < 12) {
      setOrder(prev => ({ ...prev, status: newStatus }));
      return;
    }
    setUpdatingStatus(true);
    try {
      const updated = await purchaseOrderService.updatePurchaseOrderStatus(id, newStatus);
      setOrder(prev => ({ ...prev, status: updated.status }));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const onSelectStatus = (newStatus) => {
    if (newStatus === 'Delivered') {
      setPendingStatusChange(newStatus);
      setShowConfirmModal(true);
    } else {
      handleStatusChange(newStatus);
    }
  };

  const confirmStatusChange = () => {
    handleStatusChange(pendingStatusChange);
    setShowConfirmModal(false);
    setPendingStatusChange('');
  };

  const cancelStatusChange = () => {
    setShowConfirmModal(false);
    setPendingStatusChange('');
  };

  const performanceData = [
    { month: 'Jul', onTime: 95, quality: 92 },
    { month: 'Aug', onTime: 88, quality: 94 },
    { month: 'Sep', onTime: 92, quality: 96 },
    { month: 'Oct', onTime: 97, quality: 95 },
    { month: 'Nov', onTime: 95, quality: 98 },
    { month: 'Dec', onTime: 98, quality: 97 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'In Transit': return 'bg-purple-100 text-purple-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-500">
        <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-4" />
        <span className="font-medium text-lg">Loading Order Details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-500 p-4">
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium"
        >
          Back To Orders
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-70px)] w-full bg-gray-50 overflow-hidden">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-all cursor-pointer text-gray-900"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
              <p className="text-sm text-gray-500">Placed on {order.orderDate}</p>
            </div>
            {order.status === 'Delivered' ? (
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                Delivered
              </span>
            ) : (
              <div className="relative">
                <select
                  value={order.status}
                  onChange={(e) => onSelectStatus(e.target.value)}
                  disabled={updatingStatus}
                  className={`appearance-none pr-8 pl-4 py-1.5 rounded-full text-sm font-semibold cursor-pointer border-0 outline-none ${getStatusColor(order.status)}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            
            <div className="col-span-2 space-y-4">
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{order.supplier}</h2>
                    <p className="text-sm text-gray-500">Supplier</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 font-medium">{order.contact}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phone</p>
                    <p className="text-gray-900 font-medium">{order.phone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package size={16} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">₹{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-green-600 text-lg">₹{order.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Information</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500 mb-1">Delivery Address</p>
                      <p className="text-gray-900">{order.shipping.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500 mb-1">Carrier</p>
                      <p className="text-gray-900">{order.shipping.carrier}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500 mb-1">Tracking Number</p>
                      <p className="text-gray-900 font-mono">{order.shipping.tracking}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Timeline</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <div>
                      <p className="text-gray-500">Ordered</p>
                      <p className="text-gray-900 font-medium">{order.orderDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <div>
                      <p className="text-gray-500">Estimated Delivery</p>
                      <p className="text-gray-900 font-medium">{order.deliveryDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Supplier Performance</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[80, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="onTime" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 3 }}
                      name="On-Time %"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="quality" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 3 }}
                      name="Quality %"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">98%</p>
                    <p className="text-xs text-gray-500">On-Time Delivery</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">97%</p>
                    <p className="text-xs text-gray-500">Quality Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={cancelStatusChange}
          />
          <div className="relative bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all animate-toast">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delivery</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure the purchase order has been delivered? This will automatically add the items and their quantities into the inventory stock.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmStatusChange}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Yes, Delivered
              </button>
              <button
                type="button"
                onClick={cancelStatusChange}
                className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
