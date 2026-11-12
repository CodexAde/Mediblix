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
  Calendar,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  History,
  CalendarDays,
  KeyRound,
} from "lucide-react";
import adminOrgService from "../services/adminOrgService";
import FreezeConfirmModal from "../components/OrganizationsPageComponent/FreezeConfirmModal";
import FreezeSuccessModal from "../components/OrganizationsPageComponent/FreezeSuccessModal";
import ResetCredentialsConfirmModal from "../components/OrganizationsPageComponent/ResetCredentialsConfirmModal";
import ResetCredentialsSuccessModal from "../components/OrganizationsPageComponent/ResetCredentialsSuccessModal";
import ResetDeviceSessionConfirmModal from "../components/OrganizationsPageComponent/ResetDeviceSessionConfirmModal";

const OrganizationDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [freezeActionLoading, setFreezeActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [extendingSubscription, setExtendingSubscription] = useState(false);
  const [resettingDevice, setResettingDevice] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Monthly");
  const [customDays, setCustomDays] = useState(30);
  const [expiryDateInput, setExpiryDateInput] = useState("");

  const [resetCredsModalOpen, setResetCredsModalOpen] = useState(false);
  const [resetCredsLoading, setResetCredsLoading] = useState(false);
  const [resetCredsSuccessData, setResetCredsSuccessData] = useState({
    isOpen: false,
    organization: null,
    credentialsData: null,
  });
  const [resetDeviceModalOpen, setResetDeviceModalOpen] = useState(false);

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
      if (res.organization?.plan) {
        setSelectedPlan(res.organization.plan);
      }
      if (res.organization?.subscriptionExpiresAt) {
        const d = new Date(res.organization.subscriptionExpiresAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setExpiryDateInput(`${yyyy}-${mm}-${dd}`);
      }
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

  const handleConfirmResetPassword = async () => {
    if (!data?.organization) return;
    try {
      setResetCredsLoading(true);
      const result = await adminOrgService.resetOrgPassword(data.organization._id);
      setResetCredsModalOpen(false);
      setResetCredsSuccessData({
        isOpen: true,
        organization: data.organization,
        credentialsData: result,
      });
      await fetchDetails();
    } catch (err) {
      alert(err.message || "Failed to reset password");
    } finally {
      setResetCredsLoading(false);
    }
  };

  const handleSetExactDate = async () => {
    if (!expiryDateInput) return;
    try {
      setExtendingSubscription(true);
      await adminOrgService.updateSubscription(id, {
        plan: selectedPlan,
        subscriptionExpiresAt: new Date(expiryDateInput + "T23:59:59.999Z"),
      });
      await fetchDetails();
      alert("Subscription expiry date updated successfully!");
    } catch (err) {
      alert(err.message || "Failed to update expiry date");
    } finally {
      setExtendingSubscription(false);
    }
  };

  const handleExtendSubscription = async (days) => {
    try {
      setExtendingSubscription(true);
      await adminOrgService.updateSubscription(id, {
        plan: selectedPlan,
        daysToAdd: days,
      });
      await fetchDetails();
      alert(`Subscription extended by ${days} days successfully!`);
    } catch (err) {
      alert(err.message || "Failed to extend subscription");
    } finally {
      setExtendingSubscription(false);
    }
  };

  const handleConfirmResetDeviceSession = async () => {
    try {
      setResettingDevice(true);
      await adminOrgService.resetDeviceSession(id);
      setResetDeviceModalOpen(false);
      await fetchDetails();
    } catch (err) {
      alert(err.message || "Failed to reset device session");
    } finally {
      setResettingDevice(false);
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

  const { organization: org, users = [], stats } = data;
  const isActive = org.status === "Active";
  const isExpired = org.isExpired;
  const days = org.daysRemaining ?? 0;
  const orgAdmin = users.find((u) => u.role === "org_admin") || users[0];
  const accessLogs = orgAdmin?.deviceAccessLogs || [];

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
            onClick={() => setResetCredsModalOpen(true)}
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
                {isExpired ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    Subscription Expired
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {days} Days Remaining
                  </span>
                )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Subscription & Expiry Management
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Control tenant billing cycle and access expiration date
                  </p>
                </div>
              </div>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="Trial">Trial Plan</option>
                <option value="Monthly">Monthly Plan</option>
                <option value="Annual">Annual Plan</option>
                <option value="Enterprise">Enterprise Plan</option>
                <option value="Lifetime">Lifetime Plan</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-[var(--border-soft)] mb-4">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Current Expiry Date</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {org.subscriptionExpiresAt
                    ? new Date(org.subscriptionExpiresAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not Set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Access Status</p>
                <div className="mt-0.5">
                  {isExpired ? (
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle size={13} /> Access Blocked (Expired)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Valid ({days} Days Remaining)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[var(--border-soft)] mb-4">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                <CalendarDays size={14} className="text-emerald-700" />
                <span>Select & Change Expiry Date</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={expiryDateInput}
                  onChange={(e) => setExpiryDateInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer"
                />
                <button
                  disabled={extendingSubscription || !expiryDateInput}
                  onClick={handleSetExactDate}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1"
                >
                  <Check size={13} />
                  <span>{extendingSubscription ? "Saving..." : "Set Date"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-700">Quick Validity Extension</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "+7 Days", days: 7 },
                  { label: "+30 Days", days: 30 },
                  { label: "+90 Days", days: 90 },
                  { label: "+1 Year", days: 365 },
                ].map((item) => (
                  <button
                    key={item.days}
                    disabled={extendingSubscription}
                    onClick={() => handleExtendSubscription(item.days)}
                    className="py-2.5 px-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-gray-200 rounded-xl text-xs font-bold text-emerald-800 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-24 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-emerald-600"
                />
                <button
                  disabled={extendingSubscription}
                  onClick={() => handleExtendSubscription(parseInt(customDays || 30, 10))}
                  className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {extendingSubscription ? "Updating..." : `Add Custom ${customDays} Days`}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-soft)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Single-Device Access & Session Control
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Multi-device login lock and unauthorized attempt logs
                  </p>
                </div>
              </div>
              <button
                disabled={resettingDevice}
                onClick={() => setResetDeviceModalOpen(true)}
                className="text-xs font-bold px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw size={12} className={resettingDevice ? "animate-spin" : ""} />
                <span>Reset Device Session</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-[var(--border-soft)] mb-5">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Current Active Terminal</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">
                  {orgAdmin?.activeDeviceInfo?.deviceName || "No Active Terminal"}
                </p>
                <p className="text-[11px] font-mono text-gray-400">
                  {orgAdmin?.activeDeviceInfo?.ip || "Terminal Offline"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Concurrent Device Blocks</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-lg font-black text-rose-600">
                    {orgAdmin?.conflictAttemptsCount || 0}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Unauthorized multi-terminal attempts
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <History size={13} />
                  <span>Recent Terminal Access Log</span>
                </p>
                <span className="text-[11px] text-gray-400">
                  {accessLogs.length} Events Logged
                </span>
              </div>

              {accessLogs.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center bg-white rounded-xl border border-gray-100">
                  No access attempts logged yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {accessLogs.slice(0, 5).map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-gray-100 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {log.deviceName || "Web Terminal"}{" "}
                          <span className="font-mono text-[10px] text-gray-400 font-normal">
                            ({log.ip})
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(log.attemptedAt).toLocaleString("en-IN")} • {log.details}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === "Success"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.status === "Blocked_Device_Conflict"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {log.status === "Blocked_Device_Conflict" ? "Blocked" : log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-soft)] overflow-hidden shadow-xs">
        <div className="p-4 bg-[var(--bg-main)] border-b border-[var(--border-soft)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Organization Access PIN & Security Versioning
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Active credentials, disabled historical PINs, and session versioning
              </p>
            </div>
          </div>
          <button
            onClick={() => setResetCredsModalOpen(true)}
            className="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <KeyRound size={13} />
            <span>Generate New PIN</span>
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-700" />
                Current Active PIN
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-emerald-100 shadow-xs">
              <span className="font-mono text-base font-bold text-gray-900 select-all">
                {orgAdmin?.lastPassword || "••••••••••••"}
              </span>
              {orgAdmin?.lastPassword && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(orgAdmin.lastPassword);
                    alert("Active PIN copied to clipboard!");
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                >
                  Copy PIN
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              Security Session Version: <span className="font-mono font-bold text-gray-800">v{orgAdmin?.sessionVersion || 1}</span> • Active terminals authenticate with this version.
            </p>
          </div>

          <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <History size={14} className="text-gray-500" />
                Previous Disabled PINs History
              </span>
              <span className="text-[11px] text-gray-400">
                {(orgAdmin?.passwordHistory || []).length} Archived
              </span>
            </div>

            {(!orgAdmin?.passwordHistory || orgAdmin.passwordHistory.length === 0) ? (
              <p className="text-xs text-gray-400 py-4 text-center bg-white rounded-xl border border-gray-100">
                No previous PINs deactivated yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {orgAdmin.passwordHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white border border-gray-100 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-mono text-gray-400 line-through text-xs font-semibold">
                        {item.pin}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Deactivated on {new Date(item.deactivatedAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      Disabled
                    </span>
                  </div>
                ))}
              </div>
            )}
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
                <th className="py-3 px-4 font-semibold">Active Terminal</th>
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
                  <td className="py-3 px-4 text-xs font-mono text-[var(--text-secondary)]">
                    {u.activeSessionKey ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-sans font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        {u.activeDeviceInfo?.deviceName || "Active Terminal"}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not Logged In</span>
                    )}
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

      <ResetCredentialsConfirmModal
        isOpen={resetCredsModalOpen}
        organization={data?.organization}
        loading={resetCredsLoading}
        onClose={() => setResetCredsModalOpen(false)}
        onConfirm={handleConfirmResetPassword}
      />

      <ResetCredentialsSuccessModal
        isOpen={resetCredsSuccessData.isOpen}
        organization={resetCredsSuccessData.organization}
        credentialsData={resetCredsSuccessData.credentialsData}
        onClose={() =>
          setResetCredsSuccessData({
            isOpen: false,
            organization: null,
            credentialsData: null,
          })
        }
      />

      <ResetDeviceSessionConfirmModal
        isOpen={resetDeviceModalOpen}
        organization={data?.organization}
        loading={resettingDevice}
        onClose={() => setResetDeviceModalOpen(false)}
        onConfirm={handleConfirmResetDeviceSession}
      />
    </div>
  );
};

export default OrganizationDetailsPage;
