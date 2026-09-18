import React from "react";
import { Link } from "react-router-dom";
import { Play, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import Hero3DScene from "./Hero3DScene";

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-850 via-navy-800 to-navy-900 border border-white/5 shadow-card mb-8">
      {/* Subtle radial ambient orange glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-brand-orange/[0.03] rounded-full blur-2xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12 relative z-10">
        {/* Left Content Column */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          {/* Status Capsule */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="orange" dot pulse size="md">
              AI COMPUTER VISION 2.0
            </Badge>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-navy-750/80 border border-white/5 text-xs text-textSecondary font-medium">
              <span className="w-2 h-2 rounded-full bg-statusSuccess animate-pulse" />
              <span>AI SYSTEM READY</span>
            </div>
          </div>

          {/* Athletic Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-textPrimary uppercase leading-[1.1]">
              TRAIN SMARTER.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-brand-bright to-brand-soft">
                MOVE BETTER.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-textSecondary max-w-xl font-normal leading-relaxed pt-2">
              Your AI-powered fitness trainer for real-time exercise tracking,
              joint angle kinematics, and precision movement analysis.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/workout">
              <Button
                size="lg"
                icon={Play}
                className="shadow-orange-glow px-8 group text-base"
              >
                <span>START WORKOUT</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link to="/history">
              <Button variant="secondary" size="lg">
                View Past Sessions
              </Button>
            </Link>
          </div>

          {/* AI Metrics Micro-Pillars */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/5 max-w-lg">
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-textMuted uppercase tracking-wider">
                Precision
              </div>
              <div className="text-lg sm:text-xl font-bold text-textPrimary flex items-center gap-1">
                99.4%
              </div>
              <div className="text-[11px] text-textMuted">Joint accuracy</div>
            </div>

            <div className="space-y-1 border-l border-white/5 pl-3 sm:pl-4">
              <div className="text-[11px] font-mono text-textMuted uppercase tracking-wider">
                Latency
              </div>
              <div className="text-lg sm:text-xl font-bold text-brand-bright flex items-center gap-1">
                &lt; 33ms
              </div>
              <div className="text-[11px] text-textMuted">Real-time CV</div>
            </div>

            <div className="space-y-1 border-l border-white/5 pl-3 sm:pl-4">
              <div className="text-[11px] font-mono text-textMuted uppercase tracking-wider">
                Tracking
              </div>
              <div className="text-lg sm:text-xl font-bold text-statusSuccess flex items-center gap-1">
                30 FPS
              </div>
              <div className="text-[11px] text-textMuted">Full kinematics</div>
            </div>
          </div>
        </div>

        {/* Right 3D Human Pose Column */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <Hero3DScene />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
