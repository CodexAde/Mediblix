import React, { useState } from "react";
import { X, Copy, Check, Building2, User, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import adminOrgService from "../../services/adminOrgService";

const CreateOrganizationModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let gen = "Mediblix@";
    for (let i = 0; i < 6; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password: gen });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await adminOrgService.createOrganization(formData);
      setCreatedResult(response);
      onCreated(response.organization);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err.message || "Failed to create organization"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const text = `Mediblix Pharmacy Credentials\nOrganization: ${createdResult.organization.name}\nTenant Code: ${createdResult.organization.code}\nLogin URL: http://localhost:5173/login\nEmail: ${createdResult.credentials.email}\nPassword: ${createdResult.credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      code: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      password: "",
    });
    setCreatedResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[var(--bg-main)] rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-[var(--border-soft)]">
        <div className="px-6 py-4 border-b border-[var(--border-soft)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] text-lg">
                {createdResult ? "Organization Provisioned" : "Add Organization"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {createdResult ? "Login details are ready" : "Create new client pharmacy tenancy"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {createdResult ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-900 text-xs">
              <p className="font-bold">Organization Created Successfully</p>
              <p className="mt-1 text-green-700">
                A dedicated tenancy and administrator account have been initialized.
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl p-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Organization</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {createdResult.organization.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Tenant Code</span>
                <span className="font-mono text-xs text-[var(--text-primary)]">
                  {createdResult.organization.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Admin Email</span>
                <span className="font-mono text-xs text-[var(--text-primary)]">
                  {createdResult.credentials.email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Admin Password</span>
                <span className="font-mono text-xs font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded">
                  {createdResult.credentials.password}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl hover:border-[var(--accent)] text-[var(--text-primary)] font-medium text-sm transition-all cursor-pointer"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Credentials"}</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 font-medium text-sm transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Pharmacy / Organization Name *
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-3 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Apollo Healthcare Pharmacy"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Tenant Code (Optional)
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. APOLLO01"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)] uppercase font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Contact Person *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    name="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Contact Email (Admin Login ID) *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-[var(--text-secondary)]" />
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="admin@apollo.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Pharmacy Address
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Plot 12, Sector 4, MG Road, Bangalore"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">
                  Initial Password
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-xs text-[var(--accent)] hover:opacity-80 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Generate Password</span>
                </button>
              </div>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to auto-generate"
                className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)] font-mono focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-soft)]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-xl text-[var(--text-primary)] text-sm font-medium hover:border-[var(--accent)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 text-sm font-medium transition-all cursor-pointer"
              >
                {submitting ? "Adding..." : "Add Organization"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateOrganizationModal;
