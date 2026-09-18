import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, Sparkles, ChevronRight, CheckCircle2, Flame } from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { useWorkout } from "../../context/WorkoutContext";

// Exercise-specific athletic biomechanic silhouettes with joint tracking dots
const ExerciseGraphic = ({ type }) => {
  if (type === "arm") {
    // Bicep Curl Kinematics Graphic
    return (
      <svg
        viewBox="0 0 200 130"
        className="w-full h-36 text-brand-orange drop-shadow-sm select-none"
        fill="none"
      >
        <rect width="200" height="130" rx="12" fill="#172033" opacity="0.6" />
        {/* Subtle grid background */}
        <line x1="20" y1="65" x2="180" y2="65" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
        <line x1="100" y1="20" x2="100" y2="110" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
        
        {/* Shoulder to Elbow */}
        <line x1="60" y1="40" x2="90" y2="85" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
        {/* Forearm (curled up towards shoulder) */}
        <line x1="90" y1="85" x2="140" y2="45" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
        {/* Dumbbell */}
        <line x1="130" y1="35" x2="150" y2="55" stroke="#FDBA74" strokeWidth="8" strokeLinecap="round" />

        {/* Angle arc */}
        <path
          d="M 80,70 A 25 25 0 0 1 115,65"
          fill="none"
          stroke="#FB923C"
          strokeWidth="1.8"
          strokeDasharray="2 2"
        />
        <text x="96" y="60" fill="#FB923C" fontSize="10" fontFamily="monospace" fontWeight="bold">
          45.2°
        </text>

        {/* Joints */}
        <circle cx="60" cy="40" r="4.5" fill="#F8FAFC" stroke="#111827" strokeWidth="2" />
        <circle cx="90" cy="85" r="5.5" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="140" cy="45" r="4.5" fill="#FB923C" stroke="#111827" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "squat") {
    // Squat Depth Kinematics Graphic
    return (
      <svg
        viewBox="0 0 200 130"
        className="w-full h-36 text-brand-orange drop-shadow-sm select-none"
        fill="none"
      >
        <rect width="200" height="130" rx="12" fill="#172033" opacity="0.6" />
        <line x1="20" y1="110" x2="180" y2="110" stroke="rgba(255,255,255,0.1)" />

        {/* Torso */}
        <line x1="95" y1="35" x2="80" y2="75" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
        {/* Thigh (parallel to ground) */}
        <line x1="80" y1="75" x2="125" y2="76" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
        {/* Shin to Foot */}
        <line x1="125" y1="76" x2="120" y2="110" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />

        {/* Knee angle arc */}
        <path
          d="M 100,75 A 25 25 0 0 0 122,95"
          fill="none"
          stroke="#FB923C"
          strokeWidth="1.8"
          strokeDasharray="2 2"
        />
        <text x="130" y="85" fill="#FB923C" fontSize="10" fontFamily="monospace" fontWeight="bold">
          88.4°
        </text>

        {/* Depth target line */}
        <line x1="50" y1="76" x2="150" y2="76" stroke="#22C55E" strokeWidth="1" strokeDasharray="3 2" />
        <text x="50" y="70" fill="#22C55E" fontSize="9" fontFamily="monospace">
          PARALLEL DEPTH
        </text>

        {/* Joint landmarks */}
        <circle cx="95" cy="35" r="4.5" fill="#F8FAFC" stroke="#111827" strokeWidth="2" />
        <circle cx="80" cy="75" r="5.5" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="125" cy="76" r="5.5" fill="#FB923C" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="120" cy="110" r="4.5" fill="#F8FAFC" stroke="#111827" strokeWidth="2" />
      </svg>
    );
  }

  // Push-up Plank Kinematics Graphic
  return (
    <svg
      viewBox="0 0 200 130"
      className="w-full h-36 text-brand-orange drop-shadow-sm select-none"
      fill="none"
    >
      <rect width="200" height="130" rx="12" fill="#172033" opacity="0.6" />
      {/* Floor */}
      <line x1="20" y1="105" x2="180" y2="105" stroke="rgba(255,255,255,0.1)" />

      {/* Head */}
      <circle cx="55" cy="55" r="7" fill="#172033" stroke="#CBD5E1" strokeWidth="2" />
      {/* Plank Body Line */}
      <line x1="62" y1="58" x2="160" y2="98" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
      {/* Arm flexed at 90 deg */}
      <line x1="75" y1="63" x2="65" y2="82" stroke="#CBD5E1" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="65" y1="82" x2="75" y2="105" stroke="#FB923C" strokeWidth="4.5" strokeLinecap="round" />

      {/* Elbow angle */}
      <text x="80" y="85" fill="#FB923C" fontSize="10" fontFamily="monospace" fontWeight="bold">
        91.0°
      </text>

      {/* Core line validation indicator */}
      <line x1="62" y1="55" x2="160" y2="95" stroke="#22C55E" strokeWidth="1" strokeDasharray="3 3" />

      {/* Joint landmarks */}
      <circle cx="75" cy="63" r="4.5" fill="#F8FAFC" stroke="#111827" strokeWidth="2" />
      <circle cx="65" cy="82" r="5" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="75" cy="105" r="4.5" fill="#CBD5E1" stroke="#111827" strokeWidth="2" />
      <circle cx="160" cy="98" r="4.5" fill="#F8FAFC" stroke="#111827" strokeWidth="2" />
    </svg>
  );
};

export const ExerciseCard = ({ exercise }) => {
  const navigate = useNavigate();
  const { selectExercise, resetWorkout } = useWorkout();

  const handleStart = () => {
    selectExercise(exercise.id);
    resetWorkout(exercise.id);
    navigate("/workout/live");
  };

  return (
    <div className="group relative rounded-3xl bg-navy-800 border border-white/5 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:border-brand-orange/40 hover:shadow-orange-glow">
      {/* Top badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge
            variant={
              exercise.difficulty === "Beginner"
                ? "success"
                : exercise.difficulty === "Intermediate"
                ? "warning"
                : "orange"
            }
            size="sm"
          >
            {exercise.difficulty}
          </Badge>

          <span className="flex items-center gap-1 text-[11px] font-mono text-brand-bright">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
            <span>AI Tracked</span>
          </span>
        </div>

        {/* Graphic preview */}
        <div className="mb-5 rounded-2xl overflow-hidden border border-white/5 group-hover:border-brand-orange/20 transition-colors">
          <ExerciseGraphic type={exercise.previewType} />
        </div>

        {/* Title & Target Muscle */}
        <div className="mb-3">
          <h3 className="text-xl font-extrabold text-textPrimary uppercase tracking-tight group-hover:text-brand-bright transition-colors">
            {exercise.displayName}
          </h3>
          <p className="text-sm font-medium text-brand-soft mt-0.5">
            Target: {exercise.targetMuscle}
          </p>
        </div>

        {/* Description & Kinematics info */}
        <p className="text-xs text-textSecondary leading-relaxed mb-4 line-clamp-2">
          {exercise.description}
        </p>

        {/* Metric pills */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-xl bg-navy-850/70 border border-white/5 text-xs font-mono">
          <div>
            <span className="text-[10px] text-textMuted uppercase block">Primary Joint</span>
            <span className="text-textPrimary font-semibold">{exercise.primaryJoint}</span>
          </div>
          <div>
            <span className="text-[10px] text-textMuted uppercase block">Target Range</span>
            <span className="text-brand-bright font-semibold">{exercise.targetAngleRange}</span>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <Button
        onClick={handleStart}
        size="md"
        icon={Play}
        className="w-full font-bold shadow-orange-sm group-hover:shadow-orange-glow transition-all"
      >
        START
      </Button>
    </div>
  );
};

export default ExerciseCard;
