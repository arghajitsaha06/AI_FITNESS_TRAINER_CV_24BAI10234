import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { mockWeeklyPerformance } from "../../data/mockData";
import { BarChart3, Target, Flame } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 rounded-xl bg-navy-850/95 border border-white/10 shadow-elevated text-xs space-y-2">
        <div className="font-bold text-textPrimary text-sm border-b border-white/10 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[11px] text-brand-bright font-mono">
            {data.workouts} {data.workouts === 1 ? "Session" : "Sessions"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
          <div className="text-textMuted">Reps:</div>
          <div className="font-bold text-brand-orange text-right font-mono">
            {data.reps}
          </div>
          <div className="text-textMuted">Form Accuracy:</div>
          <div className="font-bold text-statusSuccess text-right font-mono">
            {data.accuracy}%
          </div>
          <div className="text-textMuted">Active Time:</div>
          <div className="font-bold text-textSecondary text-right font-mono">
            {data.durationMin}m
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const PerformanceChart = () => {
  const [metric, setMetric] = useState("reps"); // "reps" | "accuracy"

  // Summary figures
  const totalRepsWeek = mockWeeklyPerformance.reduce((acc, d) => acc + d.reps, 0);
  const avgAccuracyWeek = Math.round(
    mockWeeklyPerformance.reduce((acc, d) => acc + d.accuracy, 0) /
      mockWeeklyPerformance.length
  );
  const totalSessionsWeek = mockWeeklyPerformance.reduce(
    (acc, d) => acc + d.workouts,
    0
  );

  return (
    <div className="p-6 rounded-2xl bg-navy-800 border border-white/5 shadow-card">
      {/* Header row with titles and summary metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-textPrimary uppercase tracking-wider">
              WEEKLY PERFORMANCE
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
          </div>
          <p className="text-xs text-textMuted mt-0.5">
            Mon - Sun volume, movement consistency, and form accuracy
          </p>
        </div>

        {/* Metric Switcher & Summary Badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMetric("reps")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              metric === "reps"
                ? "bg-brand-orange text-white shadow-sm"
                : "bg-navy-750 text-textSecondary hover:text-textPrimary"
            }`}
          >
            Reps Volume
          </button>
          <button
            onClick={() => setMetric("accuracy")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              metric === "accuracy"
                ? "bg-brand-orange text-white shadow-sm"
                : "bg-navy-750 text-textSecondary hover:text-textPrimary"
            }`}
          >
            Form Accuracy
          </button>
        </div>
      </div>

      {/* 3 Overview Mini-Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6 p-3 rounded-xl bg-navy-850/60 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-navy-750 flex items-center justify-center text-brand-orange shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-textMuted tracking-wider">
              Total Reps
            </div>
            <div className="text-sm sm:text-base font-extrabold text-textPrimary">
              {totalRepsWeek.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-white/5 pl-3">
          <div className="w-8 h-8 rounded-lg bg-navy-750 flex items-center justify-center text-statusSuccess shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-textMuted tracking-wider">
              Avg Form
            </div>
            <div className="text-sm sm:text-base font-extrabold text-textPrimary">
              {avgAccuracyWeek}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-white/5 pl-3">
          <div className="w-8 h-8 rounded-lg bg-navy-750 flex items-center justify-center text-textSecondary shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-textMuted tracking-wider">
              Workouts
            </div>
            <div className="text-sm sm:text-base font-extrabold text-textPrimary">
              {totalSessionsWeek} sessions
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={mockWeeklyPerformance}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="chartGradientOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="chartGradientGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={metric === "reps" ? [80, 260] : [80, 100]}
              tickFormatter={(v) => (metric === "accuracy" ? `${v}%` : v)}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey={metric}
              stroke={metric === "reps" ? "#F97316" : "#22C55E"}
              strokeWidth={3}
              fillOpacity={1}
              fill={
                metric === "reps"
                  ? "url(#chartGradientOrange)"
                  : "url(#chartGradientGreen)"
              }
              activeDot={{
                r: 6,
                fill: metric === "reps" ? "#FB923C" : "#22C55E",
                stroke: "#111827",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
