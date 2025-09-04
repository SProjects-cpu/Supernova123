import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface PreQualifierTestManagerProps {
  onClose: () => void;
  currentUserEmail: string;
}

export function PreQualifierTestManager({ onClose, currentUserEmail }: PreQualifierTestManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const tests = useQuery(api.preQualifierTests.getAllTests);
  const createTest = useMutation(api.preQualifierTests.createTest);
  const updateTest = useMutation(api.preQualifierTests.updateTest);
  const deleteTest = useMutation(api.preQualifierTests.deleteTest);
  const toggleStatus = useMutation(api.preQualifierTests.toggleTestStatus);

  // Loading states
  const isLoadingTests = tests === undefined;

  const handleCreateTest = async (testData: any) => {
    try {
      await createTest({
        ...testData,
        createdBy: currentUserEmail
      });
      toast.success("Pre-qualifier test created successfully! 🎯");
      setShowCreateForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create test");
    }
  };

  const handleUpdateTest = async (testData: any) => {
    if (!selectedTest) return;
    
    try {
      await updateTest({
        testId: selectedTest._id,
        ...testData
      });
      toast.success("Test updated successfully! ✅");
      setShowEditForm(false);
      setSelectedTest(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update test");
    }
  };

  const handleDeleteTest = async (testId: Id<"preQualifierTests">) => {
    if (window.confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      try {
        await deleteTest({ testId });
        toast.success("Test deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete test");
      }
    }
  };

  const handleToggleStatus = async (testId: Id<"preQualifierTests">, isActive: boolean) => {
    try {
      await toggleStatus({ testId, isActive });
      toast.success(`Test ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update test status");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (test: any) => {
    const now = Date.now();
    if (!test.isActive) return "bg-red-500/20 text-red-400";
    if (now < test.startDate) return "bg-yellow-500/20 text-yellow-400";
    if (now > test.endDate) return "bg-gray-500/20 text-gray-400";
    return "bg-green-500/20 text-green-400";
  };

  const getStatusText = (test: any) => {
    const now = Date.now();
    if (!test.isActive) return "Inactive";
    if (now < test.startDate) return "Upcoming";
    if (now > test.endDate) return "Ended";
    return "Active";
  };

  // Show loading state while data is being fetched
  if (isLoadingTests) {
    return (
      <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-silver mb-2">Loading Tests...</h3>
          <p className="text-silver/70">Please wait while we fetch the pre-qualifier tests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-medium-blue/30 bg-gradient-to-r from-cosmic-purple/20 to-nebula-pink/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-silver mb-2">
                🎯 Pre-Qualifier Test Management
              </h2>
              <p className="text-silver/70">
                Create and manage pre-qualifier tests for participants
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="text-silver text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-accent-blue to-electric-blue text-silver font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              <span className="flex items-center gap-2">
                <span>➕</span>
                Create New Test
              </span>
            </button>
          </div>

          {/* Tests List */}
          <div className="space-y-4">
            {tests && tests.length > 0 ? (
              tests.map((test) => (
                <div
                  key={test._id}
                  className="p-6 bg-dark-blue/40 border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-silver">{test.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(test)}`}>
                          {getStatusText(test)}
                        </span>
                        <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-sm font-medium">
                          {test.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-sm font-medium">
                          {test.testType}
                        </span>
                      </div>
                      
                      <p className="text-silver/80 mb-4">{test.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-silver/60">Start Date:</span>
                          <div className="text-silver font-medium">{formatDate(test.startDate)}</div>
                        </div>
                        <div>
                          <span className="text-silver/60">End Date:</span>
                          <div className="text-silver font-medium">{formatDate(test.endDate)}</div>
                        </div>
                        <div>
                          <span className="text-silver/60">Duration:</span>
                          <div className="text-silver font-medium">{test.duration} minutes</div>
                        </div>
                        <div>
                          <span className="text-silver/60">Max Attempts:</span>
                          <div className="text-silver font-medium">{test.maxAttempts}</div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-dark-blue/30 rounded-lg">
                        <span className="text-silver/60 text-sm">Test Link:</span>
                        <div className="text-accent-blue font-mono text-sm break-all">{test.testLink}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedTest(test);
                          setShowEditForm(true);
                        }}
                        className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                        title="Edit Test"
                      >
                        ✏️
                      </button>
                      
                      <button
                        onClick={() => handleToggleStatus(test._id, !test.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          test.isActive 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                        title={test.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {test.isActive ? '🚫' : '✅'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTest(test._id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete Test"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-silver mb-2">No Tests Created Yet</h3>
                <p className="text-silver/70 mb-6">
                  Create your first pre-qualifier test to get started.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-silver font-medium rounded-xl transition-colors"
                >
                  Create First Test
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Test Modal */}
      {showCreateForm && (
        <CreateTestModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateTest}
        />
      )}

      {/* Edit Test Modal */}
      {showEditForm && selectedTest && (
        <EditTestModal
          test={selectedTest}
          onClose={() => {
            setShowEditForm(false);
            setSelectedTest(null);
          }}
          onSubmit={handleUpdateTest}
        />
      )}
    </div>
  );
}

// Create Test Modal Component
function CreateTestModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    testLink: "",
    startDate: "",
    endDate: "",
    duration: 60,
    instructions: "",
    eligibilityCriteria: "",
    maxAttempts: 3,
    passingScore: 70,
    tags: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    totalQuestions: 20,
    testType: "MCQ" as "MCQ" | "Coding" | "Mixed"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDate = new Date(formData.startDate).getTime();
    const endDate = new Date(formData.endDate).getTime();
    
    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    onSubmit({
      ...formData,
      startDate,
      endDate,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    });
  };

  return (
    <div className="fixed inset-0 bg-charcoal/90 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-medium-blue/30">
          <h3 className="text-2xl font-bold text-silver">Create New Pre-Qualifier Test</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-silver font-medium mb-2">Test Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="cosmic-input"
                required
                placeholder="e.g., Programming Fundamentals Test"
              />
            </div>
            
            <div>
              <label className="block text-silver font-medium mb-2">Test Link *</label>
              <input
                type="url"
                value={formData.testLink}
                onChange={(e) => setFormData(prev => ({ ...prev, testLink: e.target.value }))}
                className="cosmic-input"
                required
                placeholder="https://example.com/test-link"
              />
            </div>
          </div>

          <div>
            <label className="block text-silver font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="cosmic-input h-24 resize-none"
              required
              placeholder="Describe what this test covers..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-silver font-medium mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="cosmic-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-silver font-medium mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="cosmic-input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-silver font-medium mb-2">Duration (minutes) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="cosmic-input"
                required
                min="1"
                max="300"
              />
            </div>
            
            <div>
              <label className="block text-silver font-medium mb-2">Max Attempts *</label>
              <input
                type="number"
                value={formData.maxAttempts}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                className="cosmic-input"
                required
                min="1"
                max="10"
              />
            </div>
            
            <div>
              <label className="block text-silver font-medium mb-2">Passing Score (%)</label>
              <input
                type="number"
                value={formData.passingScore}
                onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                className="cosmic-input"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-silver font-medium mb-2">Difficulty *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className="cosmic-select"
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-silver font-medium mb-2">Test Type *</label>
              <select
                value={formData.testType}
                onChange={(e) => setFormData(prev => ({ ...prev, testType: e.target.value as any }))}
                className="cosmic-select"
                required
              >
                <option value="MCQ">Multiple Choice</option>
                <option value="Coding">Coding</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-silver font-medium mb-2">Total Questions</label>
              <input
                type="number"
                value={formData.totalQuestions}
                onChange={(e) => setFormData(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) }))}
                className="cosmic-input"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-silver font-medium mb-2">Instructions *</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              className="cosmic-input h-24 resize-none"
              required
              placeholder="Provide detailed instructions for participants..."
            />
          </div>

          <div>
            <label className="block text-silver font-medium mb-2">Eligibility Criteria</label>
            <textarea
              value={formData.eligibilityCriteria}
              onChange={(e) => setFormData(prev => ({ ...prev, eligibilityCriteria: e.target.value }))}
              className="cosmic-input h-20 resize-none"
              placeholder="Who can take this test? Any prerequisites?"
            />
          </div>

          <div>
            <label className="block text-silver font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="cosmic-input"
              placeholder="programming, algorithms, data structures"
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
              Create Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Test Modal Component (similar to Create but with pre-filled data)
function EditTestModal({ test, onClose, onSubmit }: { test: any; onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: test.title,
    description: test.description,
    testLink: test.testLink,
    startDate: new Date(test.startDate).toISOString().slice(0, 16),
    endDate: new Date(test.endDate).toISOString().slice(0, 16),
    duration: test.duration,
    instructions: test.instructions,
    eligibilityCriteria: test.eligibilityCriteria,
    maxAttempts: test.maxAttempts,
    passingScore: test.passingScore || 70,
    tags: test.tags.join(', '),
    difficulty: test.difficulty,
    totalQuestions: test.totalQuestions || 20,
    testType: test.testType
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDate = new Date(formData.startDate).getTime();
    const endDate = new Date(formData.endDate).getTime();
    
    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    onSubmit({
      ...formData,
      startDate,
      endDate,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    });
  };

  return (
    <div className="fixed inset-0 bg-charcoal/90 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-medium-blue/30">
          <h3 className="text-2xl font-bold text-silver">Edit Pre-Qualifier Test</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Same form fields as CreateTestModal but with pre-filled values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-silver font-medium mb-2">Test Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="cosmic-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-silver font-medium mb-2">Test Link *</label>
              <input
                type="url"
                value={formData.testLink}
                onChange={(e) => setFormData(prev => ({ ...prev, testLink: e.target.value }))}
                className="cosmic-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-silver font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="cosmic-input h-24 resize-none"
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-space-navy font-bold rounded-xl hover:scale-105 transform transition-all duration-300"
            >
              Update Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
