import React from "react";
import { Dumbbell, Calendar, Clock, Inbox } from "lucide-react";
import SessionCard from "./SessionCard";
import EmptyState from "../common/EmptyState";

export const HistoryTable = ({ sessions = [], onResetFilters }) => {
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No workout records found"
        description="Try adjusting your search query, exercise filter, or date parameters."
        actionLabel="Reset Filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="rounded-2xl bg-navy-800 border border-white/5 shadow-card overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/5 bg-navy-850/40 text-xs uppercase tracking-wider text-textMuted font-mono">
              <th scope="col" className="py-4 px-6 font-semibold">
                DATE
              </th>
              <th scope="col" className="py-4 px-6 font-semibold">
                EXERCISE
              </th>
              <th scope="col" className="py-4 px-4 font-semibold text-center">
                REPS
              </th>
              <th scope="col" className="py-4 px-4 font-semibold text-center">
                INVALID
              </th>
              <th scope="col" className="py-4 px-6 font-semibold text-center">
                ACCURACY
              </th>
              <th scope="col" className="py-4 px-6 font-semibold text-right">
                DURATION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {sessions.map((session) => {
              const accuracyNum =
                parseInt(session.accuracy, 10) || session.accuracyNum || 90;

              return (
                <tr
                  key={session.id}
                  className="group hover:bg-navy-750/50 transition-colors"
                >
                  {/* DATE */}
                  <td className="py-4 px-6 text-textMuted font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-textMuted" />
                      <span>{session.date}</span>
                    </div>
                  </td>

                  {/* EXERCISE */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-navy-750 border border-white/10 flex items-center justify-center text-brand-bright group-hover:border-brand-orange/40 transition-colors">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-textPrimary group-hover:text-brand-bright transition-colors">
                          {session.exercise}
                        </div>
                        <div className="text-[11px] text-textMuted font-mono">
                          {session.avgFps ? `${session.avgFps} FPS` : "30.0 FPS"} • Tracking Validated
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* REPS */}
                  <td className="py-4 px-4 text-center">
                    <span className="font-extrabold text-brand-orange text-base font-mono">
                      {session.reps}
                    </span>
                  </td>

                  {/* INVALID */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`font-mono text-sm ${
                        session.invalid > 0
                          ? "text-statusWarning font-semibold"
                          : "text-textMuted"
                      }`}
                    >
                      {session.invalid}
                    </span>
                  </td>

                  {/* ACCURACY */}
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        accuracyNum >= 95
                          ? "bg-statusSuccess/15 text-statusSuccess border border-statusSuccess/30"
                          : accuracyNum >= 90
                          ? "bg-brand-orange/15 text-brand-bright border border-brand-orange/30"
                          : "bg-statusWarning/15 text-statusWarning border border-statusWarning/30"
                      }`}
                    >
                      {session.accuracy}
                    </span>
                  </td>

                  {/* DURATION */}
                  <td className="py-4 px-6 text-right font-mono text-textPrimary text-sm font-semibold">
                    <div className="flex items-center justify-end gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-textMuted" />
                      <span>{session.duration}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden p-4 space-y-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default HistoryTable;
