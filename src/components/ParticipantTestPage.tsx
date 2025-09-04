import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface ParticipantTestPageProps {
  onClose: () => void;
}

export function ParticipantTestPage({ onClose }: ParticipantTestPageProps) {
  const [participantEmail, setParticipantEmail] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [showTestDetails, setShowTestDetails] = useState(false);

  const activeTests = useQuery(api.preQualifierTests.getActiveTests);
  const recordAttempt = useMutation(api.preQualifierTests.recordTestAttempt);
  const canTakeTest = useQuery(
    api.preQualifierTests.canParticipantTakeTest,
    selectedTest && participantEmail 
      ? { testId: selectedTest._id, participantEmail }
      : "skip"
  );
  const participantAttempts = useQuery(
    api.preQualifierTests.getParticipantAttempts,
    participantEmail ? { participantEmail } : "skip"
  );

  // Loading states
  const isLoadingTests = activeTests === undefined;
  const isLoadingAttempts = participantAttempts === undefined;

  useEffect(() => {
    // Check if participant info is stored
    const storedEmail = localStorage.getItem('participantEmail');
    const storedName = localStorage.getItem('participantName');
    
    if (storedEmail && storedName) {
      setParticipantEmail(storedEmail);
      setParticipantName(storedName);
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantEmail || !participantName) {
      toast.error("Please enter both email and name");
      return;
    }

    // Store participant info
    localStorage.setItem('participantEmail', participantEmail);
    localStorage.setItem('participantName', participantName);
    setIsAuthenticated(true);
    toast.success("Welcome! You can now access pre-qualifier tests.");
  };

  const handleStartTest = async (test: any) => {
    if (!canTakeTest?.canTake) {
      toast.error(canTakeTest?.reason || "Cannot take this test");
      return;
    }

    try {
      const result = await recordAttempt({
        testId: test._id,
        participantEmail,
        participantName,
        ipAddress: undefined, // Could be added if needed
        userAgent: navigator.userAgent
      });

      toast.success(`Test attempt ${result.attemptNumber} started! Opening test link...`);
      
      // Open test link in new tab
      window.open(test.testLink, '_blank');
      
    } catch (error: any) {
      toast.error(error.message || "Failed to start test");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeRemaining = (endDate: number) => {
    const now = Date.now();
    const remaining = endDate - now;
    
    if (remaining <= 0) return "Ended";
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/20 text-green-400";
      case "Medium": return "bg-yellow-500/20 text-yellow-400";
      case "Hard": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case "MCQ": return "📝";
      case "Coding": return "💻";
      case "Mixed": return "🔀";
      default: return "📋";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-md">
          <div className="p-6 border-b border-medium-blue/30 bg-gradient-to-r from-accent-blue/20 to-electric-blue/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-electric-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-silver font-bold text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-silver mb-2">
                Pre-Qualifier Tests
              </h2>
              <p className="text-silver/70 text-sm">
                Enter your details to access available tests
              </p>
            </div>
          </div>

          <form onSubmit={handleAuthenticate} className="p-6 space-y-4">
            <div>
              <label className="block text-silver font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="cosmic-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                className="cosmic-input"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-medium-blue/40 text-silver rounded-xl hover:bg-medium-blue/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-blue to-electric-blue text-silver font-bold rounded-xl hover:scale-105 transform transition-all duration-300"
              >
                Access Tests
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Show loading state while data is being fetched
  if (isLoadingTests || isLoadingAttempts) {
    return (
      <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-silver mb-2">Loading Tests...</h3>
          <p className="text-silver/70">Please wait while we fetch the available tests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-medium-blue/30 bg-gradient-to-r from-accent-blue/20 to-electric-blue/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-silver mb-2">
                🎯 Pre-Qualifier Tests
              </h2>
              <p className="text-silver/70">
                Welcome, {participantName}! Take your pre-qualifier tests here.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  localStorage.removeItem('participantEmail');
                  localStorage.removeItem('participantName');
                  setIsAuthenticated(false);
                }}
                className="px-4 py-2 border border-white/20 text-silver rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                Switch User
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-silver text-xl">✕</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* My Attempts Summary */}
          {participantAttempts && participantAttempts.length > 0 && (
            <div className="mb-6 p-4 bg-dark-blue/40 border border-medium-blue/30 rounded-xl">
              <h3 className="text-lg font-bold text-silver mb-3">📊 My Test History</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-blue">{participantAttempts.length}</div>
                  <div className="text-silver/70">Total Attempts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {participantAttempts.filter(a => a.status === "completed").length}
                  </div>
                  <div className="text-silver/70">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {participantAttempts.filter(a => a.status === "started").length}
                  </div>
                  <div className="text-silver/70">In Progress</div>
                </div>
              </div>
            </div>
          )}

          {/* Available Tests */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-silver mb-4">🎯 Available Tests</h3>
            
            {activeTests && activeTests.length > 0 ? (
              activeTests.map((test) => {
                const testAttempts = participantAttempts?.filter(a => a.testId === test._id) || [];
                const canTake = testAttempts.length < test.maxAttempts;
                const hasOngoing = testAttempts.some(a => a.status === "started");
                
                return (
                  <div
                    key={test._id}
                    className="p-6 bg-dark-blue/40 border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{getTestTypeIcon(test.testType)}</span>
                          <h4 className="text-xl font-bold text-silver">{test.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(test.difficulty)}`}>
                            {test.difficulty}
                          </span>
                          <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-sm font-medium">
                            {test.testType}
                          </span>
                        </div>
                        
                        <p className="text-silver/80 mb-4">{test.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-silver/60">Duration:</span>
                            <div className="text-silver font-medium">{test.duration} minutes</div>
                          </div>
                          <div>
                            <span className="text-silver/60">Questions:</span>
                            <div className="text-silver font-medium">{test.totalQuestions || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-silver/60">Attempts:</span>
                            <div className="text-silver font-medium">{testAttempts.length}/{test.maxAttempts}</div>
                          </div>
                          <div>
                            <span className="text-silver/60">Time Remaining:</span>
                            <div className="text-silver font-medium">{formatTimeRemaining(test.endDate)}</div>
                          </div>
                        </div>

                        {test.instructions && (
                          <div className="p-3 bg-dark-blue/30 rounded-lg mb-4">
                            <span className="text-silver/60 text-sm font-medium">Instructions:</span>
                            <div className="text-silver/80 text-sm mt-1">{test.instructions}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {canTake && !hasOngoing ? (
                          <button
                            onClick={() => handleStartTest(test)}
                            className="px-6 py-3 bg-gradient-to-r from-accent-blue to-electric-blue text-silver font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg"
                          >
                            Start Test
                          </button>
                        ) : hasOngoing ? (
                          <div className="text-center">
                            <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium mb-2">
                              Test In Progress
                            </div>
                            <button
                              onClick={() => window.open(test.testLink, '_blank')}
                              className="px-4 py-2 bg-yellow-500 text-space-navy font-medium rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                            >
                              Continue Test
                            </button>
                          </div>
                        ) : (
                          <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium text-center">
                            Max Attempts Reached
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setShowTestDetails(true);
                          }}
                          className="px-4 py-2 border border-medium-blue/40 text-silver rounded-lg hover:bg-medium-blue/20 transition-colors text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-silver mb-2">No Active Tests</h3>
                <p className="text-silver/70 mb-6">
                  There are currently no pre-qualifier tests available. Check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Details Modal */}
      {showTestDetails && selectedTest && (
        <TestDetailsModal
          test={selectedTest}
          onClose={() => {
            setShowTestDetails(false);
            setSelectedTest(null);
          }}
          participantAttempts={participantAttempts?.filter(a => a.testId === selectedTest._id) || []}
        />
      )}
    </div>
  );
}

// Test Details Modal Component
function TestDetailsModal({ test, onClose, participantAttempts }: { 
  test: any; 
  onClose: () => void; 
  participantAttempts: any[];
}) {
  return (
    <div className="fixed inset-0 bg-charcoal/90 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-medium-blue/30">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-silver">{test.title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="text-silver text-xl">✕</span>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-lg font-bold text-silver mb-2">Description</h4>
            <p className="text-silver/80">{test.description}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold text-silver mb-2">Test Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-silver/60">Duration:</span>
                <div className="text-silver font-medium">{test.duration} minutes</div>
              </div>
              <div>
                <span className="text-silver/60">Total Questions:</span>
                <div className="text-silver font-medium">{test.totalQuestions || 'N/A'}</div>
              </div>
              <div>
                <span className="text-silver/60">Difficulty:</span>
                <div className="text-silver font-medium">{test.difficulty}</div>
              </div>
              <div>
                <span className="text-silver/60">Test Type:</span>
                <div className="text-silver font-medium">{test.testType}</div>
              </div>
              <div>
                <span className="text-silver/60">Max Attempts:</span>
                <div className="text-silver font-medium">{test.maxAttempts}</div>
              </div>
              <div>
                <span className="text-silver/60">Passing Score:</span>
                <div className="text-silver font-medium">{test.passingScore || 'N/A'}%</div>
              </div>
            </div>
          </div>

          {test.instructions && (
            <div>
              <h4 className="text-lg font-bold text-silver mb-2">Instructions</h4>
              <div className="p-4 bg-dark-blue/30 rounded-lg">
                <p className="text-silver/80 whitespace-pre-wrap">{test.instructions}</p>
              </div>
            </div>
          )}

          {test.eligibilityCriteria && (
            <div>
              <h4 className="text-lg font-bold text-silver mb-2">Eligibility Criteria</h4>
              <div className="p-4 bg-dark-blue/30 rounded-lg">
                <p className="text-silver/80 whitespace-pre-wrap">{test.eligibilityCriteria}</p>
              </div>
            </div>
          )}

          {participantAttempts.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-silver mb-2">Your Attempts</h4>
              <div className="space-y-2">
                {participantAttempts.map((attempt, index) => (
                  <div key={attempt._id} className="p-3 bg-dark-blue/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-silver font-medium">Attempt {attempt.attemptNumber}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        attempt.status === "completed" 
                          ? "bg-green-500/20 text-green-400"
                          : attempt.status === "started"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {attempt.status}
                      </span>
                    </div>
                    <div className="text-silver/70 text-sm mt-1">
                      Started: {new Date(attempt.startedAt).toLocaleString()}
                      {attempt.completedAt && (
                        <> • Completed: {new Date(attempt.completedAt).toLocaleString()}</>
                      )}
                      {attempt.score !== undefined && (
                        <> • Score: {attempt.score}%</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-medium-blue/40 text-silver rounded-xl hover:bg-medium-blue/20 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
