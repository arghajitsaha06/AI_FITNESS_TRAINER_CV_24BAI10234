import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Dumbbell,
  History,
  User,
  Settings,
  X,
  Activity,
  LogOut,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Start Workout", path: "/workout", icon: Dumbbell },
  { name: "History", path: "/history", icon: History },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Settings", path: "/settings", icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-navy-900 border-r border-white/5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header & Logo */}
        <div>
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
            <NavLink
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 group focus:outline-none"
            >
              {/* Logo icon: Minimal human-motion / AI sensor symbol */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-navy-800 border border-white/10 group-hover:border-brand-orange/40 transition-all duration-300 shadow-sm">
                <div className="absolute inset-0 rounded-xl bg-brand-orange/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <svg
                  className="w-6 h-6 text-brand-orange transition-transform duration-300 group-hover:scale-105"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Motion node head */}
                  <circle cx="12" cy="5" r="2.5" />
                  {/* Kinetic torso vector */}
                  <path d="M12 7.5v6" />
                  {/* Articulated kinetic joints with sensor dots */}
                  <path d="m8 10 4 2 4-2" />
                  <path d="m8 18 4-4.5 4 4.5" />
                </svg>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-sm tracking-wider text-textPrimary uppercase">
                    AI FITNESS
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shadow-orange-sm animate-pulse" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-textMuted uppercase -mt-0.5">
                  TRAINER
                </span>
              </div>
            </NavLink>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-textMuted hover:text-textPrimary hover:bg-white/5 lg:hidden focus:outline-none"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1.5">
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-textMuted">
              Core Platform
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-orange/10 text-textPrimary font-semibold shadow-sm"
                      : "text-textSecondary hover:text-textPrimary hover:bg-white/5"
                  }`}
                >
                  {/* Left active vertical indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand-orange shadow-orange-sm" />
                  )}

                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive
                        ? "text-brand-orange"
                        : "text-textMuted group-hover:text-textSecondary"
                    }`}
                  />
                  <span>{item.name}</span>

                  {item.name === "Start Workout" && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-bright border border-brand-orange/30">
                      Live
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section with Logout */}
        <div className="p-3.5 m-3 rounded-2xl bg-navy-850/80 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-navy-750 border border-white/10 flex items-center justify-center text-brand-bright font-bold text-sm">
                {(user?.displayName || "Athlete").slice(0, 2).toUpperCase()}
              </div>
              {/* Online status indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-statusSuccess border-2 border-navy-900 shadow-sm" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-textPrimary truncate">
                  {user?.displayName || "Athlete"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-textMuted">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-statusSuccess" />
                <span>Online</span>
                <span className="text-white/20">•</span>
                <span className="text-[11px] font-mono text-brand-soft">
                  {user?.athleteId || "#ATH-0001"}
                </span>
              </div>
            </div>

            {/* Logout Action Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-textMuted hover:text-statusError hover:bg-white/5 transition-colors shrink-0 focus:outline-none"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
