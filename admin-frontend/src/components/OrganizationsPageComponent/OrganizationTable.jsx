import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Building2,
  Snowflake,
  Power,
  RotateCcw,
  ExternalLink,
  ArrowUpDown,
  Calendar,
  AlertTriangle,
  Smartphone,
  ShieldAlert,
} from "lucide-react";

const OrganizationTable = ({
  organizations,
  loading,
  onFreezeToggle,
  onResetPassword,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
          <Building2 size={24} />
        </div>
        <p className="text-base font-bold text-[var(--text-primary)]">
          No Organizations Found
        </p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          No client pharmacy tenants match the selected criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-main)] rounded-2xl border border-[var(--border-soft)] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-soft)] text-xs font-semibold text-[var(--text-secondary)]">
              <th className="py-4 px-6">
                <span className="flex items-center gap-1">
                  Organization <ArrowUpDown size={13} />
                </span>
              </th>
              <th className="py-4 px-4">Tenant Code</th>
              <th className="py-4 px-4">Contact</th>
              <th className="py-4 px-4">Plan & Validity</th>
              <th className="py-4 px-4 text-center">Device Security</th>
              <th className="py-4 px-4 text-center">Inventory</th>
              <th className="py-4 px-4 text-right">Revenue</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)] text-sm">
            {organizations.map((org) => {
              const isActive = org.status === "Active";
              const isExpired = org.isExpired;
              const days = org.daysRemaining ?? 0;

              return (
                <tr
                  key={org._id}
                  onClick={() => navigate(`/organizations/${org._id}`)}
                  className="hover:bg-green-50/40 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <span className="font-semibold text-[var(--text-primary)] group-hover:text-green-700 transition-colors block">
                          {org.name}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)] block">
                          {org.contactPerson}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono text-xs text-[var(--text-secondary)]">
                    {org.code}
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-xs">
                      <p className="font-mono text-[var(--text-secondary)] truncate max-w-[150px]">
                        {org.contactEmail}
                      </p>
                      {org.contactPhone && (
                        <p className="text-[var(--text-secondary)]">{org.contactPhone}</p>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-800">
                          {org.plan || "Trial"}
                        </span>
                        {isExpired ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle size={10} /> Expired
                          </span>
                        ) : days <= 5 ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Calendar size={10} /> {days}d left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Calendar size={10} /> {days}d left
                          </span>
                        )}
                      </div>
                      {org.subscriptionExpiresAt && (
                        <span className="text-[11px] text-gray-400">
                          Until {new Date(org.subscriptionExpiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {org.hasActiveSession ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <Smartphone size={11} /> 1 Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                          <Smartphone size={11} /> Offline
                        </span>
                      )}
                      {org.conflictAttemptsCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200" title="Unauthorized attempts on other devices">
                          <ShieldAlert size={10} /> {org.conflictAttemptsCount} blocked
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center font-medium text-[var(--text-primary)]">
                    {org.productCount || 0}
                  </td>

                  <td className="py-4 px-4 text-right font-semibold text-[var(--text-primary)]">
                    ₹{(org.revenue || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-cyan-100 text-cyan-700"
                      }`}
                    >
                      {org.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFreezeToggle(org);
                        }}
                        title={isActive ? "Freeze Tenant" : "Unfreeze Tenant"}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? "border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                            : "border-green-200 text-green-700 hover:bg-green-50"
                        }`}
                      >
                        {isActive ? <Snowflake size={15} /> : <Power size={15} />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResetPassword(org);
                        }}
                        title="Reset Admin Password"
                        className="p-1.5 rounded-lg border border-[var(--border-soft)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                      >
                        <RotateCcw size={15} />
                      </button>

                      <Link
                        to={`/organizations/${org._id}`}
                        onClick={(e) => e.stopPropagation()}
                        title="View Details"
                        className="p-1.5 rounded-lg border border-[var(--border-soft)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-all"
                      >
                        <ExternalLink size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizationTable;
