import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AdminDashboard } from "./AdminDashboard";
import { OrganizerDashboard } from "./OrganizerDashboard";
import { ParticipantDashboard } from "./ParticipantDashboard";
import { ProfileSetup } from "./ProfileSetup";

export function Dashboard() {
  const dashboardData = useQuery(api.profiles.getDashboardStats);

  if (dashboardData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-silver/70">Loading your cosmic dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData?.profile) {
    return <ProfileSetup />;
  }

  const { profile, stats } = dashboardData;

  switch (profile.role) {
    case "admin":
      return <AdminDashboard profile={profile} stats={stats} />;
    case "organizer":
      return <OrganizerDashboard profile={profile} stats={stats} />;
    case "judge":
      return <ParticipantDashboard profile={profile} stats={stats} />; // Judges use similar interface
    case "participant":
      return <ParticipantDashboard profile={profile} stats={stats} />;
    default:
      return <ProfileSetup />;
  }
}
