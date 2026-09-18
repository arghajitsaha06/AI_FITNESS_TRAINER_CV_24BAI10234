import React from "react";
import { MessageSquareQuote, Sparkles, Volume2 } from "lucide-react";
import { useWorkout } from "../../context/WorkoutContext";

const sampleCues = [
  "Good form. Keep your elbow stable.",
  "Keep your back straight.",
  "Go slightly deeper.",
  "Great repetition.",
  "Maintain controlled movement.",
];

export const FeedbackPanel = () => {
  const { liveStats } = useWorkout();
  const feedbackMessage = liveStats?.feedbackMessage || "Good form. Keep your elbow stable.";

  return (
    <div className="p-5 rounded-2xl bg-navy-800 border border-white/5 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-orange/15 text-brand-orange flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">
              AI COACH
            </h3>
          </div>
        </div>

        {/* Status: LIVE FEEDBACK */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-750 border border-white/5 text-[11px] font-medium text-textSecondary">
          <span className="w-2 h-2 rounded-full bg-statusSuccess animate-pulse" />
          <span className="font-mono text-statusSuccess">LIVE FEEDBACK</span>
        </div>
      </div>

      {/* Main Feedback Bubble */}
      <div className="relative p-4 rounded-xl bg-navy-850 border border-brand-orange/20 overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-brand-orange" />
        <div className="flex items-start gap-3">
          <MessageSquareQuote className="w-5 h-5 text-brand-bright shrink-0 mt-0.5" />
          <div>
            <p className="text-base font-semibold text-textPrimary leading-snug">
              "{feedbackMessage}"
            </p>
            <span className="text-[11px] text-textMuted mt-1 block font-mono">
              Biomechanical guidance • Real-time
            </span>
          </div>
        </div>
      </div>

      {/* AI Voice guidance micro indicator */}
      <div className="flex items-center justify-between pt-1 text-xs text-textMuted">
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-brand-bright" />
          <span>Audio Cues Active</span>
        </div>
        <span className="font-mono text-[11px] text-textMuted/60">
          Latency: 18ms
        </span>
      </div>
    </div>
  );
};

export default FeedbackPanel;
