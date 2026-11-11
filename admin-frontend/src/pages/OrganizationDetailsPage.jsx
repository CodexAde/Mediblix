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

const OrganizationDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [freezeActionLoading, setFreezeActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
        `New Credentials Generated:\n\nEmail: ${result.credentials.email}\nNew Password: ${result.credentials.password}`
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
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!data?.organization) {
    return (
      <div className="spren-card p-14 text-center">
        <p className="text-slate-600 text-sm font-semibold">Organization not found.</p>
        <Link to="/organizations" className="btn-secondary text-xs mt-4 inline-flex">
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Organizations</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetPassword}
            className="btn-secondary"
          >
            <RotateCcw size={14} />
            <span>Reset Admin Password</span>
          </button>
          <button
            onClick={() => setFreezeModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
              isActive
                ? "bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            {isActive ? <Snowflake size={14} /> : <CheckCircle2 size={14} />}
            <span>{isActive ? "Freeze Tenant" : "Unfreeze Tenant"}</span>
          </button>
        </div>
      </div>

      <div className="spren-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <Building2 size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {org.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-emerald-500 animate-pulse" : "bg-cyan-500"
                    }`}
                  />
                  {org.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {org.code}
                </span>
                <button
                  onClick={() => handleCopyCode(org.code)}
                  className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
              <Mail size={16} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Admin Email</p>
              <p className="font-mono text-slate-600 mt-0.5">{org.contactEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
              <Phone size={16} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Contact Person</p>
              <p className="text-slate-600 mt-0.5">
                {org.contactPerson} {org.contactPhone ? `(${org.contactPhone})` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
              <MapPin size={16} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Address</p>
              <p className="text-slate-600 mt-0.5">{org.address || "No address entered"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="spren-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Stock Items
            </span>
            <Package size={16} />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.productCount || 0}</p>
        </div>

        <div className="spren-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Invoices
            </span>
            <Receipt size={16} />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.saleCount || 0}</p>
        </div>

        <div className="spren-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Customers
            </span>
            <Users size={16} />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.customerCount || 0}</p>
        </div>

        <div className="spren-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <span className="text-xs font-bold text-emerald-700">INR</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            Rs. {(stats?.revenue || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="spren-card p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          Provisioned Accounts & Staff
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
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
    </div>
  );
};

export default OrganizationDetailsPage;
