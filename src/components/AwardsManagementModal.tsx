import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AwardsManagementModalProps {
  onClose: () => void;
  organizerId?: string;
}

export function AwardsManagementModal({ onClose, organizerId }: AwardsManagementModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [showAddAward, setShowAddAward] = useState(false);
  const [newAward, setNewAward] = useState({
    position: "",
    prize: "",
    amount: "",
    description: ""
  });

  const events = useQuery(api.events.list, {});
  const myEvents = events?.filter(event => event.organizerId === organizerId) || [];

  const awardTemplates = [
    { position: "1st Place", prize: "Winner Trophy + Cash Prize", amount: 50000, icon: "🥇" },
    { position: "2nd Place", prize: "Runner-up Trophy + Cash Prize", amount: 30000, icon: "🥈" },
    { position: "3rd Place", prize: "Third Place Trophy + Cash Prize", amount: 20000, icon: "🥉" },
    { position: "Best Innovation", prize: "Innovation Award + Mentorship", amount: 15000, icon: "💡" },
    { position: "Best Design", prize: "Design Excellence Award", amount: 10000, icon: "🎨" },
    { position: "People's Choice", prize: "Popular Vote Award", amount: 5000, icon: "❤️" }
  ];

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-medium-blue/30">
          <div>
            <h2 className="text-3xl font-bold text-silver mb-2">
              🏆 Awards & Prizes Management
            </h2>
            <p className="text-silver/70">
              Manage awards, prizes, and recognition for your events
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Event Selection */}
          <div className="mb-6">
            <label className="block text-silver font-semibold mb-2">Select Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded-lg text-silver focus:outline-none focus:border-accent-blue/50"
            >
              <option value="all">All Events</option>
              {myEvents.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setShowAddAward(true)}
              className="p-4 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy rounded-xl hover:scale-105 transform transition-all duration-300 font-bold flex items-center gap-2"
            >
              <span>➕</span> Add Custom Award
            </button>
            <button className="p-4 bg-stellar-blue hover:bg-stellar-blue/80 text-silver rounded-xl transition-colors font-medium flex items-center gap-2">
              <span>📊</span> Award Analytics
            </button>
            <button className="p-4 bg-nebula-pink hover:bg-nebula-pink/80 text-silver rounded-xl transition-colors font-medium flex items-center gap-2">
              <span>🎖️</span> Generate Certificates
            </button>
          </div>

          {/* Award Templates */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-silver mb-4 flex items-center gap-2">
              <span>🎯</span> Award Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {awardTemplates.map((template, index) => (
                <div
                  key={index}
                  className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl p-4 hover:border-accent-blue/40 transition-all duration-300 hover:scale-105 transform cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-lg flex items-center justify-center text-lg">
                      {template.icon}
                    </div>
                    <div>
                      <h4 className="text-silver font-bold">{template.position}</h4>
                      <p className="text-silver/60 text-sm">₹{template.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-silver/70 text-sm mb-3">{template.prize}</p>
                  <button className="w-full px-3 py-2 bg-accent-blue hover:bg-accent-blue/80 text-silver rounded-lg transition-colors text-sm font-medium">
                    Add to Event
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Awards */}
          <div className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-silver mb-4 flex items-center gap-2">
              <span>🏅</span> Current Awards
            </h3>
            
            {selectedEvent === "all" ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-silver/60">Select a specific event to view its awards</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sample awards - in real implementation, this would come from the selected event */}
                <div className="flex items-center justify-between p-4 bg-medium-blue/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥇</span>
                    <div>
                      <h4 className="text-silver font-semibold">1st Place</h4>
                      <p className="text-silver/60 text-sm">Winner Trophy + ₹50,000</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-stellar-blue hover:bg-stellar-blue/80 text-silver rounded text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm">
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-medium-blue/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥈</span>
                    <div>
                      <h4 className="text-silver font-semibold">2nd Place</h4>
                      <p className="text-silver/60 text-sm">Runner-up Trophy + ₹30,000</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-stellar-blue hover:bg-stellar-blue/80 text-silver rounded text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm">
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-center py-4">
                  <button
                    onClick={() => setShowAddAward(true)}
                    className="px-6 py-2 border-2 border-dashed border-accent-blue/40 text-accent-blue rounded-lg hover:bg-accent-blue/10 transition-colors"
                  >
                    + Add More Awards
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Award Modal */}
        {showAddAward && (
          <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-silver mb-4">Add Custom Award</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-silver/80 text-sm mb-2">Position/Title</label>
                  <input
                    type="text"
                    value={newAward.position}
                    onChange={(e) => setNewAward(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded-lg text-silver focus:outline-none focus:border-accent-blue/50"
                    placeholder="e.g., Best Innovation"
                  />
                </div>
                <div>
                  <label className="block text-silver/80 text-sm mb-2">Prize Description</label>
                  <input
                    type="text"
                    value={newAward.prize}
                    onChange={(e) => setNewAward(prev => ({ ...prev, prize: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded-lg text-silver focus:outline-none focus:border-accent-blue/50"
                    placeholder="e.g., Trophy + Mentorship"
                  />
                </div>
                <div>
                  <label className="block text-silver/80 text-sm mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={newAward.amount}
                    onChange={(e) => setNewAward(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-blue/40 border border-medium-blue/30 rounded-lg text-silver focus:outline-none focus:border-accent-blue/50"
                    placeholder="e.g., 25000"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowAddAward(false)}
                    className="flex-1 px-4 py-2 border border-medium-blue/30 text-silver rounded-lg hover:bg-medium-blue/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Add award logic here
                      setShowAddAward(false);
                      setNewAward({ position: "", prize: "", amount: "", description: "" });
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy rounded-lg hover:scale-105 transform transition-all duration-300 font-bold"
                  >
                    Add Award
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
