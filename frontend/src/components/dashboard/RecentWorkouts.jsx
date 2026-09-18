import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ChevronRight, Dumbbell } from "lucide-react";
import { useUser } from "../../context/UserContext";

export const RecentWorkouts = () => {
  const { history } = useUser();
  // Take top 4 most recent workouts
  const recentList = history.slice(0, 4);

  return (
    <div className="p-6 rounded-2xl bg-navy-800 border border-white/5 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-textPrimary uppercase tracking-wider">
            RECENT WORKOUTS
          </h2>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
        </div>
        <Link
          to="/history"
          className="text-xs font-semibold text-brand-bright hover:text-brand-orange flex items-center gap-1 transition-colors group"
        >
          <span>View All History</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Responsive Table / Card View */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-textMuted font-mono">
              <th scope="col" className="pb-3 font-semibold">
                Exercise
              </th>
              <th scope="col" className="pb-3 font-semibold text-center">
                Reps
              </th>
              <th scope="col" className="pb-3 font-semibold text-center">
                Invalid
              </th>
              <th scope="col" className="pb-3 font-semibold text-center">
                Accuracy
              </th>
              <th scope="col" className="pb-3 font-semibold text-center">
                Duration
              </th>
              <th scope="col" className="pb-3 font-semibold text-right">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {recentList.map((item) => {
              const accuracyNum = parseInt(item.accuracy, 10) || item.accuracyNum || 90;
              return (
                <tr
                  key={item.id}
                  className="group hover:bg-navy-750/50 transition-colors"
                >
                  {/* Exercise */}
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-navy-750 border border-white/10 flex items-center justify-center text-brand-bright group-hover:border-brand-orange/40 transition-colors shrink-0">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-textPrimary group-hover:text-brand-bright transition-colors">
                          {item.exercise}
                        </div>
                        <div className="text-[11px] text-textMuted font-mono">
                          {item.avgFps ? `${item.avgFps} FPS` : "30.0 FPS"} • AI Verified
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Reps */}
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold text-textPrimary text-base font-mono">
                      {item.reps}
                    </span>
                  </td>

                  {/* Invalid */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`font-mono text-sm ${
                        item.invalid > 0
                          ? "text-statusWarning font-semibold"
                          : "text-textMuted"
                      }`}
                    >
                      {item.invalid}
                    </span>
                  </td>

                  {/* Accuracy */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                        accuracyNum >= 95
                          ? "bg-statusSuccess/15 text-statusSuccess border border-statusSuccess/30"
                          : accuracyNum >= 90
                          ? "bg-brand-orange/15 text-brand-bright border border-brand-orange/30"
                          : "bg-statusWarning/15 text-statusWarning border border-statusWarning/30"
                      }`}
                    >
                      {item.accuracy}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-4 px-4 text-center font-mono text-textSecondary text-xs">
                    {item.duration}
                  </td>

                  {/* Date */}
                  <td className="py-4 pl-4 text-right text-textMuted text-xs font-medium">
                    {item.date}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentWorkouts;
