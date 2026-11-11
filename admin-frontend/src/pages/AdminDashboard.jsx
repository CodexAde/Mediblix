import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus, RefreshCw } from "lucide-react";
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Platform Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-tenant health, organizations, and resource metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn-secondary text-xs"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs"
          >
            <Plus size={16} />
            <span>New Organization</span>
          </button>
        </div>
      </div>

      <StatCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <RecentOrgsList organizations={organizations} loading={loading} />
        </div>

        <div className="space-y-4">
          <div className="spren-card p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-2">
              Quick Admin Actions
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Rapid provisioning and tenancy operations.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-lg border border-slate-200 text-left hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
              >
                <span>Add New Pharmacy Tenant</span>
                <Plus size={14} className="text-emerald-700" />
              </button>

              <Link
                to="/organizations"
                className="w-full py-2.5 px-3 rounded-lg border border-slate-200 text-left hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
              >
                <span>Manage Status & Freezes</span>
                <Building2 size={14} className="text-blue-600" />
              </Link>
            </div>
          </div>

          <div className="spren-card p-6 bg-gradient-to-br from-emerald-900 to-slate-900 text-white">
            <h3 className="font-bold text-sm text-emerald-300">
              Tenancy Isolation Guard
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Every newly created organization operates in isolated namespaces. Products, stock levels, sales billing, and customers are strictly scoped to the tenant.
            </p>
          </div>
        </div>
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

