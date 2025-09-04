import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { AdminDashboard } from "./AdminDashboard";
import { OrganizerDashboard } from "./OrganizerDashboard";
import { JudgeDashboard } from "./JudgeDashboard";
import { SimpleVideoBackground } from "./SimpleVideoBackground";
import { SignInForm } from "../SignInForm";

interface UserInfo {
  email: string;
  role: "organizer" | "judge";
  firstName: string;
  lastName: string;
  organization?: string;
}

export function AuthWrapper() {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { signIn } = useAuthActions();
  const createDefaultAccounts = useMutation(api.superAdmin.createDefaultAccounts);

  // Initialize default accounts and check for stored user session
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Create default accounts if they don't exist
        await createDefaultAccounts();
      } catch (error) {
        // Default accounts already exist or error creating them
      }

      // Check for stored user session
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const userInfo = JSON.parse(storedUser);
          setCurrentUser(userInfo);

          // Auto-authenticate with Convex for development
          try {
            // Use anonymous authentication for now since we handle authorization
            // through organizer credentials in the backend
            await signIn("anonymous");
          } catch (authError) {
            // Auto-authentication failed, user will need to sign in manually
            // Don't throw error, just continue without auth
          }
        } catch (error) {
          console.error("Error parsing stored user info:", error);
          localStorage.removeItem('currentUser');
        }
      }
      setIsLoading(false);
    };

    initializeApp();
  }, [createDefaultAccounts]);

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const handleSignInSuccess = (userInfo: UserInfo) => {
    setCurrentUser(userInfo);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Video Blackhole Background */}
        <SimpleVideoBackground />

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-silver/70">Loading your cosmic dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no user is signed in, show sign-in form
  if (!currentUser) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Video Blackhole Background */}
        <SimpleVideoBackground />

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <SignInForm onSuccess={handleSignInSuccess} />
          </div>
        </div>
      </div>
    );
  }

  // Create mock profile and stats for the dashboard components
  const mockProfile = {
    _id: "mock-id" as any,
    _creationTime: Date.now(),
    userId: "mock-user-id" as any,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    role: currentUser.role === "organizer" ? "admin" as const : "judge" as const,
    organization: currentUser.organization || "",
    bio: "",
    skills: [],
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      website: ""
    },
    preferences: {
      emailNotifications: true,
      theme: "dark" as const
    }
  };

  const mockStats = {
    totalEvents: 0,
    upcomingEvents: 0,
    totalParticipants: 0,
    totalSubmissions: 0,
    pendingReviews: 0,
    completedReviews: 0
  };

  // Render appropriate dashboard based on role
  if (currentUser.role === "organizer") {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Video Blackhole Background */}
        <SimpleVideoBackground />

        {/* Content Container */}
        <div className="relative z-10">
          {/* Header with sign out */}
          <nav className="bg-space-navy/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-electric-blue rounded-full flex items-center justify-center">
                  <span className="text-silver font-bold text-lg">👨‍💼</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-starlight-white">
                    Organizer Dashboard
                  </span>
                  <div className="text-sm text-silver/70">
                    Welcome, {currentUser.firstName} {currentUser.lastName}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-white/20 text-starlight-white rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

          <OrganizerDashboard profile={mockProfile} stats={mockStats} />
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Video Blackhole Background */}
        <SimpleVideoBackground />

        {/* Content Container */}
        <div className="relative z-10">
          {/* Header with sign out */}
          <nav className="bg-space-navy/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-electric-blue to-neon-blue rounded-full flex items-center justify-center">
                  <span className="text-silver font-bold text-lg">⚖️</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-starlight-white">
                    Judge Dashboard
                  </span>
                  <div className="text-sm text-silver/70">
                    Welcome, {currentUser.firstName} {currentUser.lastName}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-white/20 text-starlight-white rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

          <JudgeDashboard profile={mockProfile} stats={mockStats} />
        </div>
      </div>
    );
  }
}
