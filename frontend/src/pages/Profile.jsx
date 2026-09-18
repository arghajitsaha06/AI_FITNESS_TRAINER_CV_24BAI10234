import React from "react";
import PageContainer from "../components/layout/PageContainer";
import ProfileCard from "../components/profile/ProfileCard";
import FitnessOverview from "../components/profile/FitnessOverview";

export const Profile = () => {
  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-brand-orange" />
          <span className="text-xs font-mono uppercase tracking-widest text-brand-soft font-semibold">
            Athlete Biometrics & Records
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight uppercase">
          ATHLETE PROFILE
        </h1>
        <p className="text-base sm:text-lg text-textSecondary mt-1">
          Performance metrics, kinematic progress, and training milestones.
        </p>
      </div>

      {/* Main Profile Identity Card */}
      <div className="mb-8">
        <ProfileCard />
      </div>

      {/* Fitness Overview, Preferred Exercises, Recent Activity */}
      <FitnessOverview />
    </PageContainer>
  );
};

export default Profile;
