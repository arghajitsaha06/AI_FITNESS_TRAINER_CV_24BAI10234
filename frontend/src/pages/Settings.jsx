import React, { useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import { useUser } from "../context/UserContext";
import Button from "../components/common/Button";
import { Sliders, Bell, Camera, Dumbbell, Check, Monitor, Volume2, Shield } from "lucide-react";

export const Settings = () => {
  const { settings, updateSettings } = useUser();
  const [activeTab, setActiveTab] = useState("appearance");
  const [savedBanner, setSavedBanner] = useState(false);

  const handleToggle = (section, key) => {
    updateSettings(section, key, !settings[section][key]);
    showSaveNotification();
  };

  const handleSelect = (section, key, value) => {
    updateSettings(section, key, value);
    showSaveNotification();
  };

  const showSaveNotification = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const tabs = [
    { id: "appearance", name: "Appearance", icon: Monitor },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "camera", name: "Camera & Vision", icon: Camera },
    { id: "workout", name: "Workout Rules", icon: Dumbbell },
  ];

  return (
    <PageContainer maxWidth="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-brand-orange" />
          <span className="text-xs font-mono uppercase tracking-widest text-brand-soft font-semibold">
            System Configuration
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight uppercase">
          SETTINGS
        </h1>
        <p className="text-base sm:text-lg text-textSecondary mt-1">
          Customize your computer vision preferences, telemetry, and training feedback.
        </p>
      </div>

      {/* Settings layout: Left tabs + Right content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <div className="md:col-span-4 space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
                  isActive
                    ? "bg-navy-800 text-brand-bright border border-brand-orange/30 shadow-card"
                    : "text-textSecondary hover:text-textPrimary hover:bg-navy-800/40"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-brand-orange" : "text-textMuted"
                  }`}
                />
                <span>{tab.name}</span>
              </button>
            );
          })}

          {savedBanner && (
            <div className="p-3 mt-4 rounded-xl bg-statusSuccess/15 border border-statusSuccess/30 text-statusSuccess text-xs font-medium flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>Settings updated (Local state)</span>
            </div>
          )}
        </div>

        {/* Content Panel */}
        <div className="md:col-span-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-800 border border-white/5 shadow-card space-y-6">
            {/* 1. APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">
                    Appearance Preferences
                  </h3>
                  <p className="text-xs text-textMuted mt-0.5">
                    Theme contrast, accent density, and layout spacing.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-850 border border-white/5">
                    <div>
                      <div className="text-sm font-semibold text-textPrimary">
                        Theme Palette
                      </div>
                      <div className="text-xs text-textMuted mt-0.5">
                        Warm Navy Surfaces (#111827) with Orange Accent (#F97316)
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-bright px-2.5 py-1 rounded-full bg-brand-orange/15 border border-brand-orange/30">
                      Standard Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-850 border border-white/5">
                    <div>
                      <div className="text-sm font-semibold text-textPrimary">
                        Accent Intensity
                      </div>
                      <div className="text-xs text-textMuted mt-0.5">
                        Controls glow and border prominence
                      </div>
                    </div>
                    <select
                      value={settings.appearance.accentIntensity}
                      onChange={(e) =>
                        handleSelect("appearance", "accentIntensity", e.target.value)
                      }
                      className="bg-navy-800 border border-white/10 text-textPrimary text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="subtle">Subtle (Balanced)</option>
                      <option value="balanced">Balanced</option>
                      <option value="high">High Contrast</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 2. NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">
                    Audio & Notification Preferences
                  </h3>
                  <p className="text-xs text-textMuted mt-0.5">
                    Audio chime on repetition completion and AI coach cues.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-850 border border-white/5">
                    <div>
                      <div className="text-sm font-semibold text-textPrimary">
                        Repetition Sound Cue
                      </div>
                      <div className="text-xs text-textMuted mt-0.5">
                        Play subtle chime when valid repetition threshold is reached
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.audioCueRep}
                      onChange={() => handleToggle("notifications", "audioCueRep")}
                      className="w-5 h-5 accent-brand-orange rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-850 border border-white/5">
                    <div>
                      <div className="text-sm font-semibold text-textPrimary">
                        AI Coach Voice Corrections
                      </div>
                      <div className="text-xs text-textMuted mt-0.5">
                        Read biomechanical feedback cues aloud during workout
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.voiceFeedback}
                      onChange={() => handleToggle("notifications", "voiceFeedback")}
                      className="w-5 h-5 accent-brand-orange rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. CAMERA & VISION */}
            {activeTab === "camera" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">
                    Camera & Computer Vision Preferences
                  </h3>
                  <p className="text-xs text-textMuted mt-0.5">
                    Stream parameters and kinematic skeleton overlays.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-850 border border-white/5">
                    <div>
                      <div className="text-sm font-semibold text-textPrimary">
                        Target Analysis FPS
                      </div>
                      <div className="text-xs text-textMuted mt-0.5">
                        MediaPipe landmark detection target rate
                      </div>
                    </div>
                    <select
                      value={settings.camera.targetFps}
                      onChange={(e) =>
                        handleSelect("camera", "targetFps", Number(e.target.value))
                      }
                      className="bg-navy-800 border border-white/10 text-textPrimary text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer font-medium"
                    >
                      <option value={30}>30 FPS (Standard)</option>
                      <option value={60}>60 FPS (High Performance)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-850 border border-white/5">
                    <div>
                      <div className="text-sm font-semibold text-textPrimary">
                        Show Skeleton Joints Overlay
                      </div>
                      <div className="text-xs text-textMuted mt-0.5">
                        Display glowing orange joint nodes and vector lines
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.camera.showSkeletonJoints}
                      onChange={() =>
                        handleToggle("camera", "showSkeletonJoints")
                      }
                      className="w-5 h-5 accent-brand-orange rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. WORKOUT PREFERENCES */}
            {activeTab === "workout" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">
                    Workout & Tracking Thresholds
                  </h3>
                  <p className="text-xs text-textMuted mt-0.5">
                    Countdown buffer, target rep goals, and strictness.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-850 border border-white/5">
                    <div>
                      <div className="text-sm font-semibold text-textPrimary">
                        Countdown Timer Before Start
                      </div>
                      <div className="text-xs text-textMuted mt-0.5">
                        Buffer time to get into camera frame
                      </div>
                    </div>
                    <select
                      value={settings.workout.prepCountdownSeconds}
                      onChange={(e) =>
                        handleSelect(
                          "workout",
                          "prepCountdownSeconds",
                          Number(e.target.value)
                        )
                      }
                      className="bg-navy-800 border border-white/10 text-textPrimary text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer font-medium"
                    >
                      <option value={3}>3 Seconds</option>
                      <option value={5}>5 Seconds</option>
                      <option value={10}>10 Seconds</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-850 border border-white/5">
                    <div>
                      <div className="text-sm font-semibold text-textPrimary">
                        Target Rep Goal per Set
                      </div>
                      <div className="text-xs text-textMuted mt-0.5">
                        Sets completion benchmark
                      </div>
                    </div>
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={settings.workout.targetRepGoal}
                      onChange={(e) =>
                        handleSelect(
                          "workout",
                          "targetRepGoal",
                          Number(e.target.value)
                        )
                      }
                      className="w-20 bg-navy-800 border border-white/10 text-textPrimary text-xs rounded-xl px-3 py-2 text-right font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings;
