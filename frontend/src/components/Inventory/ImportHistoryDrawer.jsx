import { useState, useEffect } from "react";
import { X, Calendar, FileText, Trash2, ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import importHistoryService from "../../services/importHistoryService";

const ImportHistoryDrawer = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      fetchHistory();
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setSelectedRecord(null);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await importHistoryService.getImportHistory();
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this import record?")) {
      try {
        await importHistoryService.deleteImportRecord(id);
        if (selectedRecord && selectedRecord._id === id) {
          setSelectedRecord(null);
        }
        fetchHistory();
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-700 ${isVisible && isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-700 ${isVisible && isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl h-full bg-white shadow-2xl transform transition-transform duration-700 ease-custom p-6 flex flex-col ${isVisible && isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            {selectedRecord && (
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg mr-1 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedRecord ? "Import Details" : "Import History"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="w-8 h-8 border-2 border-green-200 border-t-[var(--accent)] rounded-full animate-spin mb-3" />
              <span>Loading Import History...</span>
            </div>
          ) : !selectedRecord ? (
            history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
                <FileText size={48} className="mb-3 text-gray-300" />
                <p className="font-medium text-gray-900">No Import History Found</p>
                <p className="text-sm mt-1">Products imported via AI will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((record) => (
                  <div
                    key={record._id}
                    onClick={() => setSelectedRecord(record)}
                    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-green-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-50 text-[var(--accent)] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 truncate max-w-md">
                            {record.fileName}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(record.createdAt).toLocaleDateString()}
                            </span>
                            <span>{record.totalProducts} Products</span>
                            <span>{record.totalQuantity} Units</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{record.totalValue.toFixed(2)}
                        </span>
                        <button
                          onClick={(e) => handleDelete(record._id, e)}
                          className="p-1.5 bg-white border border-gray-100 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-6 animate-toast">
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-green-950 truncate max-w-sm">
                    {selectedRecord.fileName}
                  </h3>
                  <p className="text-xs text-green-700 mt-1">
                    Imported on {new Date(selectedRecord.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-950">
                    Total Value: ₹{selectedRecord.totalValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    {selectedRecord.totalProducts} Items • {selectedRecord.totalQuantity} Units
                  </p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                      <th className="p-3 text-xs font-semibold text-gray-700">Product Name</th>
                      <th className="p-3 text-xs font-semibold text-gray-700">Sku</th>
                      <th className="p-3 text-xs font-semibold text-gray-700">Price</th>
                      <th className="p-3 text-xs font-semibold text-gray-700">Qty</th>
                      <th className="p-3 text-xs font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/30">
                        <td className="p-3 text-sm text-gray-900 font-medium">{item.name}</td>
                        <td className="p-3 text-sm text-gray-500 font-mono">{item.sku}</td>
                        <td className="p-3 text-sm text-gray-900">₹{item.price.toFixed(2)}</td>
                        <td className="p-3 text-sm text-gray-900">{item.quantity}</td>
                        <td className="p-3 text-sm">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.status === "New"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-green-50 text-green-700 border border-green-100"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportHistoryDrawer;
