import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Snowflake, CheckCircle } from "lucide-react";

const RecentOrgsList = ({ organizations, loading }) => {
  if (loading) {
    return (
      <div className="spren-card p-6">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="spren-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Recent Organizations</h2>
          <p className="text-xs text-slate-500">Newly registered client pharmacies</p>
        </div>
        <Link
          to="/organizations"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {organizations.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">
          No organizations created yet.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {organizations.slice(0, 5).map((org) => (
            <div
              key={org._id}
              className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <Building2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {org.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {org.contactPerson} • {org.contactEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    org.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                  }`}
                >
                  {org.status === "Active" ? (
                    <CheckCircle size={12} />
                  ) : (
                    <Snowflake size={12} />
                  )}
                  {org.status}
                </span>

                <Link
                  to={`/organizations/${org._id}`}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrgsList;

