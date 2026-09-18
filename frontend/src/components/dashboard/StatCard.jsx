import React from "react";
import { Activity, Flame, Clock, Target, TrendingUp, TrendingDown } from "lucide-react";

const iconMap = {
  Activity,
  Flame,
  Clock,
  Target,
};

export const StatCard = ({
  label,
  value,
  trend,
  trendDirection = "up",
  icon: iconName,
  isHighlight = false,
}) => {
  const IconComponent = iconMap[iconName] || Activity;

  return (
    <div
      className={`relative p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 ${
        isHighlight
          ? "bg-gradient-to-b from-navy-750 to-navy-800 border border-brand-orange/30 shadow-card hover:shadow-orange-glow"
          : "bg-navy-800 hover:bg-navy-750 border border-white/5 shadow-card"
      }`}
    >
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold tracking-wider text-textMuted uppercase">
          {label}
        </span>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isHighlight
              ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/30"
              : "bg-navy-750 text-textSecondary group-hover:text-textPrimary border border-white/5"
          }`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-sans ${
            isHighlight ? "text-brand-orange" : "text-textPrimary"
          }`}
        >
          {value}
        </span>
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          {trendDirection === "up" ? (
            <TrendingUp
              className={`w-3.5 h-3.5 ${
                isHighlight ? "text-brand-bright" : "text-statusSuccess"
              }`}
            />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-statusError" />
          )}
          <span
            className={`font-medium ${
              isHighlight
                ? "text-brand-soft"
                : trendDirection === "up"
                ? "text-statusSuccess"
                : "text-statusError"
            }`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
