import React, { createContext, useContext, useState, useEffect } from "react";
import { mockUser, defaultSettings } from "../data/mockData";
import apiService from "../services/api";
import { useAuth } from "./AuthContext";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { currentUser, token } = useAuth();
  const [user, setUser] = useState(mockUser);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("fitai_settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [loading, setLoading] = useState(false);

  // Sync user profile & fetch user-specific workout history when authenticated user changes
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (!currentUser) {
        setHistory([]);
        setUser(mockUser);
        return;
      }

      // Format member since
      let formattedMemberSince = "Recently Joined";
      if (currentUser.created_at) {
        try {
          formattedMemberSince = new Date(currentUser.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        } catch {
          formattedMemberSince = currentUser.created_at;
        }
      }

      setLoading(true);
      try {
        const historyRes = await apiService.getUserWorkoutHistory(currentUser.user_id, token);
        const userSessions = historyRes?.data || [];

        if (isMounted) {
          setHistory(userSessions);

          // Compute user lifetime stats from actual database sessions
          const totalWorkouts = userSessions.length;
          const totalReps = userSessions.reduce((acc, s) => acc + (s.reps || 0), 0);
          const totalSec = userSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
          const hours = Math.floor(totalSec / 3600);
          const mins = Math.floor((totalSec % 3600) / 60);

          const avgAcc =
            totalWorkouts > 0
              ? Math.round(
                  userSessions.reduce((acc, s) => acc + (s.accuracyNum || 90), 0) /
                    totalWorkouts
                )
              : 94;

          // Recent activities from user's sessions
          const activities = userSessions.slice(0, 4).map((s) => ({
            id: `act-${s.id}`,
            type: "workout_completed",
            title: `Completed ${s.exercise} Session`,
            detail: `${s.reps} reps • ${s.accuracy} Form Accuracy`,
            timestamp: s.date,
            icon: "Dumbbell",
          }));

          setUser({
            id: currentUser.user_id,
            athleteId: `ATH-${String(currentUser.user_id).padStart(4, "0")}`,
            username: currentUser.username,
            displayName: currentUser.full_name || currentUser.username,
            email: currentUser.email || `${currentUser.username}@fitai.vision`,
            avatar: null,
            memberSince: formattedMemberSince,
            tier: "Elite Athlete",
            status: "Online",
            bio: "AI Computer Vision tracked athlete. Real-time joint kinematics active.",
            stats: {
              totalWorkouts: totalWorkouts,
              totalReps: totalReps,
              totalTimeFormatted: `${hours}h ${mins}m`,
              totalSeconds: totalSec,
              avgAccuracyPct: avgAcc,
              streakDays: totalWorkouts > 0 ? Math.min(totalWorkouts, 5) : 1,
              caloriesBurned: totalReps * 4,
            },
            fitnessOverview: {
              strengthScore: Math.min(95, 75 + totalWorkouts * 2),
              formConsistencyScore: avgAcc,
              mobilityIndex: 85,
              weeklyGoalPct: Math.min(100, totalWorkouts * 25),
              preferredTime: "Morning (07:30 AM)",
            },
            preferredExercises: mockUser.preferredExercises,
            recentActivity: activities.length > 0 ? activities : mockUser.recentActivity,
          });
        }
      } catch (err) {
        console.warn("Error loading user workout history:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [currentUser, token]);

  // Persist settings in local storage
  useEffect(() => {
    localStorage.setItem("fitai_settings", JSON.stringify(settings));
  }, [settings]);

  /**
   * Save a newly completed workout into the database linked to currentUser
   */
  const saveWorkout = async (sessionData) => {
    setLoading(true);
    try {
      const payload = {
        ...sessionData,
        userId: currentUser?.user_id,
      };

      const response = await apiService.saveWorkoutSession(payload, token);
      if (response.success && response.data) {
        const savedSession = response.data;
        setHistory((prev) => [savedSession, ...prev]);

        // Update user stats dynamically
        setUser((prevUser) => {
          const newTotalWorkouts = prevUser.stats.totalWorkouts + 1;
          const newTotalReps = prevUser.stats.totalReps + (savedSession.reps || 0);
          const newTotalSec = prevUser.stats.totalSeconds + (savedSession.durationSeconds || 134);
          const hours = Math.floor(newTotalSec / 3600);
          const mins = Math.floor((newTotalSec % 3600) / 60);

          return {
            ...prevUser,
            stats: {
              ...prevUser.stats,
              totalWorkouts: newTotalWorkouts,
              totalReps: newTotalReps,
              totalSeconds: newTotalSec,
              totalTimeFormatted: `${hours}h ${mins}m`,
            },
            recentActivity: [
              {
                id: `act-${Date.now()}`,
                type: "workout_completed",
                title: `Completed ${savedSession.exercise} Session`,
                detail: `${savedSession.reps} reps • ${savedSession.accuracy} Form Accuracy`,
                timestamp: "Just now",
                icon: "Dumbbell",
              },
              ...prevUser.recentActivity.slice(0, 5),
            ],
          };
        });

        return savedSession;
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        history,
        settings,
        loading,
        saveWorkout,
        updateSettings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserContext;
