import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Star, Package, TrendingUp, Clock, ShoppingBag, CreditCard, Sparkles, Eye, X, Printer, Download } from 'lucide-react';
import { CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';
import customerService from '../services/customerService';
import saleService from '../services/saleService';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);

  useEffect(() => {
    const fetchCustomerDetail = async () => {
      try {
        setLoading(true);
        const data = await customerService.getCustomerById(id);
        setCustomer(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-70px)] w-full bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="h-[calc(100vh-70px)] w-full bg-gray-50 flex flex-col items-center justify-center p-6 text-[var(--text-secondary)]">
        <Package size={48} className="text-gray-300 mb-2" />
        <p className="font-semibold text-lg">Customer not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all cursor-pointer font-sans"
        >
          Go Back
        </button>
      </div>
    );
  }

  const totalSpent = customer.purchaseHistory?.reduce((sum, sale) => sum + sale.totalAmount, 0) || 0;
  const totalOrders = customer.purchaseHistory?.length || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
  const lastOrderDate = totalOrders > 0
    ? new Date(customer.purchaseHistory[0].createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Never';

  const memberRank = totalSpent > 50000 ? 'Gold' : totalSpent > 20000 ? 'Silver' : 'Bronze';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mLabel = months[d.getMonth()];
    monthlyData[mLabel] = 0;
  }

  customer.purchaseHistory?.forEach(sale => {
    const saleDate = new Date(sale.createdAt);
    const mLabel = months[saleDate.getMonth()];
    if (mLabel in monthlyData) {
      monthlyData[mLabel] += sale.totalAmount;
    }
  });

  const spendingData = Object.keys(monthlyData).map(m => ({
    month: m,
    amount: monthlyData[m]
  }));

  const handlePrintPastInvoice = async (saleId) => {
    try {
      const blob = await saleService.generateInvoice(saleId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPastInvoice = async (saleId, invoiceNumber) => {
    try {
      const blob = await saleService.generateInvoice(saleId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-[calc(100vh-70px)] w-full bg-gray-50 overflow-hidden">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer font-sans text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            <span>Back to Customers</span>
          </button>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--accent-light)] to-transparent opacity-20 rounded-bl-full -mr-16 -mt-16" />
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] font-bold text-3xl shadow-md border-4 border-white">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200 flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    {memberRank} Member
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {customer.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} />
                      {customer.email}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} />
                    +91 {customer.mobile}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    Joined {new Date(customer.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <CreditCard size={18} />
                </div>
                <span className="text-xs text-gray-500 font-semibold font-sans">Total Spent</span>
              </div>
              <p className="text-xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <ShoppingBag size={18} />
                </div>
                <span className="text-xs text-gray-500 font-semibold font-sans">Total Orders</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <TrendingUp size={18} />
                </div>
                <span className="text-xs text-gray-500 font-semibold font-sans">Average Order</span>
              </div>
              <p className="text-xl font-bold text-gray-900">₹{avgOrderValue.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <Clock size={18} />
                </div>
                <span className="text-xs text-gray-500 font-semibold font-sans">Last Order</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{lastOrderDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Spending Overview</h3>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold border border-purple-100">
                  <Sparkles size={12} />
                  Spending Chart
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendingData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#166534" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#166534" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#166534" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {customer.purchaseHistory && customer.purchaseHistory.length > 0 ? (
                  customer.purchaseHistory.slice(0, 5).map((sale) => (
                    <div 
                      key={sale._id} 
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-150 rounded-xl hover:border-[var(--accent)] transition-all"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{sale.invoiceNumber}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-xs">₹{sale.totalAmount.toLocaleString()}</p>
                          <span className="text-[9px] px-1.5 py-0.2 bg-gray-200 text-gray-700 rounded-md font-medium">
                            {sale.paymentMethod}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedBill(sale);
                            setShowBillingModal(true);
                          }}
                          className="p-1.5 bg-white border border-gray-200 hover:border-[var(--accent)] text-gray-500 hover:text-[var(--accent)] rounded-lg transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                    <Package size={28} className="text-gray-300 mb-1" />
                    <p className="text-xs font-semibold">No invoices found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBillingModal && selectedBill && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl border border-gray-200 shadow-strong overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
              <button
                onClick={() => setShowBillingModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-xl text-[var(--accent)]">Spren</h3>
                  <p className="text-xs text-gray-500 mt-1">Invoice Number: {selectedBill.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">Date: {new Date(selectedBill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold">Paid</span>
                  <p className="text-xs text-gray-500 mt-2">Payment: {selectedBill.paymentMethod}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 flex-shrink-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-200">
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {selectedBill.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.product?.name || "Deleted Product"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          ₹{item.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="w-full max-w-xs ml-auto space-y-2 border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">₹{selectedBill.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-dashed border-gray-200 pt-2">
                  <span>Grand Total</span>
                  <span className="text-lg text-[var(--accent)]">₹{selectedBill.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-200">
                <button
                  onClick={() => handlePrintPastInvoice(selectedBill._id)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-[var(--accent)] text-gray-500 hover:text-[var(--accent)] text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ml-auto font-sans"
                >
                  <Printer size={14} />
                  Print
                </button>
                <button
                  onClick={() => handleDownloadPastInvoice(selectedBill._id, selectedBill.invoiceNumber)}
                  className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-sans"
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
