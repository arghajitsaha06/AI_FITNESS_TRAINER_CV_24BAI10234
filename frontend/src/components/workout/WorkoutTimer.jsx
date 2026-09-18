import React from "react";
import { Clock } from "lucide-react";
import { useWorkout } from "../../context/WorkoutContext";

export const WorkoutTimer = () => {
  const { durationFormatted, status } = useWorkout();

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-navy-800 border border-white/5 shadow-card">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-textMuted uppercase tracking-wider mb-1">
        <Clock className="w-3.5 h-3.5 text-brand-orange" />
        <span>ELAPSED TIME</span>
      </div>

      <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-textPrimary py-1">
        {durationFormatted}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span
          className={`w-2 h-2 rounded-full ${
            status === "running"
              ? "bg-brand-orange animate-ping"
              : status === "paused"
              ? "bg-statusWarning"
              : "bg-textMuted"
          }`}
        />
        <span className="text-[11px] font-mono uppercase text-textMuted">
          {status === "running"
            ? "ACTIVE SESSION"
            : status === "paused"
            ? "PAUSED"
            : "READY"}
        </span>
      </div>
    </div>
  );
};

export default WorkoutTimer;
