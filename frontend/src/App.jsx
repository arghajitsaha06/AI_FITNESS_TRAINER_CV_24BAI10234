import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import WorkoutSelection from "./pages/WorkoutSelection";
import LiveWorkout from "./pages/LiveWorkout";
import WorkoutSummary from "./pages/WorkoutSummary";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { WorkoutProvider } from "./context/WorkoutContext";

// App shell layout for protected routes (Sidebar + Navbar + Content)
const AuthenticatedAppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-900 text-textPrimary flex flex-col antialiased">
      {/* Left Sidebar (fixed 260px on desktop, drawer on mobile) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Fluid Content Layout (offset by 260px on lg screens) */}
      <div className="lg:pl-[260px] flex flex-col flex-1 min-h-screen bg-gradient-to-b from-navy-900 via-navy-850 to-navy-900 transition-all">
        {/* Sticky Top Navbar */}
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Page Route Views */}
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout" element={<WorkoutSelection />} />
            <Route path="/workout/live" element={<LiveWorkout />} />
            <Route path="/workout/summary" element={<WorkoutSummary />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Minimal Footer */}
        <footer className="border-t border-white/5 py-4 px-6 text-center text-xs text-textMuted/60 font-mono">
          AI FITNESS TRAINER • COMPUTER VISION PLATFORM • PROPRIETARY KINEMATICS ENGINE
        </footer>
      </div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <WorkoutProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Application Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AuthenticatedAppLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </WorkoutProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
