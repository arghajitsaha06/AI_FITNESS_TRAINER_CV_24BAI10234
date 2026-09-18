import React from "react";
import PageContainer from "../components/layout/PageContainer";
import ExerciseGrid from "../components/workout/ExerciseGrid";
import { Sparkles, ShieldCheck } from "lucide-react";

export const WorkoutSelection = () => {
  return (
    <PageContainer>
      {/* Title & Subtitle */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-brand-orange shadow-orange-sm" />
          <span className="text-xs font-mono uppercase tracking-widest text-brand-soft font-semibold">
            CV Movement Analysis Catalog
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight uppercase">
          CHOOSE YOUR WORKOUT
        </h1>
        <p className="text-base sm:text-lg text-textSecondary mt-2 max-w-2xl">
          Select an exercise and let your AI trainer track your movement.
        </p>
      </div>

      {/* 3 Premium Exercise Cards Grid */}
      <ExerciseGrid />

      {/* Under-grid AI Sensor Telemetry Notice */}
      <div className="mt-10 p-5 rounded-2xl bg-navy-800/60 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-textMuted">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-navy-750 flex items-center justify-center text-statusSuccess shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-textPrimary font-semibold block">
              Computer Vision Kinematics Active
            </span>
            <span>
              All movements calibrate joint pivot angles at 30 FPS.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>MediaPipe Keypoints: 33</span>
          <span className="text-white/20">•</span>
          <span>Angle Accuracy: ±1.2°</span>
        </div>
      </div>
    </PageContainer>
  );
};

export default WorkoutSelection;
