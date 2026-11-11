import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Menu,
  X,
  User,
  Sparkles,
  CircleDot,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthStates";

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Organizations", path: "/organizations", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            Rx
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-none text-sm tracking-tight">Spren Admin</h1>
            <p className="text-[10px] text-slate-500 font-medium">Control Center</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block md:w-64 bg-slate-950 text-slate-200 flex flex-col flex-shrink-0 z-40 md:sticky md:top-0 md:h-screen border-r border-slate-900 shadow-xl`}
      >
        <div className="p-5 border-b border-slate-900/80 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-extrabold text-sm shadow-md ring-1 ring-emerald-500/30">
            Rx
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm tracking-tight text-white">Spren Admin</h1>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Multi-Tenant Console</p>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-emerald-800/90 text-white shadow-sm ring-1 ring-emerald-600/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? "text-emerald-300"
                        : "text-slate-400 group-hover:text-slate-200"
                    }
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 py-3 mx-4 mt-auto mb-2 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-1">
            <CircleDot size={12} className="text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-200">
              System Online
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Multi-tenant data isolation active across all connected pharmacies.
          </p>
        </div>

        <div className="p-4 border-t border-slate-900 bg-slate-950">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-xs ring-2 ring-slate-700/50">
              <User size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {adminUser?.name || "Super Admin"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {adminUser?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/40"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
