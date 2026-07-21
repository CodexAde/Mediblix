import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Calendar, ShoppingCart, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import productService from '../services/productService';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatStock = (qty, tabletsPerStrip) => {
    if (qty <= 0) return '0 Tablets';
    return `${qty} Tablets`;
  };

  const recentOrders = [
    { id: 'PO-001', date: '2 Dec 2024', quantity: 50, status: 'Received' },
    { id: 'PO-002', date: '15 Nov 2024', quantity: 30, status: 'Received' },
    { id: 'PO-003', date: '1 Nov 2024', quantity: 40, status: 'Pending' },
  ];

  const chartData = [
    { month: 'Jan', sales: 45, stock: 32 },
    { month: 'Feb', sales: 52, stock: 28 },
    { month: 'Mar', sales: 48, stock: 35 },
    { month: 'Apr', sales: 60, stock: 22 },
    { month: 'May', sales: 55, stock: 30 },
    { month: 'Jun', sales: 58, stock: 25 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-70px)] bg-gray-50 text-gray-500">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <span className="font-semibold text-lg">Loading Product Details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-70px)] bg-gray-50 text-gray-500 p-4">
        <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
        <button
          onClick={() => navigate('/inventory')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium cursor-pointer"
        >
          Back To Inventory
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
              className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-all cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-sm text-gray-500">Sku: {product.sku}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Product Information</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <p className="font-medium text-gray-900">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">HSN</p>
                    <p className="font-medium text-gray-900">{product.hsn || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="font-medium text-gray-900">₹{product.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                    <p className="font-medium text-green-600">{formatStock(product.quantity, 1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mfg Date</p>
                    <p className="font-medium text-gray-900 font-sans">
                      {product.mfgDate ? new Date(product.mfgDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                    <p className="font-medium text-red-600 font-sans">
                      {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Purchase Orders</h2>
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all cursor-pointer border border-gray-100">
                      <div className="flex items-center gap-3">
                        <ShoppingCart size={16} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{order.id}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{order.quantity} units</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Chart & Stock Info */}
            <div className="space-y-4">
              {/* Sales & Stock Chart */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900">Sales & Stock Trend</h2>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium border border-purple-100">
                    <Sparkles size={12} />
                    AI Forecast
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                      name="Sales"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stock" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      name="Stock Level"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Stock Locations */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Stock by Location</h2>
                <div className="space-y-2">
                  {[
                    { name: 'Main Pharmacy Store', stock: formatStock(product.quantity, product.tabletsPerStrip) }
                  ].map((location) => (
                    <div key={location.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{location.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{location.stock}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Health */}
              {/* <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Stock Health</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current</span>
                    <span className="font-semibold text-gray-900">{product.stock}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Minimum</span>
                    <span className="font-semibold text-gray-900">{product.minStock}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${product.stock > product.minStock ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min((product.stock / product.minStock) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {product.stock > product.minStock ? '✓ Stock is healthy' : '⚠ Stock is low'}
                  </p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
