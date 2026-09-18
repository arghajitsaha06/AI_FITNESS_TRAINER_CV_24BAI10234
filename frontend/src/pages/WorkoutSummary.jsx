import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { CheckCircle2, Flame, Clock, Zap, Target, ArrowRight, Save, LayoutDashboard, History } from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import Button from "../components/common/Button";
import { useWorkout } from "../context/WorkoutContext";
import { useUser } from "../context/UserContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export const WorkoutSummary = () => {
  const navigate = useNavigate();
  const { lastCompletedSession } = useWorkout();
  const { saveWorkout, loading } = useUser();
  const [saved, setSaved] = useState(false);

  // Fallback if accessed directly
  const session = lastCompletedSession || {
    exercise: "Bicep Curl",
    exerciseId: "bicep_curl",
    reps: 18,
    validReps: 17,
    invalidReps: 1,
    formAccuracyPct: 94,
    durationFormatted: "02:14",
    durationSeconds: 134,
    avgFps: 29.8,
  };

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F97316", "#FB923C", "#22C55E", "#F8FAFC"],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleSave = async () => {
    await saveWorkout(session);
    setSaved(true);
    setTimeout(() => {
      navigate("/history");
    }, 400);
  };

  // Mock rep cadence data for performance overview chart
  const repPerformanceData = [
    { rep: "R1-3", score: 96, label: "Warmup" },
    { rep: "R4-6", score: 94, label: "Steady" },
    { rep: "R7-9", score: 95, label: "Optimal" },
    { rep: "R10-12", score: 92, label: "Fatigue onset" },
    { rep: "R13-15", score: 93, label: "Form held" },
    { rep: "R16-18", score: 90, label: "Peak strain" },
  ];

  return (
    <PageContainer maxWidth="max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-statusSuccess/15 border border-statusSuccess/30 text-xs font-semibold text-statusSuccess mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>SESSION RECORDED</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-textPrimary tracking-tight uppercase">
          WORKOUT COMPLETE
        </h1>
        <p className="text-base sm:text-lg text-textSecondary max-w-lg mx-auto">
          Great work. Here's your session summary for{" "}
          <span className="text-brand-orange font-semibold">
            {session.exercise}
          </span>
          .
        </p>
      </div>

      {/* Main Completion Card with Large Circular Indicator */}
      <div className="p-8 sm:p-10 rounded-3xl bg-navy-800 border border-white/5 shadow-elevated mb-8 relative overflow-hidden">
        {/* Radial subtle orange glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center text-center mb-10">
          {/* Large Orange Circular Completion Indicator */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="#172033"
                strokeWidth="12"
                fill="none"
              />
              {/* Orange progress ring */}
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="#F97316"
                strokeWidth="12"
                strokeDasharray="427"
                strokeDashoffset={427 - (427 * (session.formAccuracyPct || 94)) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black font-sans text-brand-orange tracking-tight">
                {session.formAccuracyPct}%
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted mt-0.5">
                FORM ACCURACY
              </span>
            </div>
          </div>

          <div className="text-sm font-semibold text-statusSuccess flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Optimal biomechanical movement pattern maintained</span>
          </div>
        </div>

        {/* 5 Primary Session Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-white/5">
          {/* TOTAL REPS */}
          <div className="p-3.5 rounded-2xl bg-navy-850 border border-white/5 text-center">
            <span className="text-[10px] font-mono uppercase text-textMuted block">
              TOTAL REPS
            </span>
            <div className="text-2xl font-black text-brand-orange mt-0.5 font-sans">
              {session.reps}
            </div>
          </div>

          {/* VALID REPS */}
          <div className="p-3.5 rounded-2xl bg-navy-850 border border-white/5 text-center">
            <span className="text-[10px] font-mono uppercase text-textMuted block">
              VALID REPS
            </span>
            <div className="text-2xl font-black text-statusSuccess mt-0.5 font-sans">
              {session.validReps}
            </div>
          </div>

          {/* INVALID REPS */}
          <div className="p-3.5 rounded-2xl bg-navy-850 border border-white/5 text-center">
            <span className="text-[10px] font-mono uppercase text-textMuted block">
              INVALID REPS
            </span>
            <div className="text-2xl font-black text-statusWarning mt-0.5 font-sans">
              {session.invalidReps}
            </div>
          </div>

          {/* DURATION */}
          <div className="p-3.5 rounded-2xl bg-navy-850 border border-white/5 text-center">
            <span className="text-[10px] font-mono uppercase text-textMuted block">
              DURATION
            </span>
            <div className="text-2xl font-black text-textPrimary mt-0.5 font-mono">
              {session.durationFormatted}
            </div>
          </div>

          {/* AVERAGE FPS */}
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-navy-850 border border-white/5 text-center">
            <span className="text-[10px] font-mono uppercase text-textMuted block">
              AVG FPS
            </span>
            <div className="text-2xl font-black text-textSecondary mt-0.5 font-mono">
              {session.avgFps}
            </div>
          </div>
        </div>
      </div>

      {/* PERFORMANCE OVERVIEW CHART */}
      <div className="p-6 sm:p-8 rounded-3xl bg-navy-800 border border-white/5 shadow-card mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-textPrimary uppercase tracking-wider">
              PERFORMANCE OVERVIEW
            </h3>
            <p className="text-xs text-textMuted mt-0.5">
              Repetition consistency across 3-rep blocks
            </p>
          </div>
          <span className="text-xs font-mono text-brand-bright">
            Target: &gt;90% Form
          </span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={repPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="rep" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[80, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3 rounded-xl bg-navy-850 border border-white/10 text-xs">
                        <span className="font-bold text-textPrimary">{label}</span>
                        <div className="text-brand-orange font-bold font-mono mt-1">
                          Score: {payload[0].value}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3 Action Buttons: [ SAVE WORKOUT ], [ VIEW HISTORY ], [ BACK TO DASHBOARD ] */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          onClick={handleSave}
          size="lg"
          icon={Save}
          loading={loading}
          disabled={saved}
          className="w-full sm:w-auto px-8 shadow-orange-glow"
        >
          {saved ? "WORKOUT SAVED!" : "SAVE WORKOUT"}
        </Button>

        <Link to="/history" className="w-full sm:w-auto">
          <Button variant="secondary" size="lg" icon={History} className="w-full">
            VIEW HISTORY
          </Button>
        </Link>

        <Link to="/" className="w-full sm:w-auto">
          <Button variant="ghost" size="lg" icon={LayoutDashboard} className="w-full">
            BACK TO DASHBOARD
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
};

export default WorkoutSummary;
