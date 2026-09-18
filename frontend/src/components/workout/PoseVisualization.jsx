import React from "react";
import { useWorkout } from "../../context/WorkoutContext";

export const PoseVisualization = () => {
  const { currentExercise, liveStats, status, useWebcam } = useWorkout();
  const angle = liveStats?.angle ?? 164.7;

  // Normalized 0..1 factor derived from angle for smooth geometric kinematics fallback
  let normalizedFactor = 0.5;
  if (currentExercise.id === "bicep_curl") {
    // 35° (max curled: factor 1) to 165° (extended: factor 0)
    normalizedFactor = Math.max(0, Math.min(1, (165 - angle) / 130));
  } else if (currentExercise.id === "squat") {
    // 80° (depth: factor 1) to 170° (standing: factor 0)
    normalizedFactor = Math.max(0, Math.min(1, (170 - angle) / 90));
  } else {
    // push_up: 75° (down: factor 1) to 165° (plank up: factor 0)
    normalizedFactor = Math.max(0, Math.min(1, (165 - angle) / 90));
  }

  // Real landmarks mapped from MediaPipe pose pipeline
  const realJoints = () => {
    const lm = liveStats.landmarks;
    const pt = (idx) => {
      const p = lm[idx];
      if (!p) return null;
      return {
        x: (1.0 - p.x) * 600,
        y: p.y * 600,
      };
    };

    const leftShoulder = pt(11);
    const rightShoulder = pt(12);
    const leftElbow = pt(13);
    const rightElbow = pt(14);
    const leftWrist = pt(15);
    const rightWrist = pt(16);
    const leftHip = pt(23);
    const rightHip = pt(24);
    const leftKnee = pt(25);
    const rightKnee = pt(26);
    const leftAnkle = pt(27);
    const rightAnkle = pt(28);
    const nose = pt(0);

    const hipCenter =
      leftHip && rightHip
        ? { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
        : leftHip || rightHip || { x: 300, y: 360 };

    const head =
      nose ||
      (leftShoulder && rightShoulder
        ? {
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2 - 40,
          }
        : { x: 300, y: 100 });

    return {
      head,
      leftShoulder: leftShoulder || { x: 260, y: 170 },
      rightShoulder: rightShoulder || { x: 340, y: 170 },
      leftElbow: leftElbow || { x: 250, y: 280 },
      rightElbow: rightElbow || { x: 350, y: 280 },
      leftWrist: leftWrist || { x: 245, y: 390 },
      rightWrist: rightWrist || { x: 355, y: 390 },
      hipCenter,
      leftHip: leftHip || { x: 270, y: 360 },
      rightHip: rightHip || { x: 330, y: 360 },
      leftKnee: leftKnee || { x: 270, y: 460 },
      rightKnee: rightKnee || { x: 330, y: 460 },
      leftAnkle: leftAnkle || { x: 270, y: 550 },
      rightAnkle: rightAnkle || { x: 330, y: 550 },
    };
  };

  // Kinematic calculations for Bicep Curl
  const bicepJoints = () => {
    const shoulder = { x: 300, y: 170 };
    const elbow = { x: 305, y: 280 };
    // Wrist moves along arc from extended (310, 395) to curled (290, 180)
    const wristX = 310 - normalizedFactor * 25;
    const wristY = 395 - normalizedFactor * 215;

    return {
      head: { x: 300, y: 100 },
      leftShoulder: { x: 260, y: 170 },
      rightShoulder: shoulder,
      leftElbow: { x: 255, y: 280 },
      rightElbow: elbow,
      leftWrist: { x: 250, y: 390 },
      rightWrist: { x: wristX, y: wristY },
      hipCenter: { x: 285, y: 360 },
      leftHip: { x: 265, y: 360 },
      rightHip: { x: 305, y: 360 },
      leftKnee: { x: 265, y: 460 },
      rightKnee: { x: 305, y: 460 },
      leftAnkle: { x: 265, y: 550 },
      rightAnkle: { x: 305, y: 550 },
    };
  };

  // Kinematic calculations for Squat
  const squatJoints = () => {
    const drop = normalizedFactor * 90; // vertical drop during squat
    const kneeSpread = normalizedFactor * 25;

    return {
      head: { x: 300, y: 100 + drop * 0.7 },
      leftShoulder: { x: 250, y: 160 + drop * 0.75 },
      rightShoulder: { x: 350, y: 160 + drop * 0.75 },
      leftElbow: { x: 225, y: 220 + drop * 0.75 },
      rightElbow: { x: 375, y: 220 + drop * 0.75 },
      leftWrist: { x: 265, y: 210 + drop * 0.75 },
      rightWrist: { x: 335, y: 210 + drop * 0.75 },
      hipCenter: { x: 300, y: 310 + drop },
      leftHip: { x: 260, y: 310 + drop },
      rightHip: { x: 340, y: 310 + drop },
      leftKnee: { x: 240 - kneeSpread, y: 430 + drop * 0.35 },
      rightKnee: { x: 360 + kneeSpread, y: 430 + drop * 0.35 },
      leftAnkle: { x: 245, y: 550 },
      rightAnkle: { x: 355, y: 550 },
    };
  };

  // Kinematic calculations for Push-Up
  const pushUpJoints = () => {
    const drop = normalizedFactor * 65;

    return {
      head: { x: 170, y: 270 + drop },
      leftShoulder: { x: 210, y: 290 + drop },
      rightShoulder: { x: 210, y: 290 + drop },
      leftElbow: { x: 200 - normalizedFactor * 20, y: 360 + drop * 0.5 },
      rightElbow: { x: 200 - normalizedFactor * 20, y: 360 + drop * 0.5 },
      leftWrist: { x: 210, y: 440 },
      rightWrist: { x: 210, y: 440 },
      hipCenter: { x: 360, y: 310 + drop },
      leftHip: { x: 360, y: 310 + drop },
      rightHip: { x: 360, y: 310 + drop },
      leftKnee: { x: 450, y: 350 + drop * 0.6 },
      rightKnee: { x: 450, y: 350 + drop * 0.6 },
      leftAnkle: { x: 530, y: 410 },
      rightAnkle: { x: 530, y: 410 },
    };
  };

  const joints =
    useWebcam && liveStats?.landmarks && liveStats.landmarks.length >= 17
      ? realJoints()
      : currentExercise.id === "squat"
      ? squatJoints()
      : currentExercise.id === "push_up"
      ? pushUpJoints()
      : bicepJoints();


  return (
    <svg
      viewBox="0 0 600 600"
      className="w-full h-full absolute inset-0 pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Glow filter for joints and laser lines */}
        <filter id="jointGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FB923C" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Target Computer Vision Bounding Box with Corner Crosshairs */}
      <g opacity="0.35">
        <rect
          x="120"
          y="40"
          width="360"
          height="530"
          fill="none"
          stroke="#F97316"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Top-left crosshair */}
        <path d="M 110,60 L 110,40 L 130,40" fill="none" stroke="#F97316" strokeWidth="2.5" />
        {/* Top-right crosshair */}
        <path d="M 470,40 L 490,40 L 490,60" fill="none" stroke="#F97316" strokeWidth="2.5" />
        {/* Bottom-left crosshair */}
        <path d="M 110,550 L 110,570 L 130,570" fill="none" stroke="#F97316" strokeWidth="2.5" />
        {/* Bottom-right crosshair */}
        <path d="M 470,570 L 490,570 L 490,550" fill="none" stroke="#F97316" strokeWidth="2.5" />
      </g>

      {/* Dynamic Skeletal Connecting Lines */}
      <g stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round">
        {/* Spine / Torso */}
        <line x1={joints.head.x} y1={joints.head.y + 20} x2={joints.hipCenter.x} y2={joints.hipCenter.y} />
        {/* Shoulder girdle */}
        <line x1={joints.leftShoulder.x} y1={joints.leftShoulder.y} x2={joints.rightShoulder.x} y2={joints.rightShoulder.y} />
        {/* Left Arm */}
        <line x1={joints.leftShoulder.x} y1={joints.leftShoulder.y} x2={joints.leftElbow.x} y2={joints.leftElbow.y} />
        <line x1={joints.leftElbow.x} y1={joints.leftElbow.y} x2={joints.leftWrist.x} y2={joints.leftWrist.y} />
        {/* Right Arm (Tracked joint in Bicep Curl) */}
        <line
          x1={joints.rightShoulder.x}
          y1={joints.rightShoulder.y}
          x2={joints.rightElbow.x}
          y2={joints.rightElbow.y}
          stroke={currentExercise.id === "bicep_curl" ? "#F97316" : "#FB923C"}
          strokeWidth={currentExercise.id === "bicep_curl" ? "4.5" : "3"}
        />
        <line
          x1={joints.rightElbow.x}
          y1={joints.rightElbow.y}
          x2={joints.rightWrist.x}
          y2={joints.rightWrist.y}
          stroke={currentExercise.id === "bicep_curl" ? "#FB923C" : "#F97316"}
          strokeWidth={currentExercise.id === "bicep_curl" ? "4.5" : "3"}
        />
        {/* Pelvis girdle */}
        <line x1={joints.leftHip.x} y1={joints.leftHip.y} x2={joints.rightHip.x} y2={joints.rightHip.y} />
        {/* Left Leg */}
        <line x1={joints.leftHip.x} y1={joints.leftHip.y} x2={joints.leftKnee.x} y2={joints.leftKnee.y} />
        <line x1={joints.leftKnee.x} y1={joints.leftKnee.y} x2={joints.leftAnkle.x} y2={joints.leftAnkle.y} />
        {/* Right Leg (Tracked joint in Squat) */}
        <line
          x1={joints.rightHip.x}
          y1={joints.rightHip.y}
          x2={joints.rightKnee.x}
          y2={joints.rightKnee.y}
          stroke={currentExercise.id === "squat" ? "#F97316" : "#FB923C"}
          strokeWidth={currentExercise.id === "squat" ? "4.5" : "3"}
        />
        <line
          x1={joints.rightKnee.x}
          y1={joints.rightKnee.y}
          x2={joints.rightAnkle.x}
          y2={joints.rightAnkle.y}
          stroke={currentExercise.id === "squat" ? "#FB923C" : "#F97316"}
          strokeWidth={currentExercise.id === "squat" ? "4.5" : "3"}
        />
      </g>

      {/* Head Landmark */}
      <circle
        cx={joints.head.x}
        cy={joints.head.y}
        r="24"
        fill="#172033"
        stroke="#F97316"
        strokeWidth="2.5"
      />

      {/* Tracking Joint Landmarks (MediaPipe Keypoints) */}
      {Object.entries(joints).map(([name, pt]) => {
        const isHighlightJoint =
          (currentExercise.id === "bicep_curl" && (name === "rightElbow" || name === "rightWrist")) ||
          (currentExercise.id === "squat" && (name === "rightKnee" || name === "rightHip")) ||
          (currentExercise.id === "push_up" && (name === "rightElbow" || name === "rightShoulder"));

        return (
          <g key={name} transform={`translate(${pt.x}, ${pt.y})`}>
            {/* Outer sensor circle */}
            <circle
              r={isHighlightJoint ? 9 : 6}
              fill={isHighlightJoint ? "#F97316" : "#1F2937"}
              stroke={isHighlightJoint ? "#FFF" : "#FB923C"}
              strokeWidth="2"
              filter={isHighlightJoint ? "url(#jointGlow)" : undefined}
            />
            {/* Inner core node */}
            <circle r={isHighlightJoint ? 4 : 2.5} fill={isHighlightJoint ? "#FFF" : "#F97316"} />
          </g>
        );
      })}

      {/* Kinematics Telemetry Callout Box on Active Joint */}
      <g
        transform={`translate(${
          currentExercise.id === "bicep_curl"
            ? `${Math.max(10, Math.min(480, (joints.rightElbow?.x ?? 300) + 18))}, ${Math.max(10, Math.min(540, (joints.rightElbow?.y ?? 280) - 30))}`
            : currentExercise.id === "squat"
            ? `${Math.max(10, Math.min(480, (joints.rightKnee?.x ?? 300) + 20))}, ${Math.max(10, Math.min(540, (joints.rightKnee?.y ?? 430) - 20))}`
            : `${Math.max(10, Math.min(480, (joints.rightElbow?.x ?? 300) + 20))}, ${Math.max(10, Math.min(540, (joints.rightElbow?.y ?? 360) - 25))}`
        })`}
      >
        <rect
          width="110"
          height="52"
          rx="8"
          fill="#111827"
          fillOpacity="0.9"
          stroke="#F97316"
          strokeWidth="1.5"
        />
        <text x="12" y="20" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="bold">
          ANGLE θ
        </text>
        <text x="12" y="42" fill="#F8FAFC" fontSize="18" fontFamily="monospace" fontWeight="800">
          {angle.toFixed(1)}°
        </text>
        {/* Live status dot */}
        <circle cx="95" cy="18" r="4" fill="#22C55E" />
      </g>
    </svg>
  );
};

export default PoseVisualization;
