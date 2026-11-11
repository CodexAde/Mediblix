import React from "react";
import { AlertTriangle, Snowflake, Play } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isFreezing
                ? "bg-cyan-100 text-cyan-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {isFreezing ? <Snowflake size={24} /> : <Play size={24} />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isFreezing ? "Freeze Organization?" : "Unfreeze Organization?"}
            </h3>
            <p className="text-xs text-slate-500">{organization.name}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 leading-relaxed">
          {isFreezing ? (
            <p>
              Freezing this organization will immediately prevent its users from logging in or performing any billing, inventory, or order activities. Data will remain safe and preserved.
            </p>
          ) : (
            <p>
              Unfreezing this organization will immediately restore system access for all its authorized users, allowing normal operations.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(organization)}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors ${
              isFreezing
                ? "bg-cyan-700 hover:bg-cyan-800"
                : "bg-emerald-700 hover:bg-emerald-800"
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

