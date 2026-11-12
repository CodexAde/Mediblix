import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Snowflake,
  Package,
  Receipt,
  Users,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import adminOrgService from "../services/adminOrgService";
import FreezeConfirmModal from "../components/OrganizationsPageComponent/FreezeConfirmModal";
import FreezeSuccessModal from "../components/OrganizationsPageComponent/FreezeSuccessModal";

const OrganizationDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [freezeActionLoading, setFreezeActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [successModalData, setSuccessModalData] = useState({
    isOpen: false,
    organization: null,
    actionType: "Frozen",
  });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await adminOrgService.getOrganizationById(id);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleConfirmFreeze = async (org) => {
    try {
      setFreezeActionLoading(true);
      const newStatus = org.status === "Active" ? "Frozen" : "Active";
      await adminOrgService.toggleOrganizationStatus(org._id, newStatus);
      setFreezeModalOpen(false);

      setSuccessModalData({
        isOpen: true,
        organization: org,
        actionType: newStatus,
      });

      await fetchDetails();
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setFreezeActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!data?.organization) return;
    const confirm = window.confirm(
      `Generate new admin credentials for ${data.organization.name}?`
    );
    if (!confirm) return;

    try {
      const result = await adminOrgService.resetOrgPassword(data.organization._id);
      alert(
        `Credentials Generated:\n\nEmail: ${result.credentials.email}\nNew Password: ${result.credentials.password}`
      );
    } catch (err) {
      alert(err.message || "Failed to reset password");
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-[var(--bg-card)] rounded animate-pulse" />
        <div className="h-64 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] animate-pulse" />
      </div>
    );
  }

  if (!data?.organization) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] p-12 text-center">
        <p className="text-[var(--text-secondary)] text-sm font-semibold">
          Organization not found.
        </p>
        <Link
          to="/organizations"
          className="mt-4 inline-flex px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium"
        >
          Back to Organizations
        </Link>
      </div>
    );
  }

  const { organization: org, users, stats } = data;
  const isActive = org.status === "Active";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/organizations"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Organizations</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetPassword}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] transition-all text-[var(--text-primary)] cursor-pointer text-sm font-medium"
          >
            <RotateCcw size={15} />
            <span>Reset Password</span>
          </button>
          <button
            onClick={() => setFreezeModalOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${
              isActive
                ? "bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            {isActive ? <Snowflake size={15} /> : <CheckCircle2 size={15} />}
            <span>{isActive ? "Freeze Tenant" : "Unfreeze Tenant"}</span>
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-soft)] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  {org.name}
                </h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-cyan-100 text-cyan-700"
                  }`}
                >
                  {org.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-soft)] text-[var(--text-secondary)]">
                  {org.code}
                </span>
                <button
                  onClick={() => handleCopyCode(org.code)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-[var(--text-secondary)]" />
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Admin Email</p>
              <p className="font-mono text-xs mt-0.5">{org.contactEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone size={18} className="text-[var(--text-secondary)]" />
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Contact Person</p>
              <p className="mt-0.5">
                {org.contactPerson} {org.contactPhone ? `(${org.contactPhone})` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-[var(--text-secondary)]" />
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Address</p>
              <p className="mt-0.5">{org.address || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-soft)]">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium">Stock Items</span>
            <Package size={16} />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats?.productCount || 0}
          </p>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-soft)]">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium">Invoices</span>
            <Receipt size={16} />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats?.saleCount || 0}
          </p>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-soft)]">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium">Customers</span>
            <Users size={16} />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats?.customerCount || 0}
          </p>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-soft)]">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium">Total Revenue</span>
            <span className="text-xs font-semibold text-[var(--accent)]">INR</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            ₹{(stats?.revenue || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-main)] rounded-2xl border border-[var(--border-soft)] overflow-hidden shadow-xs">
        <div className="p-4 bg-[var(--bg-card)] border-b border-[var(--border-soft)]">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            Organization Staff Accounts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-soft)] text-xs text-[var(--text-secondary)]">
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-[var(--bg-card)] transition-colors">
                  <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{u.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--text-secondary)]">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FreezeConfirmModal
        isOpen={freezeModalOpen}
        organization={org}
        loading={freezeActionLoading}
        onClose={() => setFreezeModalOpen(false)}
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

export default OrganizationDetailsPage;
