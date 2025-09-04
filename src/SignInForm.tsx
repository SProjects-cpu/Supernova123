"use client";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";

interface SignInFormProps {
  onSuccess?: (userInfo: any) => void;
}

export function SignInForm({ onSuccess }: SignInFormProps = {}) {
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuthActions();
  const authenticateOrganizerJudge = useMutation(api.superAdmin.authenticateOrganizerJudge);

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-silver mb-2">
          Organizer & Judge Access
        </h2>
        <p className="text-silver/70 text-sm">
          Sign in with your assigned credentials to access the dashboard
        </p>
      </div>

      <form
        className="flex flex-col gap-form-field"
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);

          try {
            const formData = new FormData(e.target as HTMLFormElement);
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            // Debug logging
            console.log("Authentication attempt:", {
              email,
              hasPassword: !!password
            });

            const result = await authenticateOrganizerJudge({
              email,
              password
            });

            if (result.success) {
              try {
                // For super admin created users, we need to sign in with anonymous auth
                // and then link to their user account
                await signIn("anonymous");

                // Success - show success message
                toast.success(`Welcome back, ${result.firstName}! 🚀`);

                // Store user info in localStorage for UI state management
                localStorage.setItem('currentUser', JSON.stringify({
                  email,
                  role: result.role,
                  firstName: result.firstName,
                  lastName: result.lastName,
                  organization: result.organization,
                  userId: result.userId
                }));

                // Call success callback with user info to trigger state update
                if (onSuccess) {
                  onSuccess({
                    email,
                    role: result.role,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    organization: result.organization,
                    userId: result.userId
                  });
                }
              } catch (authError) {
                console.error("Convex Auth error:", authError);
                toast.error("Authentication system error. Please try again.");
              }
            } else {
              // Authentication failed
              toast.error(result.message || "Authentication failed. Please check your credentials.");
            }

            // Reset form state
            setSubmitting(false);

          } catch (error: any) {
            console.error("Authentication error:", error);
            console.error("Error details:", {
              message: error.message,
              stack: error.stack
            });

            let toastTitle = "";
            if (error.message?.includes("Invalid credentials")) {
              toastTitle = "Invalid email or password. Please check your credentials.";
            } else if (error.message?.includes("Account is deactivated")) {
              toastTitle = "Your account has been deactivated. Please contact the administrator.";
            } else {
              toastTitle = `Could not sign in: ${error.message || 'Please check your credentials.'}`;
            }

            toast.error(toastTitle);
            setSubmitting(false);
          }
        }}
      >
        {/* Email Input Card */}
        <div className="input-card">
          <label className="block text-silver/80 text-sm font-medium mb-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
              Email Address
            </span>
          </label>
          <input
            className="auth-input-field"
            type="email"
            name="email"
            placeholder="Enter your email address"
            required
          />
        </div>

        {/* Password Input Card */}
        <div className="input-card">
          <label className="block text-silver/80 text-sm font-medium mb-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-electric-blue rounded-full"></span>
              Password
            </span>
          </label>
          <input
            className="auth-input-field"
            type="password"
            name="password"
            placeholder="Enter your assigned password"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button className="auth-button" type="submit" disabled={submitting}>
            <span className="flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-silver/30 border-t-silver rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span>🚀 Sign In</span>
                </>
              )}
            </span>
          </button>
        </div>

      </form>

      {/* Help Text */}
      <div className="text-center text-sm space-y-3">
        <p className="text-silver/60">
          Don't have credentials? Contact the super admin to create your account.
        </p>

        {/* Test Credentials */}
        <div className="bg-dark-blue/30 border border-medium-blue/40 rounded-xl p-4">
          <p className="text-silver/80 font-medium mb-2">Test Credentials:</p>
          <div className="space-y-1 text-xs">
            <div className="text-silver/70">
              <strong>Organizer:</strong> organizer@test.com / organizer123
            </div>
            <div className="text-silver/70">
              <strong>Judge:</strong> judge@test.com / judge123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
