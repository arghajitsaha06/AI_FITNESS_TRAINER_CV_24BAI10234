import React, { useRef, useEffect, useState } from "react";
import { Camera, Eye, Cpu, Video, VideoOff, RefreshCw } from "lucide-react";
import { useWorkout } from "../../context/WorkoutContext";
import PoseVisualization from "./PoseVisualization";
import Badge from "../common/Badge";

export const VideoPanel = () => {
  const { currentExercise, useWebcam, setUseWebcam, liveStats, status, sendFrame } = useWorkout();
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  // Webcam stream management if user enables webcam mode
  useEffect(() => {
    let stream = null;

    if (useWebcam) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraError(null);
        })
        .catch((err) => {
          console.warn("Webcam access declined or unavailable:", err);
          setCameraError("Camera unavailable or permission denied. Showing AI Simulation.");
          setUseWebcam(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useWebcam, setUseWebcam]);

  // Video frame streaming loop to backend MediaPipe pipeline
  useEffect(() => {
    if (!useWebcam || status !== "running") return;

    let animationFrameId = null;
    let lastSendTime = 0;
    const FRAME_INTERVAL = 1000 / 25; // 25 FPS target

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const captureLoop = (timestamp) => {
      if (timestamp - lastSendTime >= FRAME_INTERVAL) {
        if (
          videoRef.current &&
          videoRef.current.readyState >= 2 &&
          videoRef.current.videoWidth > 0
        ) {
          ctx.drawImage(videoRef.current, 0, 0, 640, 480);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.65);
          if (sendFrame) {
            sendFrame(dataUrl);
          }
          lastSendTime = timestamp;
        }
      }
      animationFrameId = requestAnimationFrame(captureLoop);
    };

    animationFrameId = requestAnimationFrame(captureLoop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [useWebcam, status, sendFrame]);


  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-3xl bg-navy-950 border border-white/10 overflow-hidden shadow-elevated flex flex-col justify-between">
      {/* Background layer: Either Real Webcam Feed OR High-Tech Dark Simulated Training Lab */}
      <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
        {useWebcam ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100 brightness-90 contrast-105"
          />
        ) : (
          <div className="relative w-full h-full bg-gradient-to-b from-navy-900 via-navy-950 to-navy-900 flex items-center justify-center">
            {/* Subtle gym / performance lab background grid */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `radial-gradient(rgba(249, 115, 22, 0.25) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                backgroundSize: "32px 32px",
                backgroundPosition: "0 0, 16px 16px",
              }}
            />
            {/* Ambient center spotlight */}
            <div className="absolute w-[450px] h-[450px] bg-brand-orange/[0.04] rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {/* Realistic Skeletal / Joint Overlay */}
        <PoseVisualization />
      </div>

      {/* Top Status HUD Bar */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-navy-950/90 via-navy-950/40 to-transparent">
        {/* Left indicators */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* AI TRACKING ACTIVE */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900/90 border border-brand-orange/40 backdrop-blur-md text-xs font-semibold text-textPrimary shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            <span className="text-textMuted uppercase text-[10px] tracking-wider">AI TRACKING</span>
            <span className="text-brand-bright font-mono text-[11px]">ACTIVE</span>
          </div>

          {/* Pose Detection */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900/80 border border-white/10 backdrop-blur-md text-xs font-semibold text-textSecondary">
            <span
              className={`w-2 h-2 rounded-full ${
                liveStats?.aiMonitoring?.poseDetection === "DETECTED"
                  ? "bg-statusSuccess"
                  : "bg-brand-orange animate-pulse"
              }`}
            />
            <span className="text-textMuted uppercase text-[10px] tracking-wider">Pose Detection</span>
            <span
              className={`font-mono text-[11px] ${
                liveStats?.aiMonitoring?.poseDetection === "DETECTED"
                  ? "text-statusSuccess"
                  : "text-brand-orange"
              }`}
            >
              {liveStats?.aiMonitoring?.poseDetection || "DETECTED"}
            </span>
          </div>

          {/* Camera: LIVE FEED / CONNECTED */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900/80 border border-white/10 backdrop-blur-md text-xs font-semibold text-textSecondary">
            <span className="w-2 h-2 rounded-full bg-statusSuccess" />
            <span className="text-textMuted uppercase text-[10px] tracking-wider">Camera</span>
            <span className="text-textPrimary font-mono text-[11px]">
              {useWebcam ? "LIVE FEED" : "CONNECTED"}
            </span>
          </div>
        </div>

        {/* Right controls: Webcam / Mock Simulator Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseWebcam(!useWebcam)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900/80 hover:bg-navy-800 border border-white/10 text-xs font-medium text-textSecondary hover:text-textPrimary backdrop-blur-md transition-all focus:outline-none"
            title="Toggle between Real Webcam and High-Tech AI Simulation"
          >
            {useWebcam ? (
              <>
                <VideoOff className="w-3.5 h-3.5 text-brand-orange" />
                <span className="hidden sm:inline">Use Simulation</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-textSecondary" />
                <span className="hidden sm:inline">Enable Webcam</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom HUD Bar: Active Joint Focus and Exercise Type */}
      <div className="relative z-10 p-4 sm:p-5 flex items-end justify-between bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent">
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-widest text-brand-soft uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            KINEMATIC STREAM • {currentExercise.displayName}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-textSecondary flex items-center gap-2">
            <span>Primary Focus:</span>
            <span className="text-textPrimary font-bold font-mono">
              {currentExercise.primaryJoint} ({currentExercise.targetAngleRange})
            </span>
          </div>
        </div>

        {/* Dynamic Mode Watermark */}
        <div className="text-right">
          <span className="text-[10px] font-mono text-textMuted/70 uppercase tracking-widest bg-navy-900/60 px-2 py-0.5 rounded border border-white/5">
            {useWebcam ? "REAL-TIME AI VISION • MEDIAPIPE" : "AI MOTION SIMULATION MODE"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoPanel;
