import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Table, 
  IndianRupee, 
  Filter, 
  Layers, 
  BarChart2, 
  FileCheck, 
  AlertTriangle,
  RotateCcw,
  Users
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import importHistoryService from '../services/importHistoryService';
import saleService from '../services/saleService';
import purchaseOrderService from '../services/purchaseOrderService';
import productService from '../services/productService';
import customerService from '../services/customerService';
import supplierService from '../services/supplierService';
import {
  REPORT_TYPES,
  prepareReportData,
  downloadPDFReport,
  downloadExcelReport,
  downloadCSVReport,
} from '../utils/reportGenerator';

const Audits = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'reports');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [dataset, setDataset] = useState({
    products: [],
    sales: [],
    customers: [],
    purchaseOrders: [],
    suppliers: [],
    importHistory: [],
  });

  const [selectedReportType, setSelectedReportType] = useState('gst_tax');
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [includeOptions, setIncludeOptions] = useState({
    priceDetails: true,
    hsnDetails: true,
    supplierInfo: true,
    summaryMetrics: true,
    includeExpiry: true,
    customerContact: true,
    reorderAdvice: true,
    profitMargins: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchData();
    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyData, salesData, poData, productsData, customersData, suppliersData] = await Promise.allSettled([
        importHistoryService.getImportHistory(),
        saleService.getSales(),
        purchaseOrderService.getPurchaseOrders(),
        productService.getProducts(),
        customerService.getCustomers(),
        supplierService.getSuppliers(),
      ]);

      setDataset({
        importHistory: historyData.status === 'fulfilled' ? historyData.value || [] : [],
        sales: salesData.status === 'fulfilled' ? salesData.value || [] : [],
        purchaseOrders: poData.status === 'fulfilled' ? poData.value || [] : [],
        products: productsData.status === 'fulfilled' ? productsData.value || [] : [],
        customers: customersData.status === 'fulfilled' ? customersData.value || [] : [],
        suppliers: suppliersData.status === 'fulfilled' ? suppliersData.value || [] : [],
      });
    } catch (err) {
      console.error('Error fetching audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
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

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const getBoardedItemsForDate = (date) => {
    const dayImports = dataset.importHistory.filter((item) => isSameDay(new Date(item.createdAt), date));
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

    dataset.products.forEach((product) => {
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

  const getDateActivities = (date) => {
    const daySales = dataset.sales.filter((item) => isSameDay(new Date(item.createdAt), date));
    const dayPurchases = dataset.purchaseOrders.filter((item) => isSameDay(new Date(item.createdAt), date));
    const boardedItems = getBoardedItemsForDate(date);

    return {
      sales: daySales,
      purchases: dayPurchases,
      boardedItems,
      hasActivity: boardedItems.length > 0 || daySales.length > 0 || dayPurchases.length > 0,
    };
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const selectedDayActivities = selectedDate
    ? getDateActivities(selectedDate)
    : { boardedItems: [], sales: [], purchases: [] };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleGenerateReport = async (overrideType = null, overrideFormat = null) => {
    const typeToUse = overrideType || selectedReportType;
    const formatToUse = overrideFormat || selectedFormat;

    setIsGenerating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const prepared = prepareReportData({
        reportType: typeToUse,
        products: dataset.products,
        sales: dataset.sales,
        customers: dataset.customers,
        purchaseOrders: dataset.purchaseOrders,
        suppliers: dataset.suppliers,
        dateFrom,
        dateTo,
        options: includeOptions,
      });

      if (formatToUse === 'PDF') {
        downloadPDFReport(prepared);
      } else if (formatToUse === 'Excel') {
        downloadExcelReport(prepared);
      } else if (formatToUse === 'CSV') {
        downloadCSVReport(prepared);
      }

      setSuccessMessage(`Successfully generated ${prepared.title} in ${formatToUse} format!`);
    } catch (err) {
      console.error('Error generating report:', err);
      setErrorMessage('Failed to generate report. Please check data filters.');
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateGSTStats = () => {
    let totalSalesVal = 0;
    let totalGSTVal = 0;
    let totalInvoices = dataset.sales.length;

    dataset.sales.forEach(sale => {
      totalSalesVal += (sale.totalAmount || 0);
      totalGSTVal += (sale.taxAmount || ((sale.totalAmount || 0) * 0.12));
    });

    return { totalSalesVal, totalGSTVal, totalInvoices };
  };

  const gstStats = calculateGSTStats();

  const lowStockItems = dataset.products.filter(p => (p.quantity || 0) <= 15);

  return (
    <div className="min-h-full w-full bg-[var(--bg-main)] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Audits & Reports</h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                Mediblix Business Suite
              </span>
            </div>
            <p className="text-[var(--text-secondary)] mt-1">
              Generate GST tax reports, audit daily activity logs, inspect inventory valuations, and export statutory statements
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleGenerateReport('gst_tax', 'PDF')}
              className="px-4 py-2 bg-[var(--accent)] text-white hover:opacity-90 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <FileCheck size={16} /> Quick GST PDF
            </button>
            <button 
              onClick={() => navigate('/stock')}
              className="px-4 py-2 border border-[var(--border-soft)] hover:bg-gray-50 text-[var(--text-primary)] rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Clock size={16} /> Back to Dashboard
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[var(--border-soft)] overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--text-primary)]'
            }`}
          >
            <FileSpreadsheet size={18} /> Reports & GST Generator
          </button>
          <button
            onClick={() => setActiveTab('activity-calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'activity-calendar'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--text-primary)]'
            }`}
          >
            <CalendarIcon size={18} /> Activity Audit Calendar
          </button>
          <button
            onClick={() => setActiveTab('gst-compliance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gst-compliance'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--text-primary)]'
            }`}
          >
            <ShieldCheck size={18} /> GST & Tax Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('stock-audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stock-audit'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--text-primary)]'
            }`}
          >
            <AlertTriangle size={18} /> Stock & Discrepancy Audit ({lowStockItems.length})
          </button>
        </div>

        {/* TAB 1: REPORTS & GST GENERATOR */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Quick Report Presets */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] shadow-xs">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600" /> Quick Report Presets
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4">Click any preset below to generate and download immediate statutory reports</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handleGenerateReport('gst_tax', 'PDF')}
                  className="p-4 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 bg-emerald-600 text-white rounded-lg"><FileText size={16} /></span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md">GST Tax</span>
                  </div>
                  <h3 className="font-bold text-sm text-emerald-950 group-hover:text-emerald-700">GST & Tax Breakdown</h3>
                  <p className="text-xs text-emerald-800 mt-1">GSTR-1, GSTR-3B HSN tax splits & CGST/SGST logs</p>
                </button>

                <button
                  onClick={() => handleGenerateReport('stock_summary', 'Excel')}
                  className="p-4 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 bg-blue-600 text-white rounded-lg"><Table size={16} /></span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-200 text-blue-900 rounded-md">Excel</span>
                  </div>
                  <h3 className="font-bold text-sm text-blue-950 group-hover:text-blue-700">Stock Valuation Summary</h3>
                  <p className="text-xs text-blue-800 mt-1">Complete product valuation, batches & HSN codes</p>
                </button>

                <button
                  onClick={() => handleGenerateReport('low_stock', 'PDF')}
                  className="p-4 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 bg-amber-600 text-white rounded-lg"><AlertTriangle size={16} /></span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md">Audit</span>
                  </div>
                  <h3 className="font-bold text-sm text-amber-950 group-hover:text-amber-700">Low Stock & Out of Stock</h3>
                  <p className="text-xs text-amber-800 mt-1">Reorder quantity recommendations & stock alerts</p>
                </button>

                <button
                  onClick={() => handleGenerateReport('financial_sales', 'PDF')}
                  className="p-4 bg-purple-50 hover:bg-purple-100/70 border border-purple-200 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 bg-purple-600 text-white rounded-lg"><TrendingUp size={16} /></span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-purple-200 text-purple-900 rounded-md">Financial</span>
                  </div>
                  <h3 className="font-bold text-sm text-purple-950 group-hover:text-purple-700">Sales & Revenue Audit</h3>
                  <p className="text-xs text-purple-800 mt-1">Customer invoices, payments & gross margins</p>
                </button>
              </div>
            </div>

            {/* Custom Report Generation Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Controls Form */}
              <div className="lg:col-span-8 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] space-y-6">
                
                {successMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 text-sm font-semibold">
                    <AlertCircle size={18} className="text-red-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 1. Report Type Selection */}
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Select Report Category & Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {REPORT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedReportType(type.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedReportType === type.id
                            ? 'border-[var(--accent)] bg-green-50/50 ring-1 ring-[var(--accent)] font-bold text-[var(--text-primary)]'
                            : 'border-[var(--border-soft)] hover:bg-gray-50 text-[var(--text-secondary)] font-medium'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">{type.category}</span>
                        <span className="text-xs block leading-tight">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Format Selection */}
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Select File Export Format</label>
                  <div className="flex gap-4">
                    {['PDF', 'Excel', 'CSV'].map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setSelectedFormat(format)}
                        className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          selectedFormat === format
                            ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs'
                            : 'border-[var(--border-soft)] bg-white text-[var(--text-secondary)] hover:bg-gray-50'
                        }`}
                      >
                        {format === 'PDF' && <FileText size={16} />}
                        {format === 'Excel' && <Table size={16} />}
                        {format === 'CSV' && <FileSpreadsheet size={16} />}
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Date Range Filter */}
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Date Range Filter (Optional)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-[var(--text-secondary)] font-medium block mb-1">From Date</span>
                      <input 
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--text-secondary)] font-medium block mb-1">To Date</span>
                      <input 
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border-soft)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Options Toggles */}
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Data Customization Toggles</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium">
                    {Object.keys(includeOptions).map((key) => (
                      <label key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                        <input 
                          type="checkbox"
                          checked={includeOptions[key]}
                          onChange={(e) => setIncludeOptions({ ...includeOptions, [key]: e.target.checked })}
                          className="accent-[var(--accent)] rounded"
                        />
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleGenerateReport()}
                  disabled={isGenerating}
                  className="w-full py-3.5 bg-[var(--accent)] hover:opacity-90 text-white font-bold text-base rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  {isGenerating ? 'Generating Audit Report...' : `Download ${selectedReportType.replace(/_/g, ' ').toUpperCase()} (${selectedFormat})`}
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="lg:col-span-4 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] space-y-6">
                <h3 className="font-bold text-md text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-3 flex items-center gap-2">
                  <BarChart2 size={18} className="text-[var(--accent)]" /> Report Audit Summary
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-800 block">Total GST Collected</span>
                    <span className="text-xl font-bold text-emerald-950">₹{gstStats.totalGSTVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Calculated across {gstStats.totalInvoices} sales invoices</span>
                  </div>

                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-xs font-semibold text-blue-800 block">Total Products in Database</span>
                    <span className="text-xl font-bold text-blue-950">{dataset.products.length} Items</span>
                    <span className="text-[10px] text-blue-700 block mt-0.5">Includes HSN, expiry & batch data</span>
                  </div>

                  <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                    <span className="text-xs font-semibold text-purple-800 block">Total Sales Revenue</span>
                    <span className="text-xl font-bold text-purple-950">₹{gstStats.totalSalesVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <span className="text-xs font-semibold text-amber-800 block">Low Stock Alerts (≤15 Units)</span>
                    <span className="text-xl font-bold text-amber-950">{lowStockItems.length} Products</span>
                    <span className="text-[10px] text-amber-700 block mt-0.5">Requires immediate distributor reorder</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVITY AUDIT CALENDAR */}
        {activeTab === 'activity-calendar' && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)] gap-4">
                <div className="w-12 h-12 border-4 border-green-200 border-t-[var(--accent)] rounded-full animate-spin" />
                <p className="font-semibold text-md">Loading daily activity log...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Calendar Grid */}
                <div className="lg:col-span-7 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] shadow-xs">
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

                  <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="text-xs font-bold text-gray-500 uppercase tracking-wider py-2">
                        {d}
                      </div>
                    ))}
                  </div>

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
                              ? 'border-[var(--accent)] bg-green-50/40 ring-1 ring-[var(--accent)] shadow-xs' 
                              : isToday 
                                ? 'border-green-300 bg-emerald-50/20' 
                                : 'border-[var(--border-soft)] bg-white hover:border-gray-400 hover:shadow-xs'
                            }
                          `}
                        >
                          <span className={`text-xs font-bold ${
                            isSelected 
                              ? 'text-[var(--accent)]' 
                              : isToday 
                                ? 'text-green-700 font-extrabold' 
                                : 'text-[var(--text-primary)]'
                          }`}>
                            {day}
                          </span>

                          {dayAct.hasActivity && (
                            <div className="flex gap-1 mt-auto items-center">
                              {dayAct.boardedItems.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" title={`${dayAct.boardedItems.length} stock boarded`} />
                              )}
                              {dayAct.sales.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 block" title={`${dayAct.sales.length} sales`} />
                              )}
                              {dayAct.purchases.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block" title={`${dayAct.purchases.length} purchase orders`} />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day Details Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] shadow-xs">
                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">
                      Daily Audit: {selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mb-4">Stock onboarding, sales billing, and purchase orders</p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2 flex items-center justify-between">
                          <span>Boarded Items</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">{selectedDayActivities.boardedItems.length}</span>
                        </h4>
                        {selectedDayActivities.boardedItems.length === 0 ? (
                          <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl">No stock items boarded on this date.</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {selectedDayActivities.boardedItems.map((item, idx) => (
                              <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-bold text-gray-900">{item.name}</p>
                                  <p className="text-gray-500 text-[10px]">SKU: {item.sku} | Source: {item.fileName}</p>
                                </div>
                                <span className="font-bold text-emerald-700">{item.quantity} units</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2 flex items-center justify-between">
                          <span>Sales Billing</span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-bold">{selectedDayActivities.sales.length}</span>
                        </h4>
                        {selectedDayActivities.sales.length === 0 ? (
                          <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl">No sales recorded on this date.</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {selectedDayActivities.sales.map((sale, idx) => (
                              <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-bold text-gray-900">Inv #{sale.invoiceNumber || idx+1}</p>
                                  <p className="text-gray-500 text-[10px]">{sale.paymentMethod} | {sale.items?.length || 0} items</p>
                                </div>
                                <span className="font-bold text-purple-700">₹{sale.totalAmount}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GST & TAX AUDIT LOGS */}
        {activeTab === 'gst-compliance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Total Sales Tax Base</span>
                <span className="text-2xl font-extrabold text-[var(--text-primary)]">₹{gstStats.totalSalesVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
                <span className="text-xs font-bold text-emerald-700 uppercase block mb-1">Estimated GST Collected (CGST + SGST)</span>
                <span className="text-2xl font-extrabold text-emerald-700">₹{gstStats.totalGSTVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)]">
                <span className="text-xs font-bold text-purple-700 uppercase block mb-1">Statutory Invoice Count</span>
                <span className="text-2xl font-extrabold text-purple-700">{gstStats.totalInvoices} Invoices</span>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[var(--text-primary)]">Invoices GST Audit Log</h3>
                <button 
                  onClick={() => handleGenerateReport('gst_tax', 'PDF')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download size={14} /> Export GST Statement
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase border-b border-gray-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Gross Amount</th>
                      <th className="p-3">Taxable Value</th>
                      <th className="p-3">CGST (6%)</th>
                      <th className="p-3">SGST (6%)</th>
                      <th className="p-3">Total GST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dataset.sales.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-4 text-center text-gray-400">No sales transactions logged.</td>
                      </tr>
                    ) : (
                      dataset.sales.slice(0, 15).map((sale, i) => {
                        const total = sale.totalAmount || 0;
                        const gst = sale.taxAmount || (total * 0.12);
                        const cgst = gst / 2;
                        const sgst = gst / 2;
                        const taxable = total - gst;

                        return (
                          <tr key={i} className="hover:bg-gray-50 font-medium">
                            <td className="p-3">{new Date(sale.createdAt || Date.now()).toLocaleDateString('en-IN')}</td>
                            <td className="p-3 font-bold text-gray-900">{sale.invoiceNumber || `INV-${i+1001}`}</td>
                            <td className="p-3">{sale.paymentMethod || 'Cash'}</td>
                            <td className="p-3 font-bold">₹{total.toFixed(2)}</td>
                            <td className="p-3 text-gray-600">₹{taxable.toFixed(2)}</td>
                            <td className="p-3 text-emerald-600">₹{cgst.toFixed(2)}</td>
                            <td className="p-3 text-emerald-600">₹{sgst.toFixed(2)}</td>
                            <td className="p-3 font-bold text-emerald-700">₹{gst.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STOCK & DISCREPANCY AUDIT */}
        {activeTab === 'stock-audit' && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">Low Stock & Reorder Audit</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Items with quantity ≤ 15 requiring immediate reordering</p>
                </div>
                <button 
                  onClick={() => handleGenerateReport('low_stock', 'PDF')}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download size={14} /> Download Low Stock PDF
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase border-b border-gray-200">
                    <tr>
                      <th className="p-3">SKU / Batch</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Current Quantity</th>
                      <th className="p-3">Unit Price</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Recommended Reorder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lowStockItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-emerald-600 font-bold">All stock levels are optimal! No items below threshold.</td>
                      </tr>
                    ) : (
                      lowStockItems.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50 font-medium">
                          <td className="p-3 font-mono text-gray-600">{item.sku || 'N/A'}</td>
                          <td className="p-3 font-bold text-gray-900">{item.name}</td>
                          <td className="p-3">{item.category || 'General'}</td>
                          <td className="p-3 font-bold text-amber-700">{item.quantity} Units</td>
                          <td className="p-3">₹{item.price}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">Low Stock</span>
                          </td>
                          <td className="p-3 font-bold text-emerald-700">+{Math.max(50 - item.quantity, 30)} Units</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Audits;
