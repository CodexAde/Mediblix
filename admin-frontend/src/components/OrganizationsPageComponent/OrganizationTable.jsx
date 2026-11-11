import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Snowflake,
  ExternalLink,
  Power,
  RotateCcw,
  Package,
  Receipt,
  Mail,
  User,
} from "lucide-react";

const getInitials = (name) => {
  if (!name) return "RX";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = [
    "from-emerald-600 to-teal-700",
    "from-blue-600 to-indigo-700",
    "from-purple-600 to-pink-700",
    "from-amber-600 to-orange-700",
    "from-cyan-600 to-blue-700",
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const OrganizationTable = ({
  organizations,
  loading,
  onFreezeToggle,
  onResetPassword,
}) => {
  if (loading) {
    return (
      <div className="spren-card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="h-6 w-52 bg-slate-200 rounded animate-pulse" />
              <div className="h-6 w-28 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="spren-card p-14 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
          <Building2 size={28} />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          No Organizations Found
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No tenant records match your current filter criteria. Try resetting filters or provision a new pharmacy.
        </p>
      </div>
    );
  }

  return (
    <div className="spren-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-5">Organization</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4 text-center">Inventory</th>
              <th className="py-3.5 px-4 text-center">Sales</th>
              <th className="py-3.5 px-4 text-right">Revenue</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {organizations.map((org) => {
              const isActive = org.status === "Active";
              const initials = getInitials(org.name);
              const avatarBg = getAvatarColor(org.name);

              return (
                <tr
                  key={org._id}
                  className="hover:bg-slate-50/90 transition-colors group"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/organizations/${org._id}`}
                          className="font-bold text-slate-900 text-sm hover:text-emerald-800 transition-colors block truncate"
                        >
                          {org.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {org.code}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            Added {new Date(org.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      <span>{org.contactPerson}</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Mail size={12} className="text-slate-400" />
                      <span>{org.contactEmail}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs px-2.5 py-1 rounded-lg bg-slate-100/70 border border-slate-200/60">
                      <Package size={13} className="text-slate-500" />
                      {org.productCount || 0}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs px-2.5 py-1 rounded-lg bg-slate-100/70 border border-slate-200/60">
                      <Receipt size={13} className="text-slate-500" />
                      {org.saleCount || 0}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="font-bold text-slate-900 text-sm">
                      Rs. {(org.revenue || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">
                      Billed Volume
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight shadow-2xs ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-cyan-500"
                        }`}
                      />
                      {org.status}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onFreezeToggle(org)}
                        title={isActive ? "Freeze Tenant" : "Unfreeze Tenant"}
                        className={`p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-1 ${
                          isActive
                            ? "text-cyan-700 bg-cyan-50/70 border-cyan-200 hover:bg-cyan-100"
                            : "text-emerald-700 bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {isActive ? <Snowflake size={14} /> : <Power size={14} />}
                      </button>

                      <button
                        onClick={() => onResetPassword(org)}
                        title="Reset Admin Password"
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                      >
                        <RotateCcw size={14} />
                      </button>

                      <Link
                        to={`/organizations/${org._id}`}
                        title="View Details"
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                      >
                        <ExternalLink size={14} />
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
