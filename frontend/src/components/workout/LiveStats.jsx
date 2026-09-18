import React from "react";
import { useWorkout } from "../../context/WorkoutContext";
import { Activity, Flame, AlertCircle, Compass, Zap, ShieldCheck } from "lucide-react";

export const LiveStats = () => {
  const { liveStats } = useWorkout();

  const reps = liveStats?.reps ?? 18;
  const invalidReps = liveStats?.invalidReps ?? 1;
  const angle = liveStats?.angle ? liveStats.angle.toFixed(1) : "164.7";
  const state = liveStats?.state ?? "EXTENDED";
  const fps = liveStats?.fps ? liveStats.fps.toFixed(0) : "30";
  const form = liveStats?.form ?? "GOOD";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {/* 1. REPS (Highlighted in Orange) */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-navy-750 to-navy-800 border border-brand-orange/40 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold tracking-wider text-textMuted uppercase font-mono">
            REPS
          </span>
          <Flame className="w-4 h-4 text-brand-orange" />
        </div>
        <div className="text-3xl sm:text-4xl font-black text-brand-orange font-sans tracking-tight">
          {reps}
        </div>
        <div className="text-[11px] text-brand-soft mt-1 font-mono">
          Valid: {liveStats?.validReps ?? 17}
        </div>
      </div>

      {/* 2. INVALID REPS */}
      <div className="p-4 rounded-2xl bg-navy-800 border border-white/5 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold tracking-wider text-textMuted uppercase font-mono">
            INVALID
          </span>
          <AlertCircle className="w-4 h-4 text-textMuted" />
        </div>
        <div
          className={`text-3xl sm:text-4xl font-black font-sans tracking-tight ${
            invalidReps > 0 ? "text-statusWarning" : "text-textPrimary"
          }`}
        >
          {invalidReps}
        </div>
        <div className="text-[11px] text-textMuted mt-1 font-mono">
          {invalidReps > 0 ? "Form flaw detected" : "Zero flaws"}
        </div>
      </div>

      {/* 3. ANGLE (Highlighted in Orange) */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-navy-750 to-navy-800 border border-brand-orange/30 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold tracking-wider text-textMuted uppercase font-mono">
            ANGLE
          </span>
          <Compass className="w-4 h-4 text-brand-bright" />
        </div>
        <div className="text-3xl sm:text-4xl font-black text-brand-bright font-sans tracking-tight">
          {angle}°
        </div>
        <div className="text-[11px] text-brand-soft mt-1 font-mono">
          Real-time kinematic θ
        </div>
      </div>

      {/* 4. STATE */}
      <div className="p-4 rounded-2xl bg-navy-800 border border-white/5 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold tracking-wider text-textMuted uppercase font-mono">
            STATE
          </span>
          <Activity className="w-4 h-4 text-textMuted" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-textPrimary font-sans tracking-tight truncate">
          {state}
        </div>
        <div className="text-[11px] text-textMuted mt-1 font-mono">
          FSM phase
        </div>
      </div>

      {/* 5. FPS */}
      <div className="p-4 rounded-2xl bg-navy-800 border border-white/5 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold tracking-wider text-textMuted uppercase font-mono">
            FPS
          </span>
          <Zap className="w-4 h-4 text-textMuted" />
        </div>
        <div className="text-3xl sm:text-4xl font-black text-textPrimary font-sans tracking-tight">
          {fps}
        </div>
        <div className="text-[11px] text-statusSuccess mt-1 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-statusSuccess" />
          Optimal stream
        </div>
      </div>

      {/* 6. FORM */}
      <div className="p-4 rounded-2xl bg-navy-800 border border-white/5 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold tracking-wider text-textMuted uppercase font-mono">
            FORM
          </span>
          <ShieldCheck className="w-4 h-4 text-statusSuccess" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-statusSuccess font-sans tracking-tight">
          {form}
        </div>
        <div className="text-[11px] text-textMuted mt-1 font-mono">
          {liveStats?.accuracyPct ?? 94}% accuracy
        </div>
      </div>
    </div>
  );
};

export default LiveStats;
