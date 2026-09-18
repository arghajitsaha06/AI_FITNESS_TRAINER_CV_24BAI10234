import React from "react";
import Button from "./Button";

export const EmptyState = ({
  icon: Icon,
  title = "No data found",
  description = "There are no records matching your current filter criteria.",
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl bg-navy-800/40 border border-white/5 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-navy-750 border border-white/10 flex items-center justify-center text-brand-bright mb-4 shadow-card">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-lg font-bold text-textPrimary mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-textMuted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
