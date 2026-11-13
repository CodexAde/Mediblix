import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Edit3, FileText, Table, FileSpreadsheet, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import {
  prepareReportData,
  downloadPDFReport,
  downloadExcelReport,
  downloadCSVReport,
  REPORT_TYPES,
} from "../../utils/reportGenerator";

const AddProductChoiceModal = ({ isOpen, onClose, onManualSelect, onProductAdded }) => {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const [showReports, setShowReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState("stock_summary");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (firstElement) {
      setTimeout(() => {
        firstElement.focus();
      }, 50);
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "Tab") {
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    let isMounted = true;
    if (showReports && products.length === 0) {
      productService
        .getProducts()
        .then((data) => {
          if (isMounted) {
            setProducts(data);
            setLoadingProducts(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setLoadingProducts(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [showReports, products.length]);

  if (!isOpen) return null;

  const handleSeedSample = async () => {
    try {
      setSeedingLoading(true);
      const res = await productService.seedSampleProducts();
      alert(`Success! Loaded ${res.count || 12} sample Indian pharmacy medicines into your inventory.`);
      if (onProductAdded) {
        await onProductAdded();
      }
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to load sample stock");
    } finally {
      setSeedingLoading(false);
    }
  };

  const handleQuickDownload = (format) => {
    const prepared = prepareReportData({
      reportType: selectedReport,
      products,
    });

    if (prepared.rows.length === 0) {
      alert("No data available for this report. Make sure you have products in inventory.");
      return;
    }

    if (format === "PDF") downloadPDFReport(prepared);
    else if (format === "Excel") downloadExcelReport(prepared);
    else if (format === "CSV") downloadCSVReport(prepared);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div ref={modalRef} className="relative bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-xl shadow-2xl transform transition-all animate-toast max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Product</h2>
            <p className="text-sm text-gray-500 mt-0.5">Choose how you want to register new items</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              onClose();
              navigate("/ai-import?type=inventory");
            }}
            className="flex flex-col items-start p-5 bg-green-50/20 border border-green-100 rounded-2xl hover:border-[var(--accent)] hover:shadow-md transition-all text-left group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 bg-green-100 text-[var(--accent)] text-[10px] font-bold px-2 py-0.5 rounded-bl-xl uppercase tracking-wider">
              AI Mode
            </div>
            <div className="w-10 h-10 bg-green-100 text-[var(--accent)] rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">AI Import</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-3">
              Upload JPEG images or PDF sheets of supplier invoices to auto-parse products.
            </p>
            <span className="text-xs text-[var(--accent)] font-semibold mt-4 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Start Import →
            </span>
          </button>

          <button
            onClick={() => {
              onClose();
              onManualSelect();
            }}
            className="flex flex-col items-start p-5 bg-gray-50/50 border border-gray-200 rounded-2xl hover:border-[var(--accent)] hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 bg-green-50 text-[var(--accent)] rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Edit3 size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Manual Register</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-3">
              Fill out a standard form to register a single item manually into catalog database.
            </p>
            <span className="text-xs text-[var(--accent)] font-semibold mt-4 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Open Form →
            </span>
          </button>
        </div>

        <div className="mt-4">
          <button
            type="button"
            disabled={seedingLoading}
            onClick={handleSeedSample}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all text-left group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <Zap size={20} className={seedingLoading ? "animate-spin" : ""} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">⚡ Load Sample Indian Stock</h3>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">1-Click</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Populate 12 standard Indian medicines (Calpol, Dolo, Augmentin, etc.) with real batches & suppliers.
                </p>
              </div>
            </div>
            <span className="text-xs text-amber-800 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 flex-shrink-0 ml-2">
              {seedingLoading ? "Loading..." : "Load Now →"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <button
              type="button"
              onClick={() => setShowReports(!showReports)}
              className="bg-white px-4 py-1 text-xs font-semibold text-gray-500 hover:text-green-700 border border-gray-200 rounded-full transition-all cursor-pointer flex items-center gap-1.5 hover:border-green-300 hover:bg-green-50"
            >
              <FileText size={13} />
              Quick Report Downloads
              {showReports ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Expandable Report Section */}
        {showReports && (
          <div className="space-y-3 animate-fadeIn">
            {/* Report Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all cursor-pointer text-gray-800 font-medium"
              >
                <optgroup label="📦 Inventory & Stock">
                  {REPORT_TYPES.filter((r) => r.category === "Inventory").map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </optgroup>
                <optgroup label="💰 Financial & Sales">
                  {REPORT_TYPES.filter((r) => r.category === "Financial").map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </optgroup>
                <optgroup label="👥 Analytics & Suppliers">
                  {REPORT_TYPES.filter((r) => r.category === "Analytics" || r.category === "Suppliers").map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Download Format Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickDownload("PDF")}
                disabled={loadingProducts}
                className="flex flex-col items-center justify-center p-3 bg-red-50/60 border border-red-100 rounded-xl hover:border-red-300 hover:shadow-sm transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <FileText className="text-red-600" size={16} />
                </div>
                <span className="text-xs font-bold text-gray-800">PDF</span>
                <span className="text-[10px] text-gray-400">.pdf</span>
              </button>

              <button
                onClick={() => handleQuickDownload("Excel")}
                disabled={loadingProducts}
                className="flex flex-col items-center justify-center p-3 bg-green-50/60 border border-green-100 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Table className="text-green-600" size={16} />
                </div>
                <span className="text-xs font-bold text-gray-800">Excel</span>
                <span className="text-[10px] text-gray-400">.xlsx</span>
              </button>

              <button
                onClick={() => handleQuickDownload("CSV")}
                disabled={loadingProducts}
                className="flex flex-col items-center justify-center p-3 bg-blue-50/60 border border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="text-blue-600" size={16} />
                </div>
                <span className="text-xs font-bold text-gray-800">CSV</span>
                <span className="text-[10px] text-gray-400">.csv</span>
              </button>
            </div>

            {loadingProducts && (
              <p className="text-[11px] text-gray-400 text-center">Loading inventory data...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProductChoiceModal;
