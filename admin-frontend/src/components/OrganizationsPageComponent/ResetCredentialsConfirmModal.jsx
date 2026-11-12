import React from "react";
import { KeyRound, ShieldAlert, X } from "lucide-react";

const ResetCredentialsConfirmModal = ({
  isOpen,
  organization,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] w-full max-w-[430px] overflow-hidden border border-white/80 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-200 p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-[20px] flex items-center justify-center border shadow-xs bg-gradient-to-b from-amber-50 to-amber-100/70 border-amber-200/50 text-amber-700 shadow-[0_6px_14px_-3px_rgba(217,119,6,0.18)]">
              <KeyRound size={26} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg tracking-tight">
                Reset Credentials?
              </h3>
              <p className="text-[13px] text-gray-500 font-normal">
                {organization.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-[#f8fafc]/90 rounded-[20px] p-4 border border-gray-100/80 text-[13px] text-gray-600 space-y-2.5 leading-relaxed font-normal">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              A fresh security access PIN will be generated for <strong>{organization.contactEmail || organization.name}</strong>.
            </p>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-[14px] border border-amber-200/50 text-amber-900 text-[12px] space-y-1">
            <p className="font-semibold">Security & Session Action:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              <li>The current active PIN will be archived as <strong>Disabled</strong>.</li>
              <li>Security version will bump to invalidate all active login sessions.</li>
              <li>Connected terminals will be logged out automatically.</li>
            </ul>
          </div>
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
            className="flex-1 py-3 px-4 rounded-[16px] text-[13px] font-medium text-white bg-amber-600 hover:bg-amber-700 transition-all active:scale-[0.98] cursor-pointer shadow-[0_4px_12px_rgba(217,119,6,0.25)]"
          >
            {loading ? "Generating..." : "Generate New PIN"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetCredentialsConfirmModal;

