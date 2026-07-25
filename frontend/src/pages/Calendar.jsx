import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Package, ShoppingCart, TrendingUp, AlertCircle, FileText, ArrowUpDown, Clock } from 'lucide-react';
import importHistoryService from '../services/importHistoryService';
import saleService from '../services/saleService';
import purchaseOrderService from '../services/purchaseOrderService';
import productService from '../services/productService';
import { useNavigate } from 'react-router-dom';

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('boarded'); // 'boarded', 'sales', 'purchases'

  // Datasets
  const [importHistory, setImportHistory] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [historyData, salesData, poData, productsData] = await Promise.all([
          importHistoryService.getImportHistory(),
          saleService.getSales(),
          purchaseOrderService.getPurchaseOrders(),
          productService.getProducts(),
        ]);
        setImportHistory(historyData || []);
        setSales(salesData || []);
        setPurchaseOrders(poData || []);
        setProducts(productsData || []);
      } catch (err) {
        console.error('Error fetching calendar activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, []);

  // Calendar Helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  // Helper to compare dates without time
  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Build boarded items from imports + manually added products
  const getBoardedItemsForDate = (date) => {
    const dayImports = importHistory.filter((item) => isSameDay(new Date(item.createdAt), date));
    const importSkus = new Set();
    const items = [];

    dayImports.forEach((record) => {
      record.items?.forEach((item) => {
        importSkus.add(item.sku);
        items.push({
          ...item,
          fileName: record.fileName,
          importId: record._id,
          createdAt: record.createdAt,
        });
      });
    });

    products.forEach((product) => {
      if (!product.createdAt || !isSameDay(new Date(product.createdAt), date)) return;
      if (importSkus.has(product.sku)) return;

      items.push({
        name: product.name,
        sku: product.sku || 'N/A',
        quantity: product.quantity,
        price: product.price,
        status: 'New',
        fileName: 'Manual Entry',
        createdAt: product.createdAt,
        productId: product._id,
      });
    });

    return items;
  };

  // Check if a date has activities
  const getDateActivities = (date) => {
    const daySales = sales.filter((item) => isSameDay(new Date(item.createdAt), date));
    const dayPurchases = purchaseOrders.filter((item) => isSameDay(new Date(item.createdAt), date));
    const boardedItems = getBoardedItemsForDate(date);

    return {
      sales: daySales,
      purchases: dayPurchases,
      boardedItems,
      hasActivity: boardedItems.length > 0 || daySales.length > 0 || dayPurchases.length > 0,
    };
  };

  // Generate calendar days grid
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Blank slots for previous month's trailing days
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Calendar days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Filter activities for selected date
  const selectedDayActivities = selectedDate
    ? getDateActivities(selectedDate)
    : { boardedItems: [], sales: [], purchases: [] };
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedBoardedItems = selectedDayActivities.boardedItems || [];

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <CalendarIcon className="text-[var(--accent)]" size={30} />
              Activity Calendar
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Select a date to audit stock onboarding, sales billing, and supplier orders
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/stock')}
            className="self-start sm:self-auto px-4 py-2 border border-[var(--border-soft)] hover:bg-gray-50 text-[var(--text-primary)] rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Clock size={16} /> Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)] gap-4">
            <div className="w-12 h-12 border-4 border-green-200 border-t-[var(--accent)] rounded-full animate-spin" />
            <p className="font-semibold text-md">Loading daily activity log...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Calendar Grid */}
            <div className="lg:col-span-7 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] shadow-xs">
              
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 border border-[var(--border-soft)] rounded-lg hover:bg-gray-100 transition-all text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1.5 border border-[var(--border-soft)] rounded-lg hover:bg-gray-100 text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 border border-[var(--border-soft)] rounded-lg hover:bg-gray-100 transition-all text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Weekday Names */}
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-xs font-bold text-gray-500 uppercase tracking-wider py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square bg-gray-50/50 rounded-xl border border-dashed border-gray-100" />;
                  }

                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isSelected = isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, new Date());
                  const dayAct = getDateActivities(date);

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() => handleDateClick(day)}
                      className={`relative aspect-square flex flex-col justify-between p-2 rounded-xl border transition-all cursor-pointer text-left group
                        ${isSelected 
                          ? 'border-[var(--accent)] bg-green-50/40 ring-1 ring-[var(--accent)] shadow-sm' 
                          : isToday 
                            ? 'border-green-300 bg-emerald-50/20' 
                            : 'border-[var(--border-soft)] bg-white hover:border-gray-400 hover:shadow-xs'
                        }
                      `}
                    >
                      {/* Day Number */}
                      <span className={`text-xs font-bold ${
                        isSelected 
                          ? 'text-[var(--accent)]' 
                          : isToday 
                            ? 'text-green-700 font-extrabold' 
                            : 'text-[var(--text-primary)]'
                      }`}>
                        {day}
                      </span>

                      {/* Dot Indicators */}
                      {dayAct.hasActivity && (
                        <div className="flex gap-1 mt-auto items-center">
                          {dayAct.boardedItems.length > 0 && (
                            <span 
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500" 
                              title={`${dayAct.boardedItems.length} stock boarded`} 
                            />
                          )}
                          {dayAct.sales.length > 0 && (
                            <span 
                              className="w-1.5 h-1.5 rounded-full bg-purple-500" 
                              title={`${dayAct.sales.length} sales`} 
                            />
                          )}
                          {dayAct.purchases.length > 0 && (
                            <span 
                              className="w-1.5 h-1.5 rounded-full bg-amber-500" 
                              title={`${dayAct.purchases.length} purchase orders`} 
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[var(--border-soft)] text-xs text-[var(--text-secondary)] font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> Stock Boarded
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block" /> Sales Billing
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" /> Purchase Orders
                </span>
              </div>

            </div>

            {/* Right Column: Daily Audit Detail Panel */}
            <div className="lg:col-span-5 flex flex-col bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] shadow-xs overflow-hidden">
              
              {/* Detail Panel Header */}
              <div className="p-5 border-b border-[var(--border-soft)] bg-white">
                <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Daily Operations Audit
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                  {selectedDate.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
              </div>

              {/* Selected Day Stats Metrics Banner */}
              <div className="grid grid-cols-3 gap-px bg-[var(--border-soft)] border-b border-[var(--border-soft)]">
                <div className="bg-white p-3.5 text-center">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Boarded</p>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">
                    {selectedBoardedItems.length}
                  </p>
                  <p className="text-[9px] text-gray-400">items added</p>
                </div>
                <div className="bg-white p-3.5 text-center">
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Sales</p>
                  <p className="text-lg font-bold text-purple-700 mt-0.5">
                    ₹{selectedDayActivities.sales.reduce((sum, item) => sum + (item.totalAmount || 0), 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {selectedDayActivities.sales.length} invoices
                  </p>
                </div>
                <div className="bg-white p-3.5 text-center">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Purchased</p>
                  <p className="text-lg font-bold text-amber-700 mt-0.5">
                    ₹{selectedDayActivities.purchases.reduce((sum, item) => sum + (item.totalAmount || 0), 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {selectedDayActivities.purchases.length} orders
                  </p>
                </div>
              </div>

              {/* Tabs Panel */}
              <div className="flex border-b border-[var(--border-soft)] bg-white text-sm">
                <button
                  onClick={() => setActiveTab('boarded')}
                  className={`flex-1 py-3 text-center font-bold border-b-2 transition-all cursor-pointer
                    ${activeTab === 'boarded' 
                      ? 'border-emerald-600 text-emerald-950 bg-emerald-50/20' 
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  Boarded ({selectedBoardedItems.length})
                </button>
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`flex-1 py-3 text-center font-bold border-b-2 transition-all cursor-pointer
                    ${activeTab === 'sales' 
                      ? 'border-purple-600 text-purple-950 bg-purple-50/20' 
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  Sales ({selectedDayActivities.sales.length})
                </button>
                <button
                  onClick={() => setActiveTab('purchases')}
                  className={`flex-1 py-3 text-center font-bold border-b-2 transition-all cursor-pointer
                    ${activeTab === 'purchases' 
                      ? 'border-amber-600 text-amber-950 bg-amber-50/20' 
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  Purchases ({selectedDayActivities.purchases.length})
                </button>
              </div>

              {/* Activity Details List Scrollable View */}
              <div className="flex-1 overflow-y-auto p-4 max-h-[380px]">
                
                {/* 1. Boarded Items Tab Content */}
                {activeTab === 'boarded' && (
                  <div className="space-y-3">
                    {selectedBoardedItems.length === 0 ? (
                      <div className="text-center py-12 text-[var(--text-secondary)]">
                        <Package size={36} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-sm">No stock boarded on this day.</p>
                      </div>
                    ) : (
                      selectedBoardedItems.map((item, idx) => (
                        <div 
                          key={idx}
                          className="p-3 bg-white border border-[var(--border-soft)] rounded-xl hover:shadow-2xs transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-[var(--text-primary)] text-sm">{item.name}</h4>
                              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">SKU: {item.sku}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'New' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 text-xs text-[var(--text-secondary)]">
                            <span>Qty: <strong className="text-[var(--text-primary)]">{item.quantity}</strong></span>
                            <span>Value: <strong className="text-[var(--text-primary)]">₹{(item.quantity * item.price).toLocaleString('en-IN')}</strong></span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1 truncate">
                            Source: {item.fileName}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 2. Sales Invoices Tab Content */}
                {activeTab === 'sales' && (
                  <div className="space-y-3">
                    {selectedDayActivities.sales.length === 0 ? (
                      <div className="text-center py-12 text-[var(--text-secondary)]">
                        <ShoppingCart size={36} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-sm">No sales billed on this day.</p>
                      </div>
                    ) : (
                      selectedDayActivities.sales.map((sale) => (
                        <div 
                          key={sale._id}
                          className="p-3 bg-white border border-[var(--border-soft)] rounded-xl hover:shadow-2xs transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-[var(--text-primary)] text-sm">
                                {sale.invoiceNumber}
                              </h4>
                              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                Customer: {sale.customer?.name || 'Walk-in'}
                              </p>
                            </div>
                            <span className="font-bold text-sm text-purple-700">
                              ₹{sale.totalAmount.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Invoice Items list */}
                          <div className="mt-2.5 space-y-1 bg-gray-50 p-2 rounded-lg text-xs">
                            {sale.items?.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-gray-600">
                                <span>{it.product?.name || 'Product'} × {it.quantity}</span>
                                <span>₹{(it.quantity * it.price).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center mt-2.5 text-[10px] text-gray-400">
                            <span>Payment: {sale.paymentMethod}</span>
                            <span>{new Date(sale.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. Purchase Orders Tab Content */}
                {activeTab === 'purchases' && (
                  <div className="space-y-3">
                    {selectedDayActivities.purchases.length === 0 ? (
                      <div className="text-center py-12 text-[var(--text-secondary)]">
                        <Package size={36} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-sm">No purchase orders on this day.</p>
                      </div>
                    ) : (
                      selectedDayActivities.purchases.map((po) => (
                        <div 
                          key={po._id}
                          className="p-3 bg-white border border-[var(--border-soft)] rounded-xl hover:shadow-2xs transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-[var(--text-primary)] text-sm">
                                Supplier: {po.supplierName}
                              </h4>
                              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                {po.items?.length || 0} items ordered
                              </p>
                            </div>
                            <span className="font-bold text-sm text-amber-700">
                              ₹{po.totalAmount.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Purchase items summary */}
                          <div className="mt-2 space-y-1 bg-gray-50 p-2 rounded-lg text-xs text-gray-600">
                            {po.items?.slice(0, 3).map((it, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="truncate max-w-[180px]">{it.productName}</span>
                                <span>{it.quantity} units</span>
                              </div>
                            ))}
                            {po.items?.length > 3 && (
                              <div className="text-[10px] text-gray-400 text-right">
                                + {po.items.length - 3} more items
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              po.status === 'Delivered' 
                                ? 'bg-green-50 text-green-700' 
                                : po.status === 'In Transit'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                            }`}>
                              {po.status}
                            </span>
                            <span>{new Date(po.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Calendar;
