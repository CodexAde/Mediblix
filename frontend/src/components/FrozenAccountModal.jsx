import React, { useState } from "react";
import { Snowflake, Mail, Copy, Check, LogOut, X } from "lucide-react";

const FrozenAccountModal = ({ isOpen, onClose, onLogout, organizationName }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@codevern.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] w-full max-w-[420px] overflow-hidden border border-white/80 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-7 text-center">
          <div className="w-16 h-16 rounded-[22px] bg-gradient-to-b from-cyan-50 to-cyan-100/70 border border-cyan-200/50 shadow-[0_8px_16px_-4px_rgba(6,182,212,0.18)] flex items-center justify-center mx-auto mb-4 text-cyan-600">
            <Snowflake size={30} strokeWidth={2.2} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[11px] font-semibold tracking-wide border border-rose-100/80 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Organization Frozen</span>
          </div>

          <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight">
            Account Suspended
          </h2>

          <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed font-normal px-2">
            {organizationName ? (
              <span>
                Access for <strong className="font-semibold text-gray-800">{organizationName}</strong> has been paused by the platform administrator.
              </span>
            ) : (
              <span>Your pharmacy organization access has been paused by the platform administrator.</span>
            )}
          </p>

          <div className="mt-5 p-4 bg-[#f8fafc]/90 rounded-[20px] border border-gray-100/80 text-left">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Administrator Support
            </p>
            <p className="text-[12px] text-gray-600 mt-1">
              To restore access and reactivate this account, please contact:
            </p>

            <div className="mt-2.5 flex items-center justify-between bg-white border border-gray-200/70 rounded-[14px] px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 min-w-0">
                <Mail size={15} className="text-gray-400 flex-shrink-0" />
                <span className="text-[12px] font-mono font-medium text-gray-800 truncate">
                  support@codevern.com
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="ml-2 text-[11px] font-medium text-gray-500 hover:text-gray-800 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2.5">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[16px] bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium transition-all shadow-[0_4px_12px_rgba(220,38,38,0.2)] active:scale-[0.98] cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-[16px] bg-gray-100/80 hover:bg-gray-200/70 text-gray-800 text-[13px] font-medium transition-all active:scale-[0.98] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrozenAccountModal;
