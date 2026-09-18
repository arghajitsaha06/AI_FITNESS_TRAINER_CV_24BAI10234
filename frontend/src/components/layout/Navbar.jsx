import React from "react";
import { Menu, Play, Bell, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { useWorkout } from "../../context/WorkoutContext";

export const Navbar = ({ onOpenSidebar }) => {
  const location = useLocation();
  const { status, currentExercise } = useWorkout();

  // Route title mapper
  const getPageMeta = () => {
    const path = location.pathname;
    if (path === "/") return { title: "Dashboard", tag: "Overview" };
    if (path === "/workout") return { title: "Choose Workout", tag: "Movement Select" };
    if (path === "/workout/live") return { title: "Live Workout", tag: "CV Stream" };
    if (path === "/workout/summary") return { title: "Workout Summary", tag: "Performance" };
    if (path === "/history") return { title: "Workout History", tag: "Logs & Trends" };
    if (path === "/profile") return { title: "Athlete Profile", tag: "Biometrics" };
    if (path === "/settings") return { title: "Settings", tag: "Preferences" };
    return { title: "AI Fitness Trainer", tag: "Platform" };
  };

  const meta = getPageMeta();

  return (
    <header className="sticky top-0 z-30 h-20 bg-navy-900/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left side: Hamburger & Page context */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-navy-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-textMuted hidden sm:inline-block">
              {meta.tag}
            </span>
            <span className="text-white/20 hidden sm:inline-block">/</span>
            <h1 className="text-lg font-bold text-textPrimary tracking-tight">
              {meta.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Right side: AI System Ready indicator & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Active Session indicator banner (if active) */}
        {status === "running" && location.pathname !== "/workout/live" && (
          <Link to="/workout/live">
            <Badge variant="orange" dot pulse className="animate-bounce">
              Live: {currentExercise.displayName}
            </Badge>
          </Link>
        )}

        {/* AI System Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-800 border border-white/5 text-xs text-textSecondary">
          <span className="font-semibold text-textMuted tracking-wider uppercase text-[10px]">
            AI ENGINE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-statusSuccess animate-pulse shadow-sm" />
          <span className="font-medium text-textPrimary">READY</span>
        </div>

        {/* Quick Launch CTA if not in live session */}
        {location.pathname !== "/workout" && location.pathname !== "/workout/live" && (
          <Link to="/workout">
            <Button
              size="sm"
              icon={Play}
              className="font-medium text-xs sm:text-sm shadow-orange-sm"
            >
              <span className="hidden sm:inline">Start</span> Workout
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
