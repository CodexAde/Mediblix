import React from "react";
import { CheckCircle2, Snowflake, Mail, X } from "lucide-react";

const FreezeSuccessModal = ({ isOpen, organization, actionType, onClose }) => {
  if (!isOpen || !organization) return null;

  const isFrozen = actionType === "Frozen";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] w-full max-w-[420px] overflow-hidden border border-white/80 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-200 p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-[20px] flex items-center justify-center border shadow-xs ${
                isFrozen
                  ? "bg-gradient-to-b from-cyan-50 to-cyan-100/70 border-cyan-200/50 text-cyan-600 shadow-[0_6px_14px_-3px_rgba(6,182,212,0.18)]"
                  : "bg-gradient-to-b from-emerald-50 to-emerald-100/70 border-emerald-200/50 text-emerald-700 shadow-[0_6px_14px_-3px_rgba(22,101,52,0.18)]"
              }`}
            >
              {isFrozen ? <Snowflake size={26} strokeWidth={2.2} /> : <CheckCircle2 size={26} />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg tracking-tight">
                {isFrozen ? "Organization Frozen" : "Organization Unfrozen"}
              </h3>
              <p className="text-[13px] text-gray-500 font-normal">
                {organization.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-[#f8fafc]/90 rounded-[20px] p-4 border border-gray-100/80 text-[13px] text-gray-600 space-y-2 leading-relaxed font-normal">
          {isFrozen ? (
            <>
              <p className="font-semibold text-gray-900">
                Access Locked Successfully
              </p>
              <p>
                When any user or staff from this organization attempts to log in or use the platform, they will see the notice:
              </p>
              <div className="bg-white p-3 rounded-[14px] border border-gray-200/80 text-gray-800 font-mono text-[12px] flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                <span>support@codevern.com</span>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-900">
                Access Restored Successfully
              </p>
              <p>
                Staff and administrators of this pharmacy can now log in and resume all operations immediately.
              </p>
            </>
          )}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 bg-[#166534] hover:bg-[#14532d] text-white rounded-[16px] text-[13px] font-medium transition-all shadow-[0_4px_12px_rgba(22,101,52,0.25)] active:scale-[0.98] cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreezeSuccessModal;
