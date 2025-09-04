import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface SuperAdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function SuperAdminLogin({ onSuccess, onCancel }: SuperAdminLoginProps) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const authenticateSuperAdmin = useMutation(api.superAdmin.authenticateSuperAdmin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      // Direct credential check for immediate access
      const SUPER_ADMIN_EMAIL = "rutvikburra@gmail.com";
      const SUPER_ADMIN_PASSWORD = "rutvikburra1234567890@#E";

      console.log("Super Admin Login Attempt:", {
        providedEmail: credentials.email,
        expectedEmail: SUPER_ADMIN_EMAIL,
        emailMatch: credentials.email === SUPER_ADMIN_EMAIL,
        providedPassword: credentials.password,
        expectedPassword: SUPER_ADMIN_PASSWORD,
        passwordMatch: credentials.password === SUPER_ADMIN_PASSWORD,
        providedEmailLength: credentials.email.length,
        expectedEmailLength: SUPER_ADMIN_EMAIL.length,
        providedPasswordLength: credentials.password.length,
        expectedPasswordLength: SUPER_ADMIN_PASSWORD.length
      });

      if (credentials.email === SUPER_ADMIN_EMAIL && credentials.password === SUPER_ADMIN_PASSWORD) {
        toast.success("Super Admin access granted! 👑");
        onSuccess();
        return;
      }

      // If direct check fails, show error
      toast.error("Invalid super admin credentials. Please check your email and password.");
    } catch (error: any) {
      console.error("Super admin login error:", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-medium-blue/30 bg-gradient-to-r from-supernova-gold/20 to-plasma-orange/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-space-navy font-bold text-2xl">👑</span>
            </div>
            <h2 className="text-2xl font-bold text-silver mb-2">
              Super Admin Access
            </h2>
            <p className="text-silver/70 text-sm">
              Restricted access - authorized personnel only
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-silver font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-supernova-gold focus:ring-2 focus:ring-supernova-gold/20 outline-none transition-all duration-300"
              placeholder="Enter super admin email"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-silver font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-supernova-gold focus:ring-2 focus:ring-supernova-gold/20 outline-none transition-all duration-300"
              placeholder="Enter super admin password"
              required
              disabled={isLoading}
            />
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="text-yellow-400 text-lg">⚠️</div>
              <div>
                <h4 className="text-yellow-400 font-medium text-sm mb-1">Security Notice</h4>
                <p className="text-yellow-400/80 text-xs">
                  This is a restricted area. All access attempts are logged and monitored.
                  Unauthorized access is strictly prohibited.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-medium-blue/40 text-silver rounded-xl hover:bg-medium-blue/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                isLoading
                  ? "bg-medium-blue/20 text-silver/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy hover:scale-105 transform shadow-lg shadow-supernova-gold/25"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-space-navy/30 border-t-space-navy rounded-full animate-spin"></div>
                  Authenticating...
                </div>
              ) : (
                "Access Panel"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center text-silver/50 text-xs">
            Super Admin Panel v1.0 • Secure Access Required
          </div>
        </div>
      </div>
    </div>
  );
}
