import { useEffect, useRef, useState } from "react";
import { X, FileText, Table, FileSpreadsheet, Sparkles, SlidersHorizontal } from "lucide-react";
import GenerateReportForm from "../StockManager/GenerateReportForm";
import { downloadPDFReport, downloadExcelReport, downloadCSVReport, prepareReportData } from "../../utils/reportGenerator";

const ExportModal = ({ isOpen, onClose, data = [] }) => {
  const modalRef = useRef(null);
  const [activeTab, setActiveTab] = useState("custom_reports"); // 'quick' | 'custom_reports'

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

  if (!isOpen) return null;

  const quickExportExcel = () => {
    const prepared = prepareReportData({
      reportType: "stock_summary",
      products: data,
    });
    downloadExcelReport(prepared);
    onClose();
  };

  const quickExportPDF = () => {
    const prepared = prepareReportData({
      reportType: "stock_summary",
      products: data,
    });
    downloadPDFReport(prepared);
    onClose();
  };

  const quickExportCSV = () => {
    const prepared = prepareReportData({
      reportType: "stock_summary",
      products: data,
    });
    downloadCSVReport(prepared);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className="relative bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-green-600" size={22} /> Reports & Export Center
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Download stock, financial, sales tax, and customer reports in PDF, Excel, or CSV
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 bg-gray-100 p-1.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("custom_reports")}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "custom_reports"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <SlidersHorizontal size={14} /> Full Report Generator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quick")}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "quick"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileSpreadsheet size={14} /> Quick Inventory Export
          </button>
        </div>

        {activeTab === "custom_reports" ? (
          <GenerateReportForm onClose={onClose} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Quickly download your currently visible catalog inventory list ({data.length} items) in your preferred file format:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={quickExportExcel}
                className="flex flex-col items-center justify-center p-5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Table className="text-green-600" size={20} />
                </div>
                <span className="text-gray-900 font-bold text-sm">Excel Sheet</span>
                <span className="text-[11px] text-gray-500 mt-0.5">.xlsx format</span>
              </button>

              <button
                onClick={quickExportPDF}
                className="flex flex-col items-center justify-center p-5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FileText className="text-red-600" size={20} />
                </div>
                <span className="text-gray-900 font-bold text-sm">PDF Document</span>
                <span className="text-[11px] text-gray-500 mt-0.5">.pdf format</span>
              </button>

              <button
                onClick={quickExportCSV}
                className="flex flex-col items-center justify-center p-5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="text-blue-600" size={20} />
                </div>
                <span className="text-gray-900 font-bold text-sm">CSV File</span>
                <span className="text-[11px] text-gray-500 mt-0.5">.csv raw data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportModal;
