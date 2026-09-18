import React from "react";
import { Dumbbell, Calendar, Clock, CheckCircle2, ChevronRight, Activity } from "lucide-react";

export const SessionCard = ({ session }) => {
  const accuracyNum = parseInt(session.accuracy, 10) || session.accuracyNum || 90;

  return (
    <div className="p-4 rounded-2xl bg-navy-800 border border-white/5 space-y-3 hover:border-brand-orange/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy-750 flex items-center justify-center text-brand-orange">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-textPrimary text-sm">{session.exercise}</div>
            <div className="text-[11px] text-textMuted font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{session.date}</span>
            </div>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
            accuracyNum >= 95
              ? "bg-statusSuccess/15 text-statusSuccess border border-statusSuccess/30"
              : accuracyNum >= 90
              ? "bg-brand-orange/15 text-brand-bright border border-brand-orange/30"
              : "bg-statusWarning/15 text-statusWarning border border-statusWarning/30"
          }`}
        >
          {session.accuracy}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center font-mono text-xs">
        <div className="bg-navy-850/60 p-2 rounded-xl">
          <span className="text-[10px] text-textMuted block">REPS</span>
          <span className="font-bold text-brand-orange text-sm">{session.reps}</span>
        </div>
        <div className="bg-navy-850/60 p-2 rounded-xl">
          <span className="text-[10px] text-textMuted block">INVALID</span>
          <span className={`font-bold text-sm ${session.invalid > 0 ? "text-statusWarning" : "text-textMuted"}`}>
            {session.invalid}
          </span>
        </div>
        <div className="bg-navy-850/60 p-2 rounded-xl">
          <span className="text-[10px] text-textMuted block">TIME</span>
          <span className="font-bold text-textPrimary text-sm">{session.duration}</span>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
