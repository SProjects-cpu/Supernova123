import { useState } from "react";

interface EventTemplatesModalProps {
  onClose: () => void;
  onSelectTemplate?: (template: any) => void;
}

export function EventTemplatesModal({ onClose, onSelectTemplate }: EventTemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const templates = [
    {
      id: 1,
      name: "Hackathon Template",
      category: "hackathon",
      description: "Complete template for organizing hackathons with coding challenges",
      features: ["Team registration", "Project submission", "Judging criteria", "Prize distribution"],
      duration: "24-48 hours",
      participants: "50-200",
      icon: "💻"
    },
    {
      id: 2,
      name: "Workshop Template",
      category: "workshop",
      description: "Educational workshop template with hands-on learning sessions",
      features: ["Session planning", "Resource sharing", "Attendance tracking", "Feedback collection"],
      duration: "2-8 hours",
      participants: "20-100",
      icon: "🎓"
    },
    {
      id: 3,
      name: "Competition Template",
      category: "competition",
      description: "General competition template for various contest formats",
      features: ["Multiple rounds", "Scoring system", "Leaderboard", "Elimination rounds"],
      duration: "1-7 days",
      participants: "10-500",
      icon: "🏆"
    },
    {
      id: 4,
      name: "Conference Template",
      category: "conference",
      description: "Professional conference template with speaker management",
      features: ["Speaker profiles", "Session scheduling", "Networking", "Live streaming"],
      duration: "1-3 days",
      participants: "100-1000",
      icon: "🎤"
    },
    {
      id: 5,
      name: "Startup Pitch Template",
      category: "pitch",
      description: "Startup pitch competition with investor panel",
      features: ["Pitch deck submission", "Investor panel", "Funding rounds", "Mentorship"],
      duration: "4-6 hours",
      participants: "20-50",
      icon: "🚀"
    },
    {
      id: 6,
      name: "Gaming Tournament",
      category: "gaming",
      description: "Esports and gaming tournament organization template",
      features: ["Tournament brackets", "Live streaming", "Spectator mode", "Prize pools"],
      duration: "1-3 days",
      participants: "16-128",
      icon: "🎮"
    }
  ];

  const categories = [
    { id: "all", name: "All Templates", icon: "📋" },
    { id: "hackathon", name: "Hackathons", icon: "💻" },
    { id: "workshop", name: "Workshops", icon: "🎓" },
    { id: "competition", name: "Competitions", icon: "🏆" },
    { id: "conference", name: "Conferences", icon: "🎤" },
    { id: "pitch", name: "Pitch Events", icon: "🚀" },
    { id: "gaming", name: "Gaming", icon: "🎮" }
  ];

  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-medium-blue/30">
          <div>
            <h2 className="text-3xl font-bold text-silver mb-2">
              📋 Event Templates
            </h2>
            <p className="text-silver/70">
              Choose from pre-built templates to quickly create your events
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

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Categories */}
          <div className="w-64 border-r border-medium-blue/30 p-6">
            <h3 className="text-lg font-bold text-silver mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                    selectedCategory === category.id
                      ? "bg-accent-blue/30 text-accent-blue border border-accent-blue/40"
                      : "text-silver/70 hover:bg-medium-blue/20 hover:text-silver"
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content - Templates */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6 hover:border-accent-blue/40 transition-all duration-300 hover:scale-105 transform"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-electric-blue rounded-xl flex items-center justify-center text-xl">
                        {template.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-silver">{template.name}</h4>
                        <span className="text-accent-blue text-sm font-medium capitalize">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-silver/70 text-sm mb-4">{template.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-medium-blue/20 rounded-lg p-3">
                      <span className="text-silver/60 text-xs">Duration</span>
                      <p className="text-silver font-semibold">{template.duration}</p>
                    </div>
                    <div className="bg-medium-blue/20 rounded-lg p-3">
                      <span className="text-silver/60 text-xs">Participants</span>
                      <p className="text-silver font-semibold">{template.participants}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-silver font-semibold mb-2 text-sm">Features Included:</h5>
                    <div className="space-y-1">
                      {template.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-silver/70 text-sm">
                          <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-silver rounded-lg transition-colors text-sm font-medium">
                      Preview
                    </button>
                    <button 
                      onClick={() => {
                        if (onSelectTemplate) {
                          onSelectTemplate(template);
                        }
                        onClose();
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy rounded-lg hover:scale-105 transform transition-all duration-300 text-sm font-bold"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-silver mb-2">No Templates Found</h3>
                <p className="text-silver/70">Try selecting a different category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
