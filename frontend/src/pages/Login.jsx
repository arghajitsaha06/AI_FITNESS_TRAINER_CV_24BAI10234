import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!usernameOrEmail.trim()) {
      setError("Please enter your username or email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login(usernameOrEmail, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid username/email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-textPrimary flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle ambient orange glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 relative z-10">
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

      {/* Login Card */}
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-navy-800 border border-white/5 shadow-elevated relative z-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-textPrimary uppercase tracking-tight">
            ATHLETE LOGIN
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-1">
            Sign in to access your AI motion analytics & training logs.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-statusError/15 border border-statusError/30 flex items-start gap-3 text-xs text-statusError">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email or Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-textMuted block">
              Username or Email
            </label>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="e.g. marcus or athlete@fitai.vision"
              className="w-full px-4 py-3 rounded-xl bg-navy-850 border border-white/10 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all font-sans"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-textMuted block">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-navy-850 border border-white/10 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all font-sans"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary p-1 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            icon={LogIn}
            loading={loading}
            disabled={loading}
            className="w-full font-bold shadow-orange-glow text-sm uppercase tracking-wide mt-2"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </Button>
        </form>

        {/* Footer switch to Signup */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-textSecondary">
          <span>Don't have an athlete account? </span>
          <Link
            to="/signup"
            className="font-bold text-brand-orange hover:text-brand-bright transition-colors ml-1 inline-block"
          >
            Register Here
          </Link>
        </div>
      </div>

      {/* Security note footer */}
      <div className="mt-8 text-center flex items-center gap-1.5 text-xs text-textMuted/60 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-statusSuccess" />
        <span>256-BIT ENCRYPTED ATHLETE AUTHENTICATION</span>
      </div>
    </div>
  );
};

export default Login;
