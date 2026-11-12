import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Snowflake,
  Power,
  RotateCcw,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";

const OrganizationTable = ({
  organizations,
  loading,
  onFreezeToggle,
  onResetPassword,
}) => {
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
              <th className="py-4 px-4">Contact Person</th>
              <th className="py-4 px-4">Contact Email</th>
              <th className="py-4 px-4 text-center">Inventory</th>
              <th className="py-4 px-4 text-center">Sales</th>
              <th className="py-4 px-4 text-right">Revenue</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)] text-sm">
            {organizations.map((org) => {
              const isActive = org.status === "Active";

              return (
                <tr
                  key={org._id}
                  className="hover:bg-[var(--bg-card)] transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} />
                      </div>
                      <Link
                        to={`/organizations/${org._id}`}
                        className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {org.name}
                      </Link>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono text-xs text-[var(--text-secondary)]">
                    {org.code}
                  </td>

                  <td className="py-4 px-4 text-[var(--text-primary)]">
                    {org.contactPerson}
                  </td>

                  <td className="py-4 px-4 text-xs font-mono text-[var(--text-secondary)]">
                    {org.contactEmail}
                  </td>

                  <td className="py-4 px-4 text-center font-medium text-[var(--text-primary)]">
                    {org.productCount || 0} Tablets
                  </td>

                  <td className="py-4 px-4 text-center font-medium text-[var(--text-primary)]">
                    {org.saleCount || 0}
                  </td>

                  <td className="py-4 px-4 text-right font-semibold text-[var(--text-primary)]">
                    ₹{(org.revenue || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-cyan-100 text-cyan-700"
                      }`}
                    >
                      {org.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onFreezeToggle(org)}
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
                        onClick={() => onResetPassword(org)}
                        title="Reset Admin Password"
                        className="p-1.5 rounded-lg border border-[var(--border-soft)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                      >
                        <RotateCcw size={15} />
                      </button>

                      <Link
                        to={`/organizations/${org._id}`}
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
