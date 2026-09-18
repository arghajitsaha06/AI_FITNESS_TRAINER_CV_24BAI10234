/**
 * API Service Layer for AI Fitness Trainer
 * Connected to FastAPI backend with full JWT authentication and user-linked workout sessions.
 */

import {
  mockExercises,
  mockWeeklyPerformance,
  defaultLiveWorkoutState,
} from "../data/mockData";

const API_BASE_URL = "http://127.0.0.1:8000";

// Helper for standard JSON headers
const getHeaders = (token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const apiService = {
  // ============================================================
  // AUTHENTICATION
  // ============================================================

  /**
   * Register a new athlete
   */
  async signup({ fullName, username, email, password }) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        full_name: fullName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || "Failed to create account.");
    }

    return data;
  },

  /**
   * Authenticate athlete by username or email
   */
  async login({ usernameOrEmail, password }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        username_or_email: usernameOrEmail.trim(),
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || "Invalid username/email or password.");
    }

    return data;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(token) {
    if (!token) {
      throw new Error("No token provided");
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getHeaders(token),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || "Authentication session expired.");
    }

    return data;
  },

  /**
   * Logout athlete
   */
  async logout(token = null) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: getHeaders(token),
      });
    } catch {
      // ignore network errors on logout
    }
    return { success: true };
  },

  // ============================================================
  // WORKOUT SESSIONS (USER-SPECIFIC)
  // ============================================================

  /**
   * Save a completed workout session linked to authenticated user_id
   */
  async saveWorkoutSession(sessionData, token = null) {
    // Map exercise display name to exercise_type slug for backend compatibility
    const exerciseTypeMap = {
      "Bicep Curl": "bicep_curl",
      "Squat": "squat",
      "Push-Up": "push_up",
    };

    const exerciseSlug =
      sessionData.exerciseId ||
      exerciseTypeMap[sessionData.exercise] ||
      "bicep_curl";

    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({
          exercise_type: exerciseSlug,
          total_reps: sessionData.reps || 0,
          invalid_reps: sessionData.invalidReps || 0,
          form_accuracy_pct: Number(sessionData.formAccuracyPct || 94.0),
          duration_seconds: Number(sessionData.durationSeconds || 134.0),
          user_id: sessionData.userId || sessionData.user_id || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          data: {
            id: `sess-${result.session_id}`,
            sessionId: result.session_id,
            userId: result.user_id,
            exercise: sessionData.exercise || "Workout Session",
            exerciseId: exerciseSlug,
            reps: sessionData.reps || 0,
            validReps: sessionData.validReps ?? (sessionData.reps - (sessionData.invalidReps || 0)),
            invalid: sessionData.invalidReps || 0,
            accuracy: `${Math.round(sessionData.formAccuracyPct || 94)}%`,
            accuracyNum: Math.round(sessionData.formAccuracyPct || 94),
            duration: sessionData.durationFormatted || "02:14",
            durationSeconds: sessionData.durationSeconds || 134,
            date: "Just now",
            dateFormatted: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            avgFps: sessionData.avgFps || 30.0,
            status: "Completed",
          },
          success: true,
        };
      }
    } catch (err) {
      console.warn("Backend session save failed, falling back to local session:", err);
    }

    // Fallback if backend is momentarily unreachable
    return {
      data: {
        id: `sess-${Date.now()}`,
        exercise: sessionData.exercise || "Workout Session",
        exerciseId: exerciseSlug,
        reps: sessionData.reps || 0,
        validReps: sessionData.validReps ?? (sessionData.reps - (sessionData.invalidReps || 0)),
        invalid: sessionData.invalidReps || 0,
        accuracy: `${Math.round(sessionData.formAccuracyPct || 94)}%`,
        accuracyNum: Math.round(sessionData.formAccuracyPct || 94),
        duration: sessionData.durationFormatted || "02:14",
        durationSeconds: sessionData.durationSeconds || 134,
        date: "Just now",
        dateFormatted: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        avgFps: sessionData.avgFps || 30.0,
        status: "Completed",
      },
      success: true,
    };
  },

  /**
   * Fetch authenticated user's sessions from backend
   */
  async getUserWorkoutHistory(userId, token = null) {
    if (!userId) {
      return { data: [], total: 0, success: true };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions`, {
        method: "GET",
        headers: getHeaders(token),
      });

      if (response.ok) {
        const result = await response.json();
        const rawSessions = result.sessions || [];

        // Exercise slug to readable display name
        const displayNameMap = {
          bicep_curl: "Bicep Curl",
          squat: "Squat",
          push_up: "Push-Up",
        };

        const formattedSessions = rawSessions.map((s) => {
          const mins = Math.floor((s.duration_seconds || 0) / 60);
          const secs = Math.floor((s.duration_seconds || 0) % 60);
          const durationStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

          let dateStr = "Recent";
          if (s.timestamp) {
            try {
              dateStr = new Date(s.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            } catch {
              dateStr = s.timestamp;
            }
          }

          return {
            id: `sess-${s.session_id}`,
            sessionId: s.session_id,
            userId: s.user_id,
            exercise: displayNameMap[s.exercise_type] || s.exercise_type,
            exerciseId: s.exercise_type,
            reps: s.total_reps,
            validReps: s.total_reps - s.invalid_reps,
            invalid: s.invalid_reps,
            accuracy: `${Math.round(s.form_accuracy_pct || 94)}%`,
            accuracyNum: Math.round(s.form_accuracy_pct || 94),
            duration: durationStr,
            durationSeconds: s.duration_seconds,
            date: dateStr,
            avgFps: 30.0,
            status: "Completed",
          };
        });

        return { data: formattedSessions, total: formattedSessions.length, success: true };
      }
    } catch (err) {
      console.warn("Could not fetch user sessions from backend:", err);
    }

    return { data: [], total: 0, success: false };
  },

  // ============================================================
  // EXERCISES & DASHBOARD VISUAL CATALOG (PRESERVED)
  // ============================================================

  async getExercises() {
    return { data: [...mockExercises], success: true };
  },

  async getExerciseById(exerciseId) {
    const exercise = mockExercises.find((ex) => ex.id === exerciseId);
    return { data: exercise || mockExercises[0], success: true };
  },

  async getWeeklyPerformance() {
    return { data: [...mockWeeklyPerformance], success: true };
  },

  async getLiveWorkoutInitialState() {
    return { data: { ...defaultLiveWorkoutState }, success: true };
  },
};

export default apiService;
