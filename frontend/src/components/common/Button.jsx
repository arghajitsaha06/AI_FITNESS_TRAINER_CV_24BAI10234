import React from "react";

const variants = {
  primary:
    "bg-brand-orange hover:bg-brand-bright text-white shadow-orange-sm hover:shadow-orange-glow border border-brand-bright/20 active:scale-[0.98]",
  secondary:
    "bg-navy-800 hover:bg-navy-750 text-textPrimary border border-white/10 hover:border-white/20 active:scale-[0.98]",
  outline:
    "bg-transparent border border-brand-orange/40 text-brand-bright hover:bg-brand-orange/10 hover:border-brand-orange active:scale-[0.98]",
  danger:
    "bg-statusError/90 hover:bg-statusError text-white shadow-sm hover:shadow-red-500/20 active:scale-[0.98]",
  ghost:
    "bg-transparent hover:bg-white/5 text-textSecondary hover:text-textPrimary active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm font-semibold rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base font-bold rounded-xl gap-2.5 tracking-wide",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-brand-orange/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === "right" && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
};

export default Button;
