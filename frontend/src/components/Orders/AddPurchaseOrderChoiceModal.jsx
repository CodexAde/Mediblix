import { X, Sparkles, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddPurchaseOrderChoiceModal = ({ isOpen, onClose, onManualSelect }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl transform transition-all animate-toast">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Order</h2>
            <p className="text-sm text-gray-500 mt-0.5">Choose how you want to create a new purchase order</p>
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
              navigate("/ai-import?type=purchase-order");
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
              Upload JPEG images or PDF sheets of supplier invoices to auto-parse purchase orders.
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
              Fill out a standard form to create a new purchase order with items list manually.
            </p>
            <span className="text-xs text-[var(--accent)] font-semibold mt-4 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Open Form →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPurchaseOrderChoiceModal;
