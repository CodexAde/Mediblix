import React, { useState, useEffect } from "react";
import { Mail, X, AlertTriangle, Check, Loader2 } from "lucide-react";
import adminOrgService from "../../services/adminOrgService";

const EditAdminEmailModal = ({ isOpen, organization, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (organization?.contactEmail) {
      setEmail(organization.contactEmail);
    }
    setError("");
  }, [organization, isOpen]);

  if (!isOpen || !organization) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      setError("Please enter a valid email address");
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email format");
      return;
    }

    if (cleanEmail === (organization.contactEmail || "").toLowerCase()) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await adminOrgService.updateAdminEmail(organization._id, cleanEmail);
      if (onSuccess) {
        onSuccess(res.organization || { ...organization, contactEmail: cleanEmail });
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update admin email";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] w-full max-w-[440px] overflow-hidden border border-white/80 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-200 p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-[20px] flex items-center justify-center border shadow-xs bg-gradient-to-b from-emerald-50 to-emerald-100/70 border-emerald-200/50 text-emerald-700 shadow-[0_6px_14px_-3px_rgba(16,185,129,0.18)]">
              <Mail size={26} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg tracking-tight">
                Edit Admin Email
              </h3>
              <p className="text-[13px] text-gray-500 font-normal truncate max-w-[230px]">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Tenant Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="admin@domain.com"
                autoFocus
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-xs"
              />
            </div>
          </div>

          <div className="bg-[#f8fafc]/90 rounded-[18px] p-3.5 border border-gray-100/90 text-[12px] text-gray-600 space-y-1.5 leading-relaxed">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="text-emerald-700 flex-shrink-0 mt-0.5" />
              <p className="font-medium text-gray-700">
                This email is used by the pharmacy administrator to log in to Mediblix.
              </p>
            </div>
            <p className="text-gray-500 pl-5">
              Updating this address will change their primary authentication credential immediately.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-[14px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all cursor-pointer active:scale-98"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-[14px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Update Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdminEmailModal;
