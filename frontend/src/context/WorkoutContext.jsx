import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { mockExercises, defaultLiveWorkoutState } from "../data/mockData";

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState("bicep_curl");
  const [status, setStatus] = useState("ready"); // "ready" | "running" | "paused" | "completed"
  const [useWebcam, setUseWebcam] = useState(false);

  // Live real-time stats (initialized to match specification: 18 reps, 1 invalid, 164.7°, EXTENDED, 30 FPS, GOOD)
  const [liveStats, setLiveStats] = useState({
    reps: 18,
    validReps: 17,
    invalidReps: 1,
    angle: 164.7,
    state: "EXTENDED",
    fps: 30.0,
    form: "GOOD",
    accuracyPct: 94,
    feedbackMessage: "Good form. Keep your elbow stable.",
    landmarks: null,
    aiMonitoring: {
      poseDetection: "DETECTED",
      movementTracking: "TRACKING",
      cameraConnection: "CONNECTED",
      aiEngine: "READY",
    },
  });

  // Workout duration timer in seconds
  const [durationSeconds, setDurationSeconds] = useState(134); // starts at 02:14 for demo mode
  const [lastCompletedSession, setLastCompletedSession] = useState({
    exerciseId: "bicep_curl",
    exercise: "Bicep Curl",
    reps: 18,
    validReps: 17,
    invalidReps: 1,
    formAccuracyPct: 94,
    durationSeconds: 134,
    durationFormatted: "02:14",
    avgFps: 29.8,
  });

  // Current selected exercise object
  const currentExercise =
    mockExercises.find((ex) => ex.id === selectedExerciseId) || mockExercises[0];

  // WebSocket reference & frame throttle flag
  const wsRef = useRef(null);
  const isAwaitingResponseRef = useRef(false);

  // When webcam mode is toggled, initialize stats appropriately
  useEffect(() => {
    if (useWebcam) {
      setDurationSeconds(0);
      setLiveStats({
        reps: 0,
        validReps: 0,
        invalidReps: 0,
        angle: 0.0,
        state: "READY",
        fps: 30.0,
        form: "GOOD",
        accuracyPct: 100,
        feedbackMessage: "Stand in camera frame to begin pose detection.",
        landmarks: null,
        aiMonitoring: {
          poseDetection: "SEARCHING",
          movementTracking: "IDLE",
          cameraConnection: "CONNECTED",
          aiEngine: "INITIALIZING",
        },
      });
    } else {
      // Restore simulation defaults if user returns to simulation mode
      setDurationSeconds(134);
      setLiveStats({
        reps: 18,
        validReps: 17,
        invalidReps: 1,
        angle: 164.7,
        state: "EXTENDED",
        fps: 30.0,
        form: "GOOD",
        accuracyPct: 94,
        feedbackMessage: "Good form. Keep your elbow stable.",
        landmarks: null,
        aiMonitoring: {
          poseDetection: "DETECTED",
          movementTracking: "TRACKING",
          cameraConnection: "CONNECTED",
          aiEngine: "READY",
        },
      });
    }
  }, [useWebcam]);

  // Manage WebSocket connection for real-time AI streaming when webcam is active
  useEffect(() => {
    if (!useWebcam) {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
      return;
    }

    const host = window.location.hostname || "127.0.0.1";
    const wsUrl = `ws://${host}:8000/ws/workout?exercise=${selectedExerciseId}`;
    let socket = null;

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        isAwaitingResponseRef.current = false;
        setLiveStats((prev) => ({
          ...prev,
          aiMonitoring: {
            ...prev.aiMonitoring,
            cameraConnection: "CONNECTED",
            aiEngine: "ACTIVE",
          },
        }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          isAwaitingResponseRef.current = false;

          if (data.type === "telemetry") {
            setLiveStats((prev) => ({
              ...prev,
              reps: data.reps,
              validReps: data.valid_reps,
              invalidReps: data.invalid_reps,
              accuracyPct: data.accuracy_pct,
              angle: data.angle,
              state: data.state,
              fps: data.fps > 0 ? data.fps : prev.fps,
              form: data.form_valid ? "GOOD" : "NEEDS ADJUSTMENT",
              feedbackMessage: data.feedback,
              landmarks: data.landmarks,
              aiMonitoring: {
                poseDetection: data.pose_detected ? "DETECTED" : "SEARCHING",
                movementTracking: data.pose_detected ? "TRACKING" : "IDLE",
                cameraConnection: "CONNECTED",
                aiEngine: "ACTIVE",
              },
            }));
          }
        } catch (err) {
          isAwaitingResponseRef.current = false;
        }
      };

      socket.onerror = () => {
        isAwaitingResponseRef.current = false;
      };

      socket.onclose = () => {
        isAwaitingResponseRef.current = false;
      };
    } catch (err) {
      console.warn("Could not connect to AI WebSocket:", err);
    }

    return () => {
      if (socket) {
        try {
          socket.close();
        } catch {}
      }
      wsRef.current = null;
    };
  }, [useWebcam, selectedExerciseId]);

  // Send video frame to backend MediaPipe pipeline
  const sendFrame = (imageDataUrl) => {
    if (
      useWebcam &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      !isAwaitingResponseRef.current
    ) {
      isAwaitingResponseRef.current = true;
      wsRef.current.send(
        JSON.stringify({
          type: "frame",
          image: imageDataUrl,
        })
      );
    }
  };

  // Timer interval
  useEffect(() => {
    let timerInterval = null;
    if (status === "running") {
      timerInterval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [status]);


  // Exercise angle and rep simulation loop (active ONLY when webcam is not in use)
  const cycleRef = useRef({ progress: 0, direction: 1 });
  useEffect(() => {
    if (status !== "running" || useWebcam) return;

    const feedbackOptions = [
      "Good form. Keep your elbow stable.",
      "Maintain controlled movement.",
      "Great repetition! Full range of motion.",
      "Keep your back straight and core engaged.",
      "Smooth tempo on the eccentric phase.",
      "Elbow alignment is within optimal parameters.",
    ];

    const interval = setInterval(() => {
      // Simulate joint kinematics based on exercise type
      cycleRef.current.progress += 0.05 * cycleRef.current.direction;

      if (cycleRef.current.progress >= 1) {
        cycleRef.current.progress = 1;
        cycleRef.current.direction = -1;
      } else if (cycleRef.current.progress <= 0) {
        cycleRef.current.progress = 0;
        cycleRef.current.direction = 1;
        // Completed a rep cycle!
        setLiveStats((prev) => {
          const newTotalReps = prev.reps + 1;
          const isInvalid = Math.random() < 0.08; // small chance of invalid rep
          const newInvalid = isInvalid ? prev.invalidReps + 1 : prev.invalidReps;
          const newValid = newTotalReps - newInvalid;
          const accuracy = Math.round((newValid / newTotalReps) * 100);

          const randomFeedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];

          return {
            ...prev,
            reps: newTotalReps,
            validReps: newValid,
            invalidReps: newInvalid,
            accuracyPct: accuracy,
            form: accuracy >= 90 ? "GOOD" : "ACCEPTABLE",
            feedbackMessage: randomFeedback,
          };
        });
      }

      // Compute angle
      const p = cycleRef.current.progress;
      let angleVal = 0;
      let stateVal = "EXTENDED";

      if (selectedExerciseId === "bicep_curl") {
        // Flexion: 35 to 165
        angleVal = 165 - p * 128 + (Math.sin(Date.now() / 200) * 1.5);
        stateVal = angleVal < 90 ? "CONTRACTED" : "EXTENDED";
      } else if (selectedExerciseId === "squat") {
        // Squat: 80 to 170
        angleVal = 170 - p * 85 + (Math.sin(Date.now() / 200) * 1.2);
        stateVal = angleVal < 115 ? "IN DEPTH" : "STANDING";
      } else {
        // Push-up: 75 to 165
        angleVal = 165 - p * 85 + (Math.sin(Date.now() / 200) * 1.4);
        stateVal = angleVal < 110 ? "DOWN" : "UP";
      }

      // Small jitter for realistic 30 FPS telemetry
      const simulatedFps = 29.7 + Math.random() * 0.6;

      setLiveStats((prev) => ({
        ...prev,
        angle: Number(angleVal.toFixed(1)),
        state: stateVal,
        fps: Number(simulatedFps.toFixed(1)),
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [status, selectedExerciseId, useWebcam]);

  // Format seconds to mm:ss
  const formatDuration = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Workout controls
  const startWorkout = () => {
    setStatus("running");
  };

  const pauseWorkout = () => {
    setStatus("paused");
  };

  const resumeWorkout = () => {
    setStatus("running");
  };

  const stopWorkout = () => {
    setStatus("completed");
    const summary = {
      exerciseId: currentExercise.id,
      exercise: currentExercise.displayName,
      reps: liveStats.reps,
      validReps: liveStats.validReps,
      invalidReps: liveStats.invalidReps,
      formAccuracyPct: liveStats.accuracyPct,
      durationSeconds: durationSeconds,
      durationFormatted: formatDuration(durationSeconds),
      avgFps: liveStats.fps || 29.8,
    };
    setLastCompletedSession(summary);
    return summary;
  };

  const resetWorkout = (exerciseId = "bicep_curl") => {
    setSelectedExerciseId(exerciseId);
    setStatus("ready");
    if (useWebcam) {
      setDurationSeconds(0);
      setLiveStats({
        reps: 0,
        validReps: 0,
        invalidReps: 0,
        angle: 0.0,
        state: "READY",
        fps: 30.0,
        form: "GOOD",
        accuracyPct: 100,
        feedbackMessage: "Stand in camera frame to begin pose detection.",
        landmarks: null,
        aiMonitoring: {
          poseDetection: "SEARCHING",
          movementTracking: "IDLE",
          cameraConnection: "CONNECTED",
          aiEngine: "ACTIVE",
        },
      });
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: "reset" }));
        } catch {}
      }
    } else {
      setDurationSeconds(134); // Reset to demo 02:14
      setLiveStats({
        reps: 18,
        validReps: 17,
        invalidReps: 1,
        angle: 164.7,
        state: "EXTENDED",
        fps: 30.0,
        form: "GOOD",
        accuracyPct: 94,
        feedbackMessage: "Good form. Keep your elbow stable.",
        landmarks: null,
        aiMonitoring: {
          poseDetection: "DETECTED",
          movementTracking: "TRACKING",
          cameraConnection: "CONNECTED",
          aiEngine: "READY",
        },
      });
    }
  };

  const selectExercise = (exerciseId) => {
    setSelectedExerciseId(exerciseId);
    if (useWebcam && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            type: "switch_exercise",
            exercise: exerciseId,
          })
        );
      } catch {}
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        selectedExerciseId,
        currentExercise,
        status,
        useWebcam,
        setUseWebcam,
        liveStats,
        durationSeconds,
        durationFormatted: formatDuration(durationSeconds),
        lastCompletedSession,
        sendFrame,
        startWorkout,
        pauseWorkout,
        resumeWorkout,
        stopWorkout,
        resetWorkout,
        selectExercise,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};


export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
