import React, { useState, useEffect } from "react";
import { Plus, RefreshCw } from "lucide-react";
import StatCards from "../components/DashboardComponent/StatCards";
import RecentOrgsList from "../components/DashboardComponent/RecentOrgsList";
import CreateOrganizationModal from "../components/OrganizationsPageComponent/CreateOrganizationModal";
import adminOrgService from "../services/adminOrgService";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, orgsData] = await Promise.all([
        adminOrgService.getStats(),
        adminOrgService.getOrganizations(),
      ]);
      setStats(statsData);
      setOrganizations(orgsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreated = (newOrg) => {
    setOrganizations([newOrg, ...organizations]);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Platform health, tenancy status, and aggregated system metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] transition-all text-[var(--text-primary)] cursor-pointer text-sm font-medium"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 transition-all font-medium cursor-pointer text-sm"
          >
            <Plus size={18} />
            <span>Add Organization</span>
          </button>
        </div>
      </div>

      <StatCards stats={stats} loading={loading} />

      <div className="space-y-4">
        <RecentOrgsList organizations={organizations} loading={loading} />
      </div>

      <CreateOrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default AdminDashboard;
