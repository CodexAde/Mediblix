import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Calendar, AlertTriangle } from "lucide-react";

const RecentOrgsList = ({ organizations, loading }) => {
  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
        <div className="h-6 w-48 bg-white rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Recent Client Pharmacies
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Newly registered organizations on Mediblix
          </p>
        </div>
        <Link
          to="/organizations"
          className="text-xs font-semibold text-[var(--accent)] hover:opacity-80 flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {organizations.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)] py-6 text-center">
          No organizations created yet.
        </p>
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {organizations.slice(0, 5).map((org) => {
            const isExpired = org.isExpired;
            const days = org.daysRemaining ?? 0;

            return (
              <Link
                key={org._id}
                to={`/organizations/${org._id}`}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-green-50/50 p-2 rounded-xl transition-all block group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-green-700 transition-colors truncate">
                      {org.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {org.contactPerson} • {org.contactEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5">
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                        <AlertTriangle size={11} /> Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Calendar size={11} /> {days}d left
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                      org.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-cyan-100 text-cyan-700"
                    }`}
                  >
                    {org.status}
                  </span>

                  <div className="p-1.5 text-[var(--text-secondary)] group-hover:text-[var(--accent)] rounded-lg transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentOrgsList;
