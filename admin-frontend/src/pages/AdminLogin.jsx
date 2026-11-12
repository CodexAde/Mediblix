import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, ShieldCheck, ShieldAlert, ArrowRight, Eye, EyeOff } from "lucide-react";
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

  return (
    <div className="h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white overflow-hidden font-sans">
      <div className="flex flex-col justify-center items-center p-6 lg:p-12 relative bg-[#F8FAFF]">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 text-left">
            <img
              src="/Mediblix-logo.png"
              alt="Mediblix Logo"
              className="w-16 h-16 object-contain mb-4"
            />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold mb-4 tracking-wider uppercase">
              <ShieldCheck size={12} />
              Platform Admin Console
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
              Admin Login <span className="text-orange-400">⚡</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Welcome back! Please enter your administrator credentials.
            </p>
          </div>

          {localError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2.5">
              <ShieldAlert size={16} className="flex-shrink-0 text-red-600" />
              <span className="font-medium">{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Admin Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-green-600 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adarshrpandey10@gmail.com"
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-600 transition-all placeholder:text-gray-300 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-green-600 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-600 transition-all placeholder:text-gray-300 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">
              Powered by <span className="text-green-600 font-black">Mediblix</span>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative bg-[#16a34a] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,40 Q25,20 50,40 T100,40 V100 H0 Z" fill="white" />
            <path d="M0,70 Q30,50 60,70 T100,70 V100 H0 Z" fill="white" />
          </svg>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center p-12">
          <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] p-10 w-full max-w-[500px] border border-white/20 shadow-2xl relative flex flex-col items-center">
            <h2 className="text-3xl font-black text-white leading-tight mb-8 text-center">
              Oversee your network with Mediblix <br />
              <span className="text-green-200">Admin Control Center.</span> 🛡️
            </h2>

            <div className="relative w-full max-w-[380px]">
              <div className="bg-white/5 p-1.5 rounded-3xl">
                <img
                  src="/login_illustration.png"
                  alt="Mediblix Dashboard"
                  className="w-full rounded-[1.5rem] object-cover shadow-2xl border border-white/10"
                />
              </div>

              <div className="absolute -left-6 bottom-8 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-2 border border-green-50">
                <span className="text-lg">🏢</span>
                <p className="text-[11px] font-black text-gray-900 tracking-tight">Multi-Tenant</p>
              </div>

              <div className="absolute -right-6 top-8 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-2 border border-green-50">
                <span className="text-lg">🛡️</span>
                <p className="text-[11px] font-black text-gray-900 tracking-tight">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
