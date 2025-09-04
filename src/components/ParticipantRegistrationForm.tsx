import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ParticipantRegistrationFormProps {
  onClose: () => void;
}

export function ParticipantRegistrationForm({ onClose }: ParticipantRegistrationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    collegeUniversity: "",
    departmentYear: "",
    contactNumber: "",
    emailId: "",
    teamName: "",
    teamSize: 1,
    roleInTeam: "Leader" as "Leader" | "Member",
    technicalSkills: "",
    previousExperience: "",
    agreeToRules: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const registerParticipant = useMutation(api.participantRegistrations.registerParticipant);
  const testNotification = useQuery(api.preQualifierTests.getUpcomingTestsNotification);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.collegeUniversity.trim()) {
      toast.error("Please enter your college/university name");
      return;
    }

    if (!formData.departmentYear.trim()) {
      toast.error("Please enter your department and year of study");
      return;
    }

    if (!formData.contactNumber.trim()) {
      toast.error("Please enter your contact number");
      return;
    }

    if (!formData.emailId.trim()) {
      toast.error("Please enter your email ID");
      return;
    }

    if (!formData.technicalSkills.trim()) {
      toast.error("Please enter your technical skills");
      return;
    }

    if (!formData.agreeToRules) {
      toast.error("Please agree to the rules and regulations");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerParticipant({
        ...formData,
        teamName: formData.teamName.trim() || undefined,
        previousExperience: formData.previousExperience.trim() || undefined
      });

      toast.success("Registration successful! 🎉 Welcome to the hackathon!");
      onClose();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-medium-blue/30">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-silver mb-1 sm:mb-2 truncate">
              🚀 Technical Fest Registration
            </h2>
            <p className="text-silver/70 text-sm sm:text-base hidden sm:block">
              Join the most exciting coding competition of the year!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-medium-blue/30 rounded-lg transition-colors text-silver/70 hover:text-silver touch-manipulation ml-2"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Test Notification Banner */}
        {testNotification && (testNotification.hasActiveTests || testNotification.hasUpcomingTests) && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-accent-blue/20 to-electric-blue/20 border border-accent-blue/30 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🎯</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-silver">Pre-Qualifier Tests Available!</h3>
                <p className="text-silver/80 text-sm">
                  {testNotification.hasActiveTests && (
                    <>
                      {testNotification.activeTestsCount} test{testNotification.activeTestsCount > 1 ? 's' : ''} currently active.
                    </>
                  )}
                  {testNotification.hasActiveTests && testNotification.hasUpcomingTests && ' '}
                  {testNotification.hasUpcomingTests && (
                    <>
                      {testNotification.upcomingTestsCount} test{testNotification.upcomingTestsCount > 1 ? 's' : ''} starting soon.
                    </>
                  )}
                  {' '}Check the Pre-Qualifier Tests section after registration!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-silver font-medium mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="Enter your full name"
              />
            </div>

            {/* College/University */}
            <div>
              <label className="block text-silver font-medium mb-2">
                College/University Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.collegeUniversity}
                onChange={(e) => handleInputChange("collegeUniversity", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="Your college or university"
              />
            </div>

            {/* Department & Year */}
            <div>
              <label className="block text-silver font-medium mb-2">
                Department & Year of Study <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.departmentYear}
                onChange={(e) => handleInputChange("departmentYear", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="e.g., Computer Science - 3rd Year"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-silver font-medium mb-2">
                Contact Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.contactNumber}
                onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="+91 9876543210"
              />
            </div>

            {/* Email ID */}
            <div>
              <label className="block text-silver font-medium mb-2">
                Email ID <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.emailId}
                onChange={(e) => handleInputChange("emailId", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Team Name */}
            <div>
              <label className="block text-silver font-medium mb-2">
                Team Name <span className="text-silver/60">(if applicable)</span>
              </label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => handleInputChange("teamName", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="Your team name"
              />
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-silver font-medium mb-2">
                Team Size <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.teamSize}
                onChange={(e) => handleInputChange("teamSize", parseInt(e.target.value))}
                className="cosmic-select"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                  <option key={size} value={size}>{size} member{size > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Role in Team */}
            <div>
              <label className="block text-silver font-medium mb-2">
                Role in Team <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.roleInTeam}
                onChange={(e) => handleInputChange("roleInTeam", e.target.value)}
                className="cosmic-select"
              >
                <option value="Leader">Team Leader</option>
                <option value="Member">Team Member</option>
              </select>
            </div>

            {/* Technical Skills */}
            <div className="md:col-span-2">
              <label className="block text-silver font-medium mb-2">
                Technical Skills <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={formData.technicalSkills}
                onChange={(e) => handleInputChange("technicalSkills", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-24 resize-none"
                placeholder="Programming languages, frameworks, tools you know (e.g., Python, React, Node.js, MongoDB, etc.)"
              />
            </div>

            {/* Previous Experience */}
            <div className="md:col-span-2">
              <label className="block text-silver font-medium mb-2">
                Previous Hackathon/Project Experience <span className="text-silver/60">(if any)</span>
              </label>
              <textarea
                value={formData.previousExperience}
                onChange={(e) => handleInputChange("previousExperience", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-24 resize-none"
                placeholder="Describe any previous hackathons, projects, or relevant experience..."
              />
            </div>

            {/* Agreement */}
            <div className="md:col-span-2">
              <div className="flex items-start gap-3 p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-xl">
                <input
                  type="checkbox"
                  id="agreeToRules"
                  checked={formData.agreeToRules}
                  onChange={(e) => handleInputChange("agreeToRules", e.target.checked)}
                  className="w-5 h-5 text-accent-blue bg-dark-blue border-medium-blue rounded focus:ring-accent-blue mt-1"
                />
                <label htmlFor="agreeToRules" className="text-silver text-sm">
                  <span className="text-red-400">*</span> I agree to the{" "}
                  <span className="text-accent-blue hover:underline cursor-pointer font-medium">
                    Rules & Regulations of the Hackathon
                  </span>{" "}
                  and understand that any violation may result in disqualification.
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-medium-blue/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-medium-blue/40 text-silver rounded-xl hover:bg-medium-blue/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.agreeToRules}
              className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                isSubmitting || !formData.agreeToRules
                  ? "bg-medium-blue/20 text-silver/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy hover:scale-105 transform"
              }`}
            >
              {isSubmitting ? "Registering..." : "Register for Hackathon 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
