import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "participant" as const,
    bio: "",
    skills: [] as string[],
    organization: "",
    socialLinks: {
      linkedin: "",
      github: "",
      twitter: ""
    }
  });
  const [skillInput, setSkillInput] = useState("");

  const createProfile = useMutation(api.profiles.createOrUpdateProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProfile(formData);
      toast.success("Profile created successfully! Welcome to Supernova Events! 🌟");
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
    }
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

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-silver to-accent-blue bg-clip-text text-transparent mb-4">
            Welcome to the Cosmos! 🚀
          </h1>
          <p className="text-silver/70 text-lg">
            Let's set up your stellar profile to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-blue/50 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-8 space-y-6 shadow-lg shadow-charcoal/20">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-silver font-medium mb-2">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all hover:border-accent-blue/60"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="block text-silver font-medium mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all hover:border-accent-blue/60"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-silver font-medium mb-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                Role *
              </span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="cosmic-select"
            >
              <option value="participant">🎯 Participant - Join and compete in events</option>
              <option value="organizer">🎪 Organizer - Create and manage events</option>
              <option value="judge">⚖️ Judge - Evaluate and score participants</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-silver font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all resize-none hover:border-accent-blue/60"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-silver font-medium mb-2">Skills</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-4 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all hover:border-accent-blue/60"
                placeholder="Add a skill..."
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-silver rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-accent-blue/30 text-silver rounded-full text-sm flex items-center gap-2 border border-accent-blue/40"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-silver/70 hover:text-silver"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Organization */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">Organization</label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
              placeholder="Your company, school, or organization"
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-starlight-white font-medium mb-4">Social Links</label>
            <div className="space-y-3">
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                placeholder="LinkedIn profile URL"
              />
              <input
                type="url"
                value={formData.socialLinks.github}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, github: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                placeholder="GitHub profile URL"
              />
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                placeholder="Twitter profile URL"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-accent-blue to-electric-blue text-silver font-bold rounded-lg hover:scale-105 transform transition-all duration-300 shadow-lg shadow-accent-blue/25 hover:shadow-accent-blue/40"
          >
            Launch Into the Cosmos! 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
