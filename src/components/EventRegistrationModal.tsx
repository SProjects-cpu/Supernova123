import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface EventRegistrationModalProps {
  event: {
    _id: Id<"events">;
    title: string;
    registrationFee: number;
    paymentLink?: string;
  };
  onClose: () => void;
}

export function EventRegistrationModal({ event, onClose }: EventRegistrationModalProps) {
  const [formData, setFormData] = useState({
    teamName: "",
    teamMembers: [""],
    projectDescription: "",
    additionalInfo: "",
    experience: "",
    motivation: "",
    skills: [] as string[],
    portfolio: "",
    github: "",
    linkedin: "",
    website: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    },
    dietaryRestrictions: "",
    tshirtSize: "M",
    agreeToTerms: false,
    agreeToCodeOfConduct: false,
    allowPhotography: true
  });

  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const registerForEvent = useMutation(api.events.register);

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms || !formData.agreeToCodeOfConduct) {
      toast.error("Please agree to the terms and code of conduct");
      return;
    }

    try {
      await registerForEvent({
        eventId: event._id,
        isTeamLeader,
        submissionData: {
          ...formData,
          teamMembers: formData.teamMembers.filter(member => member.trim() !== "")
        }
      });

      toast.success("Registration submitted successfully! 🎉");

      // If team leader and there's a registration fee, show payment modal
      if (isTeamLeader && event.registrationFee > 0) {
        setShowPaymentModal(true);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register. Please try again.");
    }
  };

  const handlePayment = () => {
    if (event.paymentLink) {
      window.open(event.paymentLink, '_blank');
      toast.success("Redirecting to payment gateway...");
      onClose();
    } else {
      toast.error("Payment link not available. Please contact organizers.");
    }
  };

  if (showPaymentModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-space-navy via-cosmic-purple/20 to-space-navy rounded-2xl border border-white/20 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-2xl font-bold text-starlight-white mb-4">
              Complete Payment
            </h3>
            <p className="text-starlight-white/70 mb-6">
              As team leader, you need to pay the registration fee of ₹{event.registrationFee} to complete your team's registration.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-starlight-white rounded-lg transition-colors"
              >
                Pay Later
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-space-navy via-cosmic-purple/20 to-space-navy rounded-2xl border border-white/20 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-starlight-white">
            Register for {event.title}
          </h2>
          <button
            onClick={onClose}
            className="text-starlight-white/60 hover:text-starlight-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Leader Option */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isTeamLeader}
                onChange={(e) => setIsTeamLeader(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-white/10 text-supernova-gold focus:ring-supernova-gold focus:ring-2"
              />
              <span className="text-starlight-white font-medium">
                I am the team leader
                {event.registrationFee > 0 && (
                  <span className="text-supernova-gold ml-2">
                    (Responsible for payment of ₹{event.registrationFee})
                  </span>
                )}
              </span>
            </label>
          </div>

          {/* Team Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-starlight-white font-medium mb-2">Team Name</label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                placeholder="Enter team name"
              />
            </div>
            <div>
              <label className="block text-starlight-white font-medium mb-2">T-Shirt Size</label>
              <select
                value={formData.tshirtSize}
                onChange={(e) => setFormData(prev => ({ ...prev, tshirtSize: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">Team Members</label>
            {formData.teamMembers.map((member, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={member}
                  onChange={(e) => updateTeamMember(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                  placeholder={`Team member ${index + 1} name`}
                />
                {formData.teamMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTeamMember}
              className="px-4 py-2 bg-stellar-blue/20 hover:bg-stellar-blue/30 text-stellar-blue rounded-lg transition-colors"
            >
              Add Team Member
            </button>
          </div>

          {/* Agreement Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/10 text-supernova-gold focus:ring-supernova-gold focus:ring-2"
                required
              />
              <span className="text-starlight-white text-sm">
                I agree to the terms and conditions *
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeToCodeOfConduct}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeToCodeOfConduct: e.target.checked }))}
                className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/10 text-supernova-gold focus:ring-supernova-gold focus:ring-2"
                required
              />
              <span className="text-starlight-white text-sm">
                I agree to the code of conduct *
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-starlight-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
            >
              Register for Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
