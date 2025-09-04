interface SignInRequiredModalProps {
  onClose: () => void;
  action: string; // e.g., "create an event", "register for events"
}

export function SignInRequiredModal({ onClose, action }: SignInRequiredModalProps) {
  const scrollToSignIn = () => {
    onClose();
    // Scroll to the sign-in section on the landing page
    const signInSection = document.querySelector('#sign-in-section');
    if (signInSection) {
      signInSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If no sign-in section found, scroll to bottom where it usually is
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-accent-blue to-electric-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-silver mb-2">
            Sign In Required
          </h2>
          <p className="text-silver/70">
            You need to sign in to {action}. Join our cosmic community to unlock all features!
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="bg-dark-blue/40 rounded-xl p-4 mb-6">
            <h3 className="text-silver font-semibold mb-3 flex items-center gap-2">
              <span>✨</span>
              What you'll get access to:
            </h3>
            <ul className="space-y-2 text-silver/80 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                Create and manage stellar events
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-electric-blue rounded-full"></span>
                Register for competitions and workshops
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                Connect with other cosmic minds
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-electric-blue rounded-full"></span>
                Track your event participation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                Access exclusive organizer tools
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={scrollToSignIn}
              className="w-full px-6 py-3 bg-gradient-to-r from-accent-blue to-electric-blue text-silver font-semibold rounded-xl transition-all duration-300 hover:from-accent-blue/90 hover:to-electric-blue/90 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🚀</span>
                Sign In Now
              </span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-dark-blue/60 hover:bg-dark-blue/80 border border-medium-blue/40 hover:border-accent-blue/60 text-silver/80 hover:text-silver font-medium rounded-xl transition-all duration-300"
            >
              Maybe Later
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-medium-blue/30 rounded-lg transition-colors text-silver/70 hover:text-silver"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
