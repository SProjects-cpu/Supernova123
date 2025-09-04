import { useEffect } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function DevAuthHelper() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    const autoSignIn = async () => {
      // Only auto-sign in if not already authenticated and not loading
      if (!isAuthenticated && !isLoading) {
        try {
          console.log("Development mode: Auto-signing in...");
          
          // Try to sign in with anonymous auth for development
          await signIn("anonymous");
          
          console.log("Development auto-sign in successful");
        } catch (error) {
          console.log("Development auto-sign in failed:", error);
        }
      }
    };

    // Add a small delay to ensure the auth system is ready
    const timer = setTimeout(autoSignIn, 1000);
    
    return () => clearTimeout(timer);
  }, [signIn, isAuthenticated, isLoading]);

  return null; // This component doesn't render anything
}
