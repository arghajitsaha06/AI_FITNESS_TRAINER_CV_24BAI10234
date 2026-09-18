import React from "react";
import PageContainer from "../components/layout/PageContainer";
import VideoPanel from "../components/workout/VideoPanel";
import LiveStats from "../components/workout/LiveStats";
import FeedbackPanel from "../components/workout/FeedbackPanel";
import WorkoutTimer from "../components/workout/WorkoutTimer";
import WorkoutControls from "../components/workout/WorkoutControls";
import { useWorkout } from "../context/WorkoutContext";
import { mockExercises } from "../data/mockData";
import { Dumbbell, Sparkles, Activity } from "lucide-react";

export const LiveWorkout = () => {
  const { currentExercise, selectExercise, status } = useWorkout();

  return (
    <PageContainer maxWidth="max-w-[1600px]">
      {/* Exercise Quick Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
            <span className="text-xs font-mono uppercase tracking-widest text-brand-soft font-semibold">
              Live AI Motion Tracking Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight uppercase mt-0.5">
            {currentExercise.displayName}
          </h1>
        </div>

        {/* Quick Exercise Tabs to test all 3 exercises */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-navy-800 border border-white/5 self-start sm:self-auto">
          {mockExercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => selectExercise(ex.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentExercise.id === ex.id
                  ? "bg-brand-orange text-white shadow-orange-sm"
                  : "text-textSecondary hover:text-textPrimary hover:bg-white/5"
              }`}
            >
              {ex.displayName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Camera / Video Panel + AI Coach Feedback */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <VideoPanel />
          <FeedbackPanel />
        </div>

        {/* Right Column (5 cols): Live Stats + Timer + Controls + Side Panel */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Workout Timer */}
          <WorkoutTimer />

          {/* Workout Controls & AI Monitor Badges */}
          <WorkoutControls />

          {/* Large Live Athletic Statistics */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold font-mono tracking-wider text-textMuted uppercase px-1">
              LIVE TELEMETRY
            </div>
            <LiveStats />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default LiveWorkout;
