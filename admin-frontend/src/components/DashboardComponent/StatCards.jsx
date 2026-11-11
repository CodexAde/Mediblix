import React from "react";
import { Building2, CheckCircle2, Snowflake, Package, ReceiptText, Wallet } from "lucide-react";

const StatCards = ({ stats, loading }) => {
  const cards = [
    {
      label: "Total Organizations",
      value: stats?.totalOrgs || 0,
      sublabel: "Registered pharmacies",
      icon: Building2,
      gradient: "from-blue-600 to-indigo-600",
      bgLight: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      label: "Active Tenancies",
      value: stats?.activeOrgs || 0,
      sublabel: "Full portal access",
      icon: CheckCircle2,
      gradient: "from-emerald-600 to-teal-600",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      label: "Frozen Organizations",
      value: stats?.frozenOrgs || 0,
      sublabel: "Suspended access",
      icon: Snowflake,
      gradient: "from-cyan-600 to-sky-600",
      bgLight: "bg-cyan-50 text-cyan-700 border-cyan-100",
    },
    {
      label: "System Products",
      value: stats?.totalProducts || 0,
      sublabel: "Stock items tracked",
      icon: Package,
      gradient: "from-purple-600 to-pink-600",
      bgLight: "bg-purple-50 text-purple-700 border-purple-100",
    },
    {
      label: "Completed Sales",
      value: stats?.totalSalesCount || 0,
      sublabel: "Customer tax invoices",
      icon: ReceiptText,
      gradient: "from-amber-600 to-orange-600",
      bgLight: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "Platform Revenue",
      value: `Rs. ${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      sublabel: "Total billed value",
      icon: Wallet,
      gradient: "from-emerald-700 to-green-800",
      bgLight: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse p-5" />
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
            className="spren-card spren-card-hover p-5 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                  {card.value}
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">
                  {card.sublabel}
                </p>
              </div>

              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shadow-2xs ${card.bgLight}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
