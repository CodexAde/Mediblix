import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthStates";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setLocalError(err.message || "Invalid credentials or unauthorized");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F8FAFF]">
      <div className="w-full max-w-[420px] bg-white rounded-2xl p-8 border border-[var(--border-soft)] shadow-sm">
        <div className="mb-6 text-center">
          <img
            src="/Mediblix-logo.png"
            alt="Mediblix Logo"
            className="w-14 h-14 object-contain mx-auto mb-3"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-bold mb-3 uppercase tracking-wider">
            <ShieldCheck size={12} />
            Platform Admin Console
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Admin Portal
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Sign in with authorized administrator credentials
          </p>
        </div>

        {localError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <ShieldAlert size={15} className="flex-shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-3 text-[var(--text-secondary)]"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adarshrpandey10@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-3 text-[var(--text-secondary)]"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-[var(--bg-main)] border border-[var(--border-soft)] focus:border-[var(--accent)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[var(--accent)] text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Admin"}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
