import React from "react";

const variants = {
  orange: "bg-brand-orange/15 text-brand-bright border-brand-orange/30",
  success: "bg-statusSuccess/15 text-statusSuccess border-statusSuccess/30",
  warning: "bg-statusWarning/15 text-statusWarning border-statusWarning/30",
  error: "bg-statusError/15 text-statusError border-statusError/30",
  neutral: "bg-navy-750 text-textSecondary border-white/10",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

const dotColors = {
  orange: "bg-brand-orange",
  success: "bg-statusSuccess",
  warning: "bg-statusWarning",
  error: "bg-statusError",
  neutral: "bg-textMuted",
  cyan: "bg-cyan-400",
};

export const Badge = ({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  pulse = false,
  className = "",
}) => {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variants[variant] || variants.neutral} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant] || "bg-brand-orange"}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant] || "bg-brand-orange"}`}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
