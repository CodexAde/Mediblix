import React from "react";
import { Snowflake, Play } from "lucide-react";

const FreezeConfirmModal = ({
  isOpen,
  organization,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!isOpen || !organization) return null;

  const isFreezing = organization.status === "Active";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] w-full max-w-[420px] overflow-hidden border border-white/80 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-200 p-7 space-y-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-14 h-14 rounded-[20px] flex items-center justify-center border shadow-xs ${
              isFreezing
                ? "bg-gradient-to-b from-cyan-50 to-cyan-100/70 border-cyan-200/50 text-cyan-600 shadow-[0_6px_14px_-3px_rgba(6,182,212,0.18)]"
                : "bg-gradient-to-b from-emerald-50 to-emerald-100/70 border-emerald-200/50 text-emerald-700 shadow-[0_6px_14px_-3px_rgba(22,101,52,0.18)]"
            }`}
          >
            {isFreezing ? <Snowflake size={26} strokeWidth={2.2} /> : <Play size={24} />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg tracking-tight">
              {isFreezing ? "Freeze Organization?" : "Unfreeze Organization?"}
            </h3>
            <p className="text-[13px] text-gray-500 font-normal">{organization.name}</p>
          </div>
        </div>

        <div className="bg-[#f8fafc]/90 rounded-[20px] p-4 border border-gray-100/80 text-[13px] text-gray-600 leading-relaxed font-normal">
          {isFreezing ? (
            <p>
              Freezing this organization immediately prevents all staff from logging in or making any billing/stock edits. Staff will see the <strong>Contact Administrator (support@codevern.com)</strong> popup.
            </p>
          ) : (
            <p>
              Unfreezing this organization will instantly restore access for all authorized staff to resume billing and pharmacy operations.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-[16px] bg-gray-100/80 hover:bg-gray-200/70 text-gray-800 text-[13px] font-medium transition-all active:scale-[0.98] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(organization)}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-[16px] text-[13px] font-medium text-white transition-all active:scale-[0.98] cursor-pointer shadow-sm ${
              isFreezing
                ? "bg-cyan-700 hover:bg-cyan-800 shadow-[0_4px_12px_rgba(14,116,144,0.25)]"
                : "bg-[#166534] hover:bg-[#14532d] shadow-[0_4px_12px_rgba(22,101,52,0.25)]"
            }`}
          >
            {loading
              ? "Updating..."
              : isFreezing
              ? "Confirm Freeze"
              : "Confirm Unfreeze"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreezeConfirmModal;
