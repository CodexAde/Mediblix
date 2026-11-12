import React, { useState } from "react";
import { CheckCircle2, Copy, Check, X, ShieldCheck, Ban, Mail } from "lucide-react";

const ResetCredentialsSuccessModal = ({
  isOpen,
  organization,
  credentialsData,
  onClose,
}) => {
  const [copiedNew, setCopiedNew] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen || !credentialsData) return null;

  const newPin = credentialsData.credentials?.password || "";
  const email = credentialsData.credentials?.email || organization?.contactEmail || "";
  const previousPin = credentialsData.previousCredentials?.password || "";

  const handleCopyNewPin = () => {
    navigator.clipboard.writeText(newPin);
    setCopiedNew(true);
    setTimeout(() => setCopiedNew(false), 2000);
  };

  const handleCopyAll = () => {
    const text = `Mediblix Login Credentials:\nEmail: ${email}\nActive PIN: ${newPin}`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] w-full max-w-[450px] overflow-hidden border border-white/80 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-200 p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-[20px] flex items-center justify-center border shadow-xs bg-gradient-to-b from-emerald-50 to-emerald-100/70 border-emerald-200/50 text-emerald-700 shadow-[0_6px_14px_-3px_rgba(22,101,52,0.18)]">
              <CheckCircle2 size={26} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg tracking-tight">
                New Credentials Active
              </h3>
              <p className="text-[13px] text-gray-500 font-normal">
                {organization?.name || "Client Pharmacy"}
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

        <div className="space-y-3">
          <div className="p-3.5 bg-emerald-50/70 rounded-[18px] border border-emerald-200/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" />
                Active Access PIN
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-900">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-[12px] border border-emerald-100 shadow-xs">
              <span className="font-mono text-base font-bold text-gray-900 tracking-wide select-all">
                {newPin}
              </span>
              <button
                type="button"
                onClick={handleCopyNewPin}
                className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70 cursor-pointer transition-colors"
              >
                {copiedNew ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedNew ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {previousPin && (
            <div className="p-3.5 bg-rose-50/50 rounded-[18px] border border-rose-200/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Ban size={13} className="text-rose-600" />
                  Previous Access PIN
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200/80 text-rose-800">
                  Disabled
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/80 px-3.5 py-2 rounded-[12px] border border-rose-100">
                <span className="font-mono text-sm text-gray-400 line-through select-all">
                  {previousPin}
                </span>
                <span className="text-[11px] text-rose-600 font-medium">Deactivated</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2 leading-tight">
                This previous PIN cannot be used for login anymore. Any devices active on this PIN have been automatically logged out.
              </p>
            </div>
          )}

          <div className="p-3 bg-gray-50 rounded-[14px] border border-gray-100 text-xs flex items-center justify-between text-gray-700">
            <span className="flex items-center gap-2 text-gray-500">
              <Mail size={13} />
              Login Email
            </span>
            <span className="font-mono font-medium text-gray-900 select-all">{email}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex-1 py-3 px-4 rounded-[16px] bg-gray-100/90 hover:bg-gray-200/80 text-gray-800 text-[13px] font-medium transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
          >
            {copiedAll ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedAll ? "Copied All" : "Copy All Details"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-[16px] text-[13px] font-medium text-white bg-[#166534] hover:bg-[#14532d] transition-all active:scale-[0.98] cursor-pointer shadow-[0_4px_12px_rgba(22,101,52,0.25)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetCredentialsSuccessModal;

