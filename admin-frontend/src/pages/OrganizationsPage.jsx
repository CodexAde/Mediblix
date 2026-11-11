import React, { useState, useEffect } from "react";
import { Search, Plus, RefreshCw, Filter, Snowflake, CheckCircle2, Building2, X } from "lucide-react";
import OrganizationTable from "../components/OrganizationsPageComponent/OrganizationTable";
import CreateOrganizationModal from "../components/OrganizationsPageComponent/CreateOrganizationModal";
import FreezeConfirmModal from "../components/OrganizationsPageComponent/FreezeConfirmModal";
import adminOrgService from "../services/adminOrgService";

const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [allOrgs, setAllOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [selectedOrgForFreeze, setSelectedOrgForFreeze] = useState(null);
  const [freezeActionLoading, setFreezeActionLoading] = useState(false);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const [filteredData, baseData] = await Promise.all([
        adminOrgService.getOrganizations({ search, status: statusFilter }),
        adminOrgService.getOrganizations(),
      ]);
      setOrganizations(filteredData);
      setAllOrgs(baseData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrganizations();
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);

  const activeCount = allOrgs.filter((o) => o.status === "Active").length;
  const frozenCount = allOrgs.filter((o) => o.status === "Frozen").length;
  const totalCount = allOrgs.length;

  const handleOpenFreezeModal = (org) => {
    setSelectedOrgForFreeze(org);
    setFreezeModalOpen(true);
  };

  const handleConfirmFreeze = async (org) => {
    try {
      setFreezeActionLoading(true);
      const newStatus = org.status === "Active" ? "Frozen" : "Active";
      await adminOrgService.toggleOrganizationStatus(org._id, newStatus);
      setFreezeModalOpen(false);
      setSelectedOrgForFreeze(null);
      await fetchOrganizations();
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setFreezeActionLoading(false);
    }
  };

  const handleResetPassword = async (org) => {
    const confirm = window.confirm(
      `Are you sure you want to generate a new password for ${org.name}'s administrator?`
    );
    if (!confirm) return;

    try {
      const result = await adminOrgService.resetOrgPassword(org._id);
      alert(
        `Password reset successful!\n\nEmail: ${result.credentials.email}\nNew Password: ${result.credentials.password}`
      );
    } catch (err) {
      alert(err.message || "Failed to reset password");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Organizations
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision, monitor, and manage tenancy access for client pharmacies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrganizations}
            disabled={loading}
            className="btn-secondary"
            title="Refresh List"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-slate-500" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>New Organization</span>
          </button>
        </div>
      </div>

      <div className="spren-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-white shadow-2xs">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, contact or email..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/70 p-1">
            {[
              { id: "All", label: "All", count: totalCount },
              { id: "Active", label: "Active", count: activeCount },
              { id: "Frozen", label: "Frozen", count: frozenCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id
                      ? "bg-slate-100 text-slate-800"
                      : "bg-slate-200/60 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <OrganizationTable
        organizations={organizations}
        loading={loading}
        onFreezeToggle={handleOpenFreezeModal}
        onResetPassword={handleResetPassword}
      />

      <CreateOrganizationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          fetchOrganizations();
        }}
      />

      <FreezeConfirmModal
        isOpen={freezeModalOpen}
        organization={selectedOrgForFreeze}
        loading={freezeActionLoading}
        onClose={() => {
          setFreezeModalOpen(false);
          setSelectedOrgForFreeze(null);
        }}
        onConfirm={handleConfirmFreeze}
      />
    </div>
  );
};

export default OrganizationsPage;
