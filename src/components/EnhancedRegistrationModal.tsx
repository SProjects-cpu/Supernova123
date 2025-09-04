import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { FileUpload } from "./FileUpload";

interface EnhancedRegistrationModalProps {
  event: any;
  onClose: () => void;
}

export function EnhancedRegistrationModal({ event, onClose }: EnhancedRegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<Id<"files">[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [formData, setFormData] = useState({
    // Basic Information
    teamName: "",
    teamMembers: [""],
    projectDescription: "",
    
    // Experience & Skills
    experience: "",
    motivation: "",
    skills: [] as string[],
    
    // Portfolio & Links
    portfolio: "",
    github: "",
    linkedin: "",
    website: "",
    
    // Personal Information
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    },
    dietaryRestrictions: "",
    tshirtSize: "M",
    
    // Agreements
    agreeToTerms: false,
    agreeToCodeOfConduct: false,
    allowPhotography: true,
    
    // Additional
    additionalInfo: ""
  });

  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const register = useMutation(api.events.register);

  // Handle initialization loading state
  useEffect(() => {
    if (event) {
      // Show loading for a brief moment for better UX
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [event]);

  const steps = [
    { id: 1, title: "Basic Info", icon: "📝" },
    { id: 2, title: "Experience", icon: "🎯" },
    { id: 3, title: "Portfolio", icon: "🎨" },
    { id: 4, title: "Personal", icon: "👤" },
    { id: 5, title: "Files", icon: "📎" },
    { id: 6, title: "Review", icon: "✅" }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await register({
        eventId: event._id,
        isTeamLeader: true, // Assuming the person registering is the team leader
        submissionData: {
          ...formData,
          teamMembers: formData.teamMembers.filter(member => member.trim())
        },
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined
      });
      
      toast.success("Registration submitted successfully! 🌟");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, ""]
    }));
  };

  const updateTeamMember = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => i === index ? value : member)
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          formData.teamName.trim() &&
          formData.projectDescription.trim() &&
          (formData.teamMembers.length === 0 || formData.teamMembers.some(member => member.trim() !== ""))
        );
      case 2:
        return formData.experience.trim() && formData.motivation.trim();
      case 3:
        return true; // Portfolio step is optional
      case 4:
        return formData.emergencyContact.name.trim() && 
               formData.emergencyContact.phone.trim() && 
               formData.emergencyContact.relationship.trim();
      case 5:
        return true; // File upload is optional
      case 6:
        return formData.agreeToTerms && formData.agreeToCodeOfConduct;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-silver mb-4">Basic Information</h3>
            
            <div>
              <label className="block text-silver font-medium mb-2">Team Name *</label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="Enter your team name"
              />
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">Team Members</label>
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => updateTeamMember(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue outline-none transition-all"
                    placeholder={`Team member ${index + 1}`}
                  />
                  {formData.teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTeamMember}
                className="px-4 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors text-sm"
              >
                + Add Team Member
              </button>
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">Project Description *</label>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-32 resize-none"
                placeholder="Describe your project idea or what you plan to work on..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-silver mb-4">Experience & Skills</h3>
            
            <div>
              <label className="block text-silver font-medium mb-2">Previous Experience *</label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-32 resize-none"
                placeholder="Tell us about your relevant experience, projects, or background..."
              />
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">Motivation *</label>
              <textarea
                value={formData.motivation}
                onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-32 resize-none"
                placeholder="Why do you want to participate in this event? What are your goals?"
              />
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">Skills</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue outline-none transition-all"
                  placeholder="Add a skill (e.g., React, Python, Design)"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-silver rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-accent-blue/70 hover:text-accent-blue"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-silver mb-4">Portfolio & Links</h3>

            <div>
              <label className="block text-silver font-medium mb-2">Portfolio URL</label>
              <input
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="https://your-portfolio.com"
              />
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">GitHub Profile</label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">LinkedIn Profile</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">Personal Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="https://your-website.com"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-silver mb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-silver font-medium mb-2">Emergency Contact Name *</label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-silver font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-silver font-medium mb-2">Relationship *</label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                  placeholder="Parent, Spouse, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-silver font-medium mb-2">T-Shirt Size</label>
                <select
                  value={formData.tshirtSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, tshirtSize: e.target.value }))}
                  className="cosmic-select"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <div>
                <label className="block text-silver font-medium mb-2">Dietary Restrictions</label>
                <input
                  type="text"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                  placeholder="Vegetarian, Vegan, Allergies, etc."
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-silver mb-4">Upload Files</h3>
            <p className="text-silver/70 mb-6">
              Upload any supporting documents like your resume, portfolio, or project files.
            </p>

            <FileUpload
              eventId={event._id}
              category="document"
              onFileUploaded={(fileId) => setUploadedFiles(prev => [...prev, fileId])}
              maxFiles={5}
              className="mb-6"
            />

            {uploadedFiles.length > 0 && (
              <div className="p-4 bg-dark-blue/30 rounded-xl border border-medium-blue/20">
                <h4 className="text-silver font-medium mb-2">Uploaded Files ({uploadedFiles.length})</h4>
                <p className="text-silver/60 text-sm">
                  Files have been uploaded successfully and will be included with your registration.
                </p>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-silver mb-4">Review & Submit</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                  className="w-5 h-5 text-accent-blue bg-dark-blue border-medium-blue rounded focus:ring-accent-blue mt-1"
                />
                <label htmlFor="terms" className="text-silver text-sm">
                  I agree to the <span className="text-accent-blue hover:underline cursor-pointer">Terms and Conditions</span> *
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="conduct"
                  checked={formData.agreeToCodeOfConduct}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreeToCodeOfConduct: e.target.checked }))}
                  className="w-5 h-5 text-accent-blue bg-dark-blue border-medium-blue rounded focus:ring-accent-blue mt-1"
                />
                <label htmlFor="conduct" className="text-silver text-sm">
                  I agree to follow the <span className="text-accent-blue hover:underline cursor-pointer">Code of Conduct</span> *
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="photography"
                  checked={formData.allowPhotography}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowPhotography: e.target.checked }))}
                  className="w-5 h-5 text-accent-blue bg-dark-blue border-medium-blue rounded focus:ring-accent-blue mt-1"
                />
                <label htmlFor="photography" className="text-silver text-sm">
                  I allow photography and media coverage during the event
                </label>
              </div>
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">Additional Information</label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-24 resize-none"
                placeholder="Any additional information you'd like to share..."
              />
            </div>

            <div className="p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-xl">
              <h4 className="text-accent-blue font-medium mb-2">Registration Summary</h4>
              <div className="text-silver/80 text-sm space-y-1">
                <div>Team: {formData.teamName || "Not specified"}</div>
                <div>Members: {formData.teamMembers.filter(m => m.trim()).length}</div>
                <div>Skills: {formData.skills.length} listed</div>
                <div>Files: {uploadedFiles.length} uploaded</div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step content for step {currentStep}</div>;
    }
  };

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-silver mb-2">Loading Registration Form...</h3>
          <p className="text-silver/70">Please wait while we prepare the registration form</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-medium-blue/30">
          <div>
            <h2 className="text-2xl font-bold text-silver mb-2">
              Register for {event.title}
            </h2>
            <p className="text-silver/70">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-medium-blue/30 rounded-lg transition-colors text-silver/70 hover:text-silver"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-medium-blue/30">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep === step.id
                    ? "bg-accent-blue text-silver"
                    : currentStep > step.id
                    ? "bg-green-500 text-silver"
                    : "bg-medium-blue/30 text-silver/50"
                }`}>
                  {currentStep > step.id ? "✓" : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    currentStep > step.id ? "bg-green-500" : "bg-medium-blue/30"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-medium-blue/30 bg-dark-blue/30">
          <div className="flex justify-between">
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
              className="px-6 py-2 bg-medium-blue/40 hover:bg-medium-blue/60 text-silver font-medium rounded-lg transition-colors"
            >
              {currentStep > 1 ? "Previous" : "Cancel"}
            </button>
            
            <button
              onClick={() => {
                if (currentStep < steps.length) {
                  setCurrentStep(currentStep + 1);
                } else {
                  handleSubmit();
                }
              }}
              disabled={!canProceed || isSubmitting}
              className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center justify-center ${
                canProceed && !isSubmitting
                  ? "bg-accent-blue hover:bg-accent-blue/80 text-silver"
                  : "bg-medium-blue/20 text-silver/50 cursor-not-allowed"
              }`}
            >
              {isSubmitting && currentStep === steps.length ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : currentStep < steps.length ? (
                "Next"
              ) : (
                "Submit Registration"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
