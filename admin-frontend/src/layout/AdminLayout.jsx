import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Boxes,
  Building2,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
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
    { path: "/", label: "Dashboard", icon: Boxes },
    { path: "/organizations", label: "Organizations", icon: Building2 },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[var(--bg-main)] flex flex-col">
      <nav className="h-[60px] w-full flex items-center justify-between px-4 lg:px-6 border-b border-[var(--border-soft)] bg-[var(--bg-card)] flex-shrink-0 z-40 relative">
        <div className="flex items-center gap-1.5 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                  active
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]/40"
                }`}
              >
                <Icon size={16} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-extrabold text-[var(--text-primary)] hover:opacity-90 transition-opacity"
          >
            <img
              src="/Mediblix-logo.png"
              alt="Mediblix Logo"
              className="w-9 h-9 object-contain"
            />
            <span>Mediblix</span>
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-soft)]">
            <div className="w-6 h-6 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-bold text-xs">
              <User size={13} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-[var(--text-primary)] leading-none truncate max-w-[130px]">
                {adminUser?.name || "Super Admin"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-soft)] hover:border-red-300 hover:text-red-600 hover:bg-red-50 text-[var(--text-secondary)] text-sm font-medium transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[var(--text-primary)] hover:bg-[var(--border-soft)]/50 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[60px] left-0 right-0 bg-[var(--bg-card)] border-b border-[var(--border-soft)] p-3 space-y-1 shadow-lg">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-primary)] hover:bg-[var(--border-soft)]/40"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <main className="w-full flex-1 overflow-y-auto bg-[var(--bg-main)]">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
