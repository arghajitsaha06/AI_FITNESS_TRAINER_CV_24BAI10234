import React from "react";
import { Award, Zap, Dumbbell, Flame, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { useUser } from "../../context/UserContext";

const iconMap = {
  Dumbbell,
  Award,
  Flame,
  Activity: TrendingUp,
};

export const FitnessOverview = () => {
  const { user } = useUser();
  const overview = user.fitnessOverview;
  const preferred = user.preferredExercises;
  const activity = user.recentActivity;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. FITNESS OVERVIEW (Left 6 cols) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="p-6 rounded-3xl bg-navy-800 border border-white/5 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-base font-bold text-textPrimary uppercase tracking-wider">
              FITNESS OVERVIEW
            </h3>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-navy-850 border border-white/5">
              <span className="text-[11px] font-mono uppercase text-textMuted block mb-1">
                Strength Score
              </span>
              <div className="text-2xl font-black text-textPrimary">
                {overview.strengthScore}
                <span className="text-xs text-textMuted font-normal"> / 100</span>
              </div>
              <div className="w-full bg-navy-750 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-brand-orange h-full rounded-full"
                  style={{ width: `${overview.strengthScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-850 border border-white/5">
              <span className="text-[11px] font-mono uppercase text-textMuted block mb-1">
                Form Consistency
              </span>
              <div className="text-2xl font-black text-statusSuccess">
                {overview.formConsistencyScore}%
              </div>
              <div className="w-full bg-navy-750 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-statusSuccess h-full rounded-full"
                  style={{ width: `${overview.formConsistencyScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-850 border border-white/5">
              <span className="text-[11px] font-mono uppercase text-textMuted block mb-1">
                Mobility Index
              </span>
              <div className="text-2xl font-black text-textPrimary">
                {overview.mobilityIndex}
                <span className="text-xs text-textMuted font-normal"> / 100</span>
              </div>
              <div className="w-full bg-navy-750 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-brand-bright h-full rounded-full"
                  style={{ width: `${overview.mobilityIndex}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-850 border border-white/5">
              <span className="text-[11px] font-mono uppercase text-textMuted block mb-1">
                Weekly Target
              </span>
              <div className="text-2xl font-black text-brand-orange">
                {overview.weeklyGoalPct}%
              </div>
              <div className="w-full bg-navy-750 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-brand-orange h-full rounded-full"
                  style={{ width: `${overview.weeklyGoalPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Preferred Exercises Breakdown */}
          <div className="pt-4 border-t border-white/5">
            <h4 className="text-xs font-bold text-textMuted uppercase tracking-wider font-mono mb-3">
              PREFERRED EXERCISES
            </h4>
            <div className="space-y-3">
              {preferred.map((ex) => (
                <div key={ex.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-textPrimary">{ex.name}</span>
                    <span className="text-textMuted font-mono">
                      {ex.sessions} sessions ({ex.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-navy-750 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${ex.percentage}%`,
                        backgroundColor: ex.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECENT ACTIVITY TIMELINE (Right 6 cols) */}
      <div className="lg:col-span-6">
        <div className="p-6 rounded-3xl bg-navy-800 border border-white/5 shadow-card h-full flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-base font-bold text-textPrimary uppercase tracking-wider">
              RECENT ACTIVITY
            </h3>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
          </div>

          <div className="space-y-4 flex-1">
            {activity.map((item, idx) => {
              const IconComp = iconMap[item.icon] || Dumbbell;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-navy-850/60 border border-white/5 hover:bg-navy-850 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-navy-750 border border-white/10 flex items-center justify-center text-brand-bright shrink-0 mt-0.5">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-textPrimary truncate">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-textMuted whitespace-nowrap font-mono">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessOverview;
