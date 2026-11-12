import React, { useState } from "react";
import { Clock, Mail, Copy, Check, LogOut, ArrowUpRight } from "lucide-react";

const ExpiredSubscriptionModal = ({
  isOpen,
  onClose,
  onLogout,
  organizationName,
  expiresAt,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@codevern.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] w-full max-w-[420px] overflow-hidden border border-white/80 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-7 text-center">
          <div className="w-16 h-16 rounded-[22px] bg-gradient-to-b from-amber-50 to-orange-100/70 border border-amber-200/50 shadow-[0_8px_16px_-4px_rgba(245,158,11,0.2)] flex items-center justify-center mx-auto mb-4 text-amber-600">
            <Clock size={30} strokeWidth={2.2} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[11px] font-semibold tracking-wide border border-amber-200/80 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Subscription Expired</span>
          </div>

          <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight">
            Plan Validity Ended
          </h2>

          <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed font-normal px-2">
            {organizationName ? (
              <span>
                The subscription for{" "}
                <strong className="font-semibold text-gray-800">
                  {organizationName}
                </strong>{" "}
                expired on{" "}
                <strong className="font-semibold text-amber-700">
                  {formattedDate}
                </strong>
                .
              </span>
            ) : (
              <span>
                Your pharmacy plan validity expired on{" "}
                <strong className="font-semibold text-amber-700">
                  {formattedDate}
                </strong>
                .
              </span>
            )}
          </p>

          <div className="mt-5 p-4 bg-[#f8fafc]/90 rounded-[20px] border border-gray-100/80 text-left">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Renewal & Administrator Support
            </p>
            <p className="text-[12px] text-gray-600 mt-1">
              To renew your subscription and restore instant access, please contact:
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
            <a
              href="mailto:support@codevern.com?subject=Subscription%20Renewal%20Request%20-%20Mediblix"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-[16px] bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-[0.98] cursor-pointer"
            >
              <span>Renew Plan</span>
              <ArrowUpRight size={15} />
            </a>
            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="py-3 px-4 rounded-[16px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-[16px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium transition-all active:scale-[0.98] cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiredSubscriptionModal;
