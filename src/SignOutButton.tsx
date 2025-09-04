"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded-xl bg-dark-blue/60 hover:bg-dark-blue/80 text-silver border border-medium-blue/40 hover:border-accent-blue/60 font-medium hover:text-silver transition-all duration-300 shadow-sm hover:shadow-lg backdrop-blur-md"
      onClick={() => void signOut()}
    >
      <span className="flex items-center gap-2">
        <span>🚪</span>
        Sign out
      </span>
    </button>
  );
}
