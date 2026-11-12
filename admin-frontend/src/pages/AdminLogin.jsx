import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthStates";

const AdminLogin = () => {
  const [email, setEmail] = useState("adarshrpandey10@gmail.com");
  const [password, setPassword] = useState("Admin@Mediblix2026");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleFillDemo = () => {
    setEmail("adarshrpandey10@gmail.com");
    setPassword("Admin@Mediblix2026");
    setLocalError(null);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-slate-900">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/40 ring-1 ring-black/5">
          <div className="text-center mb-7">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-50 via-teal-50 to-white border border-emerald-100 flex items-center justify-center shadow-sm mx-auto p-2.5">
                <img
                  src="/Mediblix-logo.png"
                  alt="Mediblix Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck size={12} />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-semibold text-emerald-800 mb-3 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Platform Admin Console
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Sign in with authorized administrator credentials
            </p>
          </div>

          {localError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5 animate-shake">
              <ShieldAlert size={16} className="flex-shrink-0 text-rose-600" />
              <span className="font-medium">{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Mail size={17} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adarshrpandey10@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles size={11} />
                  <span>Default Fill</span>
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2 text-[11px] text-emerald-900 leading-snug">
              <KeyRound size={14} className="flex-shrink-0 text-emerald-700 mt-0.5" />
              <div>
                <span className="font-bold">Authorized Account:</span>{" "}
                adarshrpandey10@gmail.com
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:via-emerald-800 hover:to-teal-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? "Authenticating Platform..." : "Sign In to Admin Console"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Enterprise 256-bit SSL Security • Mediblix Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
