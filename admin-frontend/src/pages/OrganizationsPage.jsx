import React, { useState, useEffect } from "react";
import { Search, Filter, Plus, RefreshCw } from "lucide-react";
import OrganizationTable from "../components/OrganizationsPageComponent/OrganizationTable";
import CreateOrganizationModal from "../components/OrganizationsPageComponent/CreateOrganizationModal";
import FreezeConfirmModal from "../components/OrganizationsPageComponent/FreezeConfirmModal";
import FreezeSuccessModal from "../components/OrganizationsPageComponent/FreezeSuccessModal";
import adminOrgService from "../services/adminOrgService";

const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [selectedOrgForFreeze, setSelectedOrgForFreeze] = useState(null);
  const [freezeLoading, setFreezeLoading] = useState(false);

  const [successModalData, setSuccessModalData] = useState({
    isOpen: false,
    organization: null,
    actionType: "Frozen",
  });

  const statusOptions = ["All", "Active", "Frozen"];

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await adminOrgService.getOrganizations({
        search: searchTerm,
        status: selectedStatus,
      });
      setOrganizations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrganizations();
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedStatus]);

  const handleOpenFreeze = (org) => {
    setSelectedOrgForFreeze(org);
    setIsFreezeModalOpen(true);
  };

  const handleConfirmFreeze = async (org) => {
    try {
      setFreezeLoading(true);
      const nextStatus = org.status === "Active" ? "Frozen" : "Active";
      await adminOrgService.toggleOrganizationStatus(org._id, nextStatus);
      setIsFreezeModalOpen(false);
      setSelectedOrgForFreeze(null);

      setSuccessModalData({
        isOpen: true,
        organization: org,
        actionType: nextStatus,
      });

      await fetchOrganizations();
    } catch (error) {
      alert(error.message || "Failed to update status");
    } finally {
      setFreezeLoading(false);
    }
  };

  const handleResetPassword = async (org) => {
    const confirm = window.confirm(
      `Generate new admin credentials for ${org.name}?`
    );
    if (!confirm) return;

    try {
      const res = await adminOrgService.resetOrgPassword(org._id);
      alert(
        `Credentials Generated:\n\nEmail: ${res.credentials.email}\nNew Password: ${res.credentials.password}`
      );
    } catch (error) {
      alert(error.message || "Failed to reset password");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Organizations
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage your client pharmacy organizations and tenancy access
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrganizations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] transition-all text-[var(--text-primary)] cursor-pointer text-sm font-medium"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 transition-all font-medium cursor-pointer text-sm"
          >
            <Plus size={18} />
            <span>Add Organization</span>
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-soft)] flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            type="text"
            placeholder="Search by name, code, contact or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)] focus:outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[var(--text-secondary)]" />
          <div className="flex items-center gap-2">
            {statusOptions.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedStatus === st
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <OrganizationTable
        organizations={organizations}
        loading={loading}
        onFreezeToggle={handleOpenFreeze}
        onResetPassword={handleResetPassword}
      />

      <CreateOrganizationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={() => {
          fetchOrganizations();
        }}
      />

      <FreezeConfirmModal
        isOpen={isFreezeModalOpen}
        organization={selectedOrgForFreeze}
        loading={freezeLoading}
        onClose={() => {
          setIsFreezeModalOpen(false);
          setSelectedOrgForFreeze(null);
        }}
        onConfirm={handleConfirmFreeze}
      />

      <FreezeSuccessModal
        isOpen={successModalData.isOpen}
        organization={successModalData.organization}
        actionType={successModalData.actionType}
        onClose={() => setSuccessModalData({ isOpen: false, organization: null, actionType: "Frozen" })}
      />
    </div>
  );
};

export default OrganizationsPage;
