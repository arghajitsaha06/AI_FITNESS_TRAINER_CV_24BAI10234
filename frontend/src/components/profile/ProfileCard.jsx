import React from "react";
import { User, Calendar, ShieldCheck, Award, Zap, Flame, Activity, Clock } from "lucide-react";
import { useUser } from "../../context/UserContext";
import Badge from "../common/Badge";

export const ProfileCard = () => {
  const { user } = useUser();

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-navy-800 border border-white/5 shadow-card relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        {/* Left: Avatar & Identity Details */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-brand-orange via-brand-bright to-navy-900 p-0.5 shadow-orange-sm">
              <div className="w-full h-full rounded-2xl bg-navy-850 flex items-center justify-center font-extrabold text-2xl sm:text-3xl text-brand-orange overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(user.displayName || "Athlete").slice(0, 2).toUpperCase()}</span>
                )}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-statusSuccess border-2 border-navy-800 shadow-sm" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-textPrimary tracking-tight">
                {user.displayName}
              </h2>
              <Badge variant="orange" size="sm">
                {user.tier}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-textMuted font-mono">
              <span className="text-brand-soft font-semibold">ID: {user.athleteId}</span>
              <span>•</span>
              <span className="text-textSecondary">@{user.username}</span>
              {user.email && (
                <>
                  <span>•</span>
                  <span className="text-textSecondary">{user.email}</span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-textMuted" />
                Member since {user.memberSince}
              </span>
            </div>

            <p className="text-xs text-textSecondary max-w-md pt-1 leading-relaxed">
              {user.bio}
            </p>
          </div>
        </div>

        {/* Right: Quick Streak Banner */}
        <div className="p-4 rounded-2xl bg-navy-850/80 border border-brand-orange/20 flex items-center gap-3 self-stretch md:self-auto">
          <div className="w-12 h-12 rounded-xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-brand-soft uppercase tracking-wider">
              Training Streak
            </div>
            <div className="text-xl font-black text-textPrimary font-sans">
              {user.stats.streakDays} Days Active
            </div>
          </div>
        </div>
      </div>

      {/* Primary Statistics Row: TOTAL WORKOUTS | TOTAL REPS | TOTAL TIME */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
        <div className="p-4 rounded-2xl bg-navy-850/60 border border-white/5">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted uppercase font-mono mb-1">
            <Activity className="w-4 h-4 text-brand-orange" />
            <span>TOTAL WORKOUTS</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-textPrimary font-sans">
            {user.stats.totalWorkouts}
          </div>
          <div className="text-[11px] text-textMuted mt-0.5">
            Sessions completed
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-850/60 border border-brand-orange/30">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted uppercase font-mono mb-1">
            <Flame className="w-4 h-4 text-brand-bright" />
            <span>TOTAL REPS</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand-orange font-sans">
            {user.stats.totalReps.toLocaleString()}
          </div>
          <div className="text-[11px] text-brand-soft mt-0.5">
            Verified repetitions
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-850/60 border border-white/5">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted uppercase font-mono mb-1">
            <Clock className="w-4 h-4 text-textSecondary" />
            <span>TOTAL TIME</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-textPrimary font-sans">
            {user.stats.totalTimeFormatted}
          </div>
          <div className="text-[11px] text-textMuted mt-0.5">
            Active CV training
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
