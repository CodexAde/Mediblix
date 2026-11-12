import React from "react";
import { Building2, CheckCircle2, Snowflake, Package, ReceiptText, Wallet } from "lucide-react";

const StatCards = ({ stats, loading }) => {
  const cards = [
    {
      label: "Total Organizations",
      value: stats?.totalOrgs || 0,
      sublabel: "Registered pharmacies",
      icon: Building2,
      iconColor: "text-blue-700 bg-blue-100",
    },
    {
      label: "Active Tenancies",
      value: stats?.activeOrgs || 0,
      sublabel: "Active client portals",
      icon: CheckCircle2,
      iconColor: "text-green-700 bg-green-100",
    },
    {
      label: "Frozen Organizations",
      value: stats?.frozenOrgs || 0,
      sublabel: "Suspended tenancies",
      icon: Snowflake,
      iconColor: "text-cyan-700 bg-cyan-100",
    },
    {
      label: "System Products",
      value: stats?.totalProducts || 0,
      sublabel: "Across all pharmacies",
      icon: Package,
      iconColor: "text-purple-700 bg-purple-100",
    },
    {
      label: "Customer Invoices",
      value: stats?.totalSalesCount || 0,
      sublabel: "Total completed sales",
      icon: ReceiptText,
      iconColor: "text-amber-700 bg-amber-100",
    },
    {
      label: "Billed Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      sublabel: "Gross platform volume",
      icon: Wallet,
      iconColor: "text-emerald-800 bg-emerald-100",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-soft)] hover:border-[var(--accent)] transition-all flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1.5">
                {card.value}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {card.sublabel}
              </p>
            </div>

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconColor}`}>
              <Icon size={19} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
