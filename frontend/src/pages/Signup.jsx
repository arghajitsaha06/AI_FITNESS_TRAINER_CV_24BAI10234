import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";

export const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error on edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Name must be at least 2 characters.";
    }

    if (!formData.username.trim()) {
      errors.username = "Username is required.";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username.trim())) {
      errors.username = "Username can only contain letters, numbers, and underscores.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await signup(
        formData.fullName,
        formData.username,
        formData.email,
        formData.password
      );
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-textPrimary flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6 relative z-10">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-800 border border-white/10 shadow-card mb-4 group">
          <svg
            className="w-8 h-8 text-brand-orange"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="5" r="2.5" />
            <path d="M12 7.5v6" />
            <path d="m8 10 4 2 4-2" />
            <path d="m8 18 4-4.5 4 4.5" />
          </svg>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-widest text-textPrimary uppercase">
            AI FITNESS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shadow-orange-sm animate-pulse" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.3em] text-textMuted uppercase -mt-0.5">
          TRAINER
        </span>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-navy-800 border border-white/5 shadow-elevated relative z-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-textPrimary uppercase tracking-tight">
            CREATE ACCOUNT
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-1">
            Register your athlete profile for AI computer vision tracking.
          </p>
        </div>

        {/* Server Error Banner */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-statusError/15 border border-statusError/30 flex items-start gap-3 text-xs text-statusError">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-textMuted block">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Marcus Vance"
              className={`w-full px-4 py-2.5 rounded-xl bg-navy-850 border text-sm text-textPrimary placeholder:text-textMuted focus:outline-none transition-all font-sans ${
                fieldErrors.fullName
                  ? "border-statusError focus:border-statusError"
                  : "border-white/10 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              }`}
              disabled={loading}
            />
            {fieldErrors.fullName && (
              <p className="text-[11px] text-statusError font-medium mt-0.5">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-textMuted block">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. marcus_v"
              className={`w-full px-4 py-2.5 rounded-xl bg-navy-850 border text-sm text-textPrimary placeholder:text-textMuted focus:outline-none transition-all font-sans ${
                fieldErrors.username
                  ? "border-statusError focus:border-statusError"
                  : "border-white/10 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              }`}
              autoComplete="username"
              disabled={loading}
            />
            {fieldErrors.username && (
              <p className="text-[11px] text-statusError font-medium mt-0.5">
                {fieldErrors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-textMuted block">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="marcus@fitai.vision"
              className={`w-full px-4 py-2.5 rounded-xl bg-navy-850 border text-sm text-textPrimary placeholder:text-textMuted focus:outline-none transition-all font-sans ${
                fieldErrors.email
                  ? "border-statusError focus:border-statusError"
                  : "border-white/10 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              }`}
              autoComplete="email"
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-statusError font-medium mt-0.5">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-textMuted block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className={`w-full px-4 py-2.5 pr-11 rounded-xl bg-navy-850 border text-sm text-textPrimary placeholder:text-textMuted focus:outline-none transition-all font-sans ${
                  fieldErrors.password
                    ? "border-statusError focus:border-statusError"
                    : "border-white/10 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                }`}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary p-1 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-statusError font-medium mt-0.5">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-textMuted block">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className={`w-full px-4 py-2.5 rounded-xl bg-navy-850 border text-sm text-textPrimary placeholder:text-textMuted focus:outline-none transition-all font-sans ${
                fieldErrors.confirmPassword
                  ? "border-statusError focus:border-statusError"
                  : "border-white/10 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              }`}
              autoComplete="new-password"
              disabled={loading}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-[11px] text-statusError font-medium mt-0.5">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            icon={UserPlus}
            loading={loading}
            disabled={loading}
            className="w-full font-bold shadow-orange-glow text-sm uppercase tracking-wide mt-4"
          >
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </Button>
        </form>

        {/* Footer switch to Login */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-textSecondary">
          <span>Already registered as an athlete? </span>
          <Link
            to="/login"
            className="font-bold text-brand-orange hover:text-brand-bright transition-colors ml-1 inline-block"
          >
            Log In
          </Link>
        </div>
      </div>

      {/* Security note footer */}
      <div className="mt-8 text-center flex items-center gap-1.5 text-xs text-textMuted/60 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-statusSuccess" />
        <span>SECURE BCRYPT ATHLETE CREDENTIAL HASHING</span>
      </div>
    </div>
  );
};

export default Signup;
