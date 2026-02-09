import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Package, Truck, Calendar, DollarSign, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock order data
  const order = {
    id: id,
    supplier: 'Tech Supplies Inc.',
    contact: 'contact@techsupplies.com',
    phone: '+1 (555) 123-4567',
    status: 'Delivered',
    orderDate: '2024-12-01',
    deliveryDate: '2024-12-04',
    total: 45000,
    items: [
      { name: 'USB-C Cables', quantity: 200, price: 50, total: 10000 },
      { name: 'Power Adapters', quantity: 100, price: 150, total: 15000 },
      { name: 'Phone Cases', quantity: 300, price: 50, total: 15000 },
      { name: 'Screen Protectors', quantity: 100, price: 50, total: 5000 },
    ],
    shipping: {
      address: '123 Supplier Street, Tech City, NY 10001',
      carrier: 'FedEx Express',
      tracking: 'FX1234567890',
    },
  };

  // Supplier performance data
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

  return (
    <div className="h-[calc(100vh-70px)] w-full bg-gray-50 overflow-hidden">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-all cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
              <p className="text-sm text-gray-500">Placed on {order.orderDate}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Left Column - Order Details */}
            <div className="col-span-2 space-y-4">
              {/* Supplier Info */}
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

              {/* Order Items */}
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

              {/* Shipping Info */}
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

            {/* Right Column - Performance Chart */}
            <div className="space-y-4">
              {/* Timeline */}
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
                      <p className="text-gray-500">Delivered</p>
                      <p className="text-gray-900 font-medium">{order.deliveryDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Performance */}
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
    </div>
  );
};

export default OrderDetails;
