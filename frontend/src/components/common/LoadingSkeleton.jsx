import React from "react";

export const LoadingSkeleton = ({
  className = "h-6 w-full",
  rounded = "rounded-lg",
}) => {
  return (
    <div
      className={`animate-pulse bg-navy-750/70 border border-white/5 ${rounded} ${className}`}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="p-6 rounded-2xl bg-navy-800 border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-4 w-28" />
        <LoadingSkeleton className="h-8 w-8 rounded-xl" />
      </div>
      <LoadingSkeleton className="h-10 w-24" />
      <LoadingSkeleton className="h-4 w-36" />
    </div>
  );
};

export default LoadingSkeleton;
