import React from "react";
import PageContainer from "../components/layout/PageContainer";
import HeroSection from "../components/dashboard/HeroSection";
import StatCard from "../components/dashboard/StatCard";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import RecentWorkouts from "../components/dashboard/RecentWorkouts";
import { mockDashboardStats } from "../data/mockData";

import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";

export const Dashboard = () => {
  const { user } = useUser();
  const { currentUser } = useAuth();

  const athleteName =
    currentUser?.full_name || currentUser?.username || user?.displayName || "Athlete";

  // Stat cards with user-specific metrics
  const dashboardStats = [
    {
      id: "total_workouts",
      label: "TOTAL WORKOUTS",
      value: String(user?.stats?.totalWorkouts ?? 0),
      trend: "+12% this month",
      trendDirection: "up",
      icon: "Activity",
    },
    {
      id: "total_reps",
      label: "TOTAL REPS",
      value: (user?.stats?.totalReps ?? 0).toLocaleString(),
      trend: "+180 this week",
      trendDirection: "up",
      icon: "Flame",
    },
    {
      id: "workout_time",
      label: "WORKOUT TIME",
      value: user?.stats?.totalTimeFormatted || "0h 00m",
      trend: "+45m vs last week",
      trendDirection: "up",
      icon: "Clock",
    },
    {
      id: "form_accuracy",
      label: "FORM ACCURACY",
      value: `${user?.stats?.avgAccuracyPct ?? 94}%`,
      trend: "+3.4% improvement",
      trendDirection: "up",
      icon: "Target",
      isHighlight: true,
    },
  ];

  return (
    <PageContainer>
      {/* Top Welcome Greeting */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
          Good morning, {athleteName}.
        </h2>
        <p className="text-sm sm:text-base text-textSecondary mt-1 font-normal">
          Train smarter. Move better.
        </p>
      </div>

      {/* Main 3D Hero Section */}
      <HeroSection />

      {/* 4 Premium Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
            icon={stat.icon}
            isHighlight={stat.isHighlight}
          />
        ))}
      </div>

      {/* Bottom Row: Performance Analytics Chart & Recent Workouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-5">
          <RecentWorkouts />
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
