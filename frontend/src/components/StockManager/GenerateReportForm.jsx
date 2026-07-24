import { useState, useEffect } from 'react';
import { Download, FileText, Table, CheckCircle2, AlertCircle, Calendar, Sparkles, Loader2, BarChart2 } from 'lucide-react';
import productService from '../../services/productService';
import saleService from '../../services/saleService';
import customerService from '../../services/customerService';
import purchaseOrderService from '../../services/purchaseOrderService';
import supplierService from '../../services/supplierService';
import {
  REPORT_TYPES,
  prepareReportData,
  downloadPDFReport,
  downloadExcelReport,
  downloadCSVReport,
} from '../../utils/reportGenerator';

const GenerateReportForm = ({ onClose }) => {
  const [selectedReportType, setSelectedReportType] = useState('stock_summary');
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [includeOptions, setIncludeOptions] = useState({
    priceDetails: true,
    hsnDetails: true,
    supplierInfo: true,
    summaryMetrics: true,
  });

  const [loadingData, setLoadingData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [dataset, setDataset] = useState({
    products: [],
    sales: [],
    customers: [],
    purchaseOrders: [],
    suppliers: [],
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const [productsRes, salesRes, customersRes, poRes, supplierRes] = await Promise.allSettled([
        productService.getProducts(),
        saleService.getSales(),
        customerService.getCustomers(),
        purchaseOrderService.getPurchaseOrders(),
        supplierService.getSuppliers(),
      ]);

      setDataset({
        products: productsRes.status === 'fulfilled' ? productsRes.value : [],
        sales: salesRes.status === 'fulfilled' ? salesRes.value : [],
        customers: customersRes.status === 'fulfilled' ? customersRes.value : [],
        purchaseOrders: poRes.status === 'fulfilled' ? poRes.value : [],
        suppliers: supplierRes.status === 'fulfilled' ? supplierRes.value : [],
      });
    } catch (err) {
      console.error('Error loading report dataset', err);
    } finally {
      setLoadingData(false);
    }
  };

  const currentPreparedData = prepareReportData({
    reportType: selectedReportType,
    products: dataset.products,
    sales: dataset.sales,
    customers: dataset.customers,
    purchaseOrders: dataset.purchaseOrders,
    suppliers: dataset.suppliers,
    dateFrom,
    dateTo,
    options: includeOptions,
  });

  const handleToggleOption = (key) => {
    setIncludeOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateAndDownload = async () => {
    setIsGenerating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const reportPayload = {
        title: currentPreparedData.title,
        columns: currentPreparedData.columns,
        rows: currentPreparedData.rows,
        summaryMetrics: includeOptions.summaryMetrics ? currentPreparedData.summaryMetrics : [],
        dateFrom,
        dateTo,
      };

      if (reportPayload.rows.length === 0) {
        setErrorMessage('No data available for the selected report filters.');
        setIsGenerating(false);
        return;
      }

      if (selectedFormat === 'PDF') {
        downloadPDFReport(reportPayload);
      } else if (selectedFormat === 'Excel') {
        downloadExcelReport(reportPayload);
      } else if (selectedFormat === 'CSV') {
        downloadCSVReport(reportPayload);
      }

      setSuccessMessage(`Successfully generated ${currentPreparedData.title} in ${selectedFormat} format!`);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setErrorMessage('An error occurred while building the report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Alert Banners */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 animate-fadeIn">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Report Category / Type */}
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
            <span>Select Report Type</span>
            <span className="text-xs text-purple-600 font-normal flex items-center gap-1">
              <Sparkles size={12} /> Live Real-time Sync
            </span>
          </label>
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all cursor-pointer text-gray-800 font-medium"
          >
            <optgroup label="📦 Inventory & Stock Reports">
              {REPORT_TYPES.filter((r) => r.category === 'Inventory').map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="💰 Financial & Sales Reports">
              {REPORT_TYPES.filter((r) => r.category === 'Financial').map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="👥 Customer Analytics & Suppliers">
              {REPORT_TYPES.filter((r) => r.category === 'Analytics' || r.category === 'Suppliers').map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Date Range Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-500" /> Date From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-500" /> Date To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm cursor-pointer"
          />
        </div>

        {/* Format Selector */}
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Export Format</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'PDF', label: 'PDF Document', desc: '.pdf layout', icon: FileText, color: 'hover:border-red-500 hover:bg-red-50/50' },
              { id: 'Excel', label: 'Excel Sheet', desc: '.xlsx format', icon: Table, color: 'hover:border-green-500 hover:bg-green-50/50' },
              { id: 'CSV', label: 'CSV File', desc: '.csv raw data', icon: BarChart2, color: 'hover:border-blue-500 hover:bg-blue-50/50' },
            ].map((fmt) => {
              const IconComponent = fmt.icon;
              const isSelected = selectedFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`flex flex-col items-center justify-center p-3.5 border rounded-xl transition-all cursor-pointer ${fmt.color} ${
                    isSelected
                      ? 'border-green-600 bg-green-50/60 shadow-sm ring-1 ring-green-600'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <IconComponent size={22} className={isSelected ? 'text-green-600 mb-1' : 'text-gray-500 mb-1'} />
                  <span className={`text-sm font-bold ${isSelected ? 'text-green-900' : 'text-gray-800'}`}>{fmt.label}</span>
                  <span className="text-xs text-gray-500">{fmt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Metric Preview Box */}
        <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-600" /> Report Summary Preview
            </h4>
            <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              {currentPreparedData.rows.length} Matching Records
            </span>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center py-4 text-xs text-gray-500 gap-2">
              <Loader2 size={16} className="animate-spin text-green-600" /> Loading metrics from database...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentPreparedData.summaryMetrics.map((m, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                  <p className="text-[11px] text-gray-500 truncate">{m.label}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{m.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Include Options */}
        <div className="col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Customizations & Fields</label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { key: 'priceDetails', label: 'Financial & Price Metrics' },
              { key: 'hsnDetails', label: 'HSN & Batch Codes' },
              { key: 'supplierInfo', label: 'Supplier Details' },
              { key: 'summaryMetrics', label: 'Include KPI Metric Banner' },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeOptions[opt.key]}
                  onChange={() => handleToggleOption(opt.key)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                />
                <span className="text-gray-700 text-xs font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleGenerateAndDownload}
          disabled={isGenerating || loadingData}
          className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download size={18} />
              Generate & Download ({selectedFormat})
            </>
          )}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default GenerateReportForm;
