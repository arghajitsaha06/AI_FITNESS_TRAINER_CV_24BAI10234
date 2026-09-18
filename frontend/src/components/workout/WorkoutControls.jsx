import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Square, Activity, Video, Cpu, ShieldCheck } from "lucide-react";
import Button from "../common/Button";
import { useWorkout } from "../../context/WorkoutContext";

export const WorkoutControls = () => {
  const navigate = useNavigate();
  const { status, startWorkout, pauseWorkout, resumeWorkout, stopWorkout } = useWorkout();

  const handleStop = () => {
    stopWorkout();
    navigate("/workout/summary");
  };

  const isRunning = status === "running";
  const isPaused = status === "paused";

  return (
    <div className="space-y-4">
      {/* 3 Main Action Buttons: [START/RESUME], [PAUSE], [STOP] */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* START / RESUME */}
        {!isRunning ? (
          <Button
            onClick={isPaused ? resumeWorkout : startWorkout}
            variant="primary"
            size="md"
            icon={Play}
            className="w-full font-bold shadow-orange-sm"
          >
            {isPaused ? "RESUME" : "START"}
          </Button>
        ) : (
          <Button
            onClick={pauseWorkout}
            variant="secondary"
            size="md"
            icon={Pause}
            className="w-full font-bold"
          >
            PAUSE
          </Button>
        )}

        {/* PAUSE (Secondary disabled if already paused or not running) */}
        {!isRunning ? (
          <Button
            variant="secondary"
            size="md"
            icon={Pause}
            disabled={!isRunning}
            className="w-full font-semibold opacity-40 cursor-not-allowed"
          >
            PAUSE
          </Button>
        ) : (
          <Button
            onClick={pauseWorkout}
            variant="secondary"
            size="md"
            icon={Pause}
            className="w-full font-semibold"
          >
            PAUSE
          </Button>
        )}

        {/* STOP (Subtle red) */}
        <Button
          onClick={handleStop}
          variant="danger"
          size="md"
          icon={Square}
          className="w-full font-bold"
        >
          STOP
        </Button>
      </div>

      {/* Side Monitoring Cards (Section 20 of prompt):
          POSE DETECTION: DETECTED
          MOVEMENT: TRACKING
          CAMERA: CONNECTED
          AI ENGINE: READY
          Each status: green dot */}
      <div className="p-4 rounded-2xl bg-navy-800 border border-white/5 shadow-card space-y-2.5">
        <div className="text-[11px] font-bold font-mono tracking-wider text-textMuted uppercase mb-3 flex items-center justify-between">
          <span>AI MONITORS</span>
          <span className="text-[10px] text-brand-bright">ALL SYSTEMS NOMINAL</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Pose Detection */}
          <div className="p-2.5 rounded-xl bg-navy-850/80 border border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] text-textMuted uppercase font-mono">
                Pose Detection
              </div>
              <div className="text-textPrimary font-bold text-xs">DETECTED</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-statusSuccess shadow-sm" />
          </div>

          {/* Movement */}
          <div className="p-2.5 rounded-xl bg-navy-850/80 border border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] text-textMuted uppercase font-mono">
                Movement
              </div>
              <div className="text-textPrimary font-bold text-xs">TRACKING</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-statusSuccess shadow-sm" />
          </div>

          {/* Camera */}
          <div className="p-2.5 rounded-xl bg-navy-850/80 border border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] text-textMuted uppercase font-mono">
                Camera
              </div>
              <div className="text-textPrimary font-bold text-xs">CONNECTED</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-statusSuccess shadow-sm" />
          </div>

          {/* AI Engine */}
          <div className="p-2.5 rounded-xl bg-navy-850/80 border border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] text-textMuted uppercase font-mono">
                AI Engine
              </div>
              <div className="text-textPrimary font-bold text-xs">READY</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-statusSuccess shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutControls;
