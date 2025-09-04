import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CreateEventModal } from "./CreateEventModal";
import { JudgeAssignmentModal } from "./JudgeAssignmentModal";
import { JudgeManagement } from "./JudgeManagement";
import { FileManagement } from "./FileManagement";
import { RegistrationManagement } from "./RegistrationManagement";
import { ParticipantRegistrationManager } from "./ParticipantRegistrationManager";
import { PreQualifierTestManager } from "./PreQualifierTestManager";
import { Id } from "../../convex/_generated/dataModel";

interface AdminDashboardProps {
  profile: any;
  stats: any;
}

export function AdminDashboard({ profile, stats }: AdminDashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [showJudgeManagement, setShowJudgeManagement] = useState(false);
  const [showFileManagement, setShowFileManagement] = useState(false);
  const [showRegistrationManagement, setShowRegistrationManagement] = useState(false);
  const [showParticipantRegistrations, setShowParticipantRegistrations] = useState(false);
  const [showPreQualifierTests, setShowPreQualifierTests] = useState(false);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<Id<"events"> | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: Id<"events">;
    title: string;
    judges: Id<"users">[];
  } | null>(null);
  const events = useQuery(api.events.list, {});

  // Loading states
  const isLoadingEvents = events === undefined;

  // Show loading state while data is being fetched
  if (isLoadingEvents) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-silver mb-2">Loading Admin Dashboard...</h3>
            <p className="text-silver/70">Please wait while we fetch system data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-starlight-white to-supernova-gold bg-clip-text text-transparent mb-2">
            Mission Control 🚀
          </h1>
          <p className="text-starlight-white/70 text-lg">
            Welcome back, {profile.firstName}! Here's your cosmic overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: "Total Events", 
              value: stats.totalEvents, 
              icon: "🌟", 
              color: "from-supernova-gold to-plasma-orange",
              change: "+12% this month"
            },
            { 
              label: "Active Events", 
              value: stats.activeEvents, 
              icon: "🚀", 
              color: "from-stellar-blue to-cosmic-purple",
              change: "+5 this week"
            },
            { 
              label: "Total Users", 
              value: stats.totalUsers, 
              icon: "👥", 
              color: "from-nebula-pink to-cosmic-purple",
              change: "+23% this month"
            },
            { 
              label: "Registrations", 
              value: stats.totalRegistrations, 
              icon: "📝", 
              color: "from-plasma-orange to-supernova-gold",
              change: "+18% this week"
            }
          ].map((stat, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r opacity-20 rounded-2xl blur group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-supernova-gold/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{stat.icon}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${stat.color} text-space-navy`}>
                    {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold text-starlight-white mb-1">{stat.value}</div>
                <div className="text-starlight-white/70 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-starlight-white mb-4 flex items-center gap-2">
                <span>🎯</span> Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-4 bg-stellar-blue hover:bg-stellar-blue/80 text-starlight-white rounded-lg transition-all duration-300 hover:scale-105 transform flex items-center gap-3"
                >
                  <span className="text-xl">➕</span>
                  <span className="font-medium">Create Event</span>
                </button>
                <button
                  onClick={() => setShowJudgeManagement(true)}
                  className="p-4 bg-cosmic-purple hover:bg-cosmic-purple/80 text-starlight-white rounded-lg transition-all duration-300 hover:scale-105 transform flex items-center gap-3"
                >
                  <span className="text-xl">👨‍⚖️</span>
                  <span className="font-medium">Manage Judges</span>
                </button>
                <button
                  onClick={() => setShowFileManagement(true)}
                  className="p-4 bg-nebula-pink hover:bg-nebula-pink/80 text-starlight-white rounded-lg transition-all duration-300 hover:scale-105 transform flex items-center gap-3"
                >
                  <span className="text-xl">📁</span>
                  <span className="font-medium">Manage Files</span>
                </button>
                <button
                  onClick={() => setShowParticipantRegistrations(true)}
                  className="p-4 bg-plasma-orange hover:bg-plasma-orange/80 text-starlight-white rounded-lg transition-all duration-300 hover:scale-105 transform flex items-center gap-3"
                >
                  <span className="text-xl">📊</span>
                  <span className="font-medium">Participant Data</span>
                </button>
                <button
                  onClick={() => setShowPreQualifierTests(true)}
                  className="p-4 bg-cosmic-purple hover:bg-cosmic-purple/80 text-starlight-white rounded-lg transition-all duration-300 hover:scale-105 transform flex items-center gap-3"
                >
                  <span className="text-xl">🎯</span>
                  <span className="font-medium">Pre-Qualifier Tests</span>
                </button>
                {[
                  { label: "System Settings", icon: "⚙️", color: "bg-stellar-blue hover:bg-stellar-blue/80" }
                ].map((action, index) => (
                  <button
                    key={index}
                    className={`p-4 ${action.color} text-starlight-white rounded-lg transition-all duration-300 hover:scale-105 transform flex items-center gap-3`}
                  >
                    <span className="text-xl">{action.icon}</span>
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-starlight-white mb-4 flex items-center gap-2">
              <span>🔔</span> Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { action: "New event created", time: "2 min ago", type: "success" },
                { action: "User registered", time: "5 min ago", type: "info" },
                { action: "Event published", time: "10 min ago", type: "success" },
                { action: "System backup", time: "1 hour ago", type: "info" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-supernova-gold' : 'bg-stellar-blue'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-starlight-white text-sm">{activity.action}</div>
                    <div className="text-starlight-white/50 text-xs">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-starlight-white mb-6 flex items-center gap-2">
            <span>🌟</span> Recent Events
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-starlight-white/70 font-medium py-3">Event</th>
                  <th className="text-left text-starlight-white/70 font-medium py-3">Category</th>
                  <th className="text-left text-starlight-white/70 font-medium py-3">Status</th>
                  <th className="text-left text-starlight-white/70 font-medium py-3">Judges</th>
                  <th className="text-left text-starlight-white/70 font-medium py-3">Date</th>
                  <th className="text-left text-starlight-white/70 font-medium py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events?.slice(0, 5).map((event) => (
                  <tr key={event._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="text-starlight-white font-medium">{event.title}</div>
                      <div className="text-starlight-white/50 text-sm">by {event.organizer.name}</div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-cosmic-purple/30 text-starlight-white rounded text-sm">
                        {event.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        event.status === 'published' ? 'bg-supernova-gold/30 text-supernova-gold' :
                        event.status === 'ongoing' ? 'bg-stellar-blue/30 text-stellar-blue' :
                        event.status === 'completed' ? 'bg-nebula-pink/30 text-nebula-pink' :
                        'bg-white/20 text-starlight-white/70'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-starlight-white">{event.judges?.length || 0}</span>
                        <span className="text-starlight-white/50 text-sm">judges</span>
                      </div>
                    </td>
                    <td className="py-4 text-starlight-white/70">{new Date(event.startDate).toLocaleDateString()}</td>
                    <td className="py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setSelectedEvent({
                              id: event._id,
                              title: event.title,
                              judges: event.judges || []
                            });
                            setShowJudgeModal(true);
                          }}
                          className="px-3 py-1 bg-stellar-blue/30 hover:bg-stellar-blue/50 text-stellar-blue hover:text-starlight-white rounded text-sm transition-colors flex items-center gap-1"
                        >
                          <span>⚖️</span>
                          Manage Judges
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEventForRegistrations(event._id);
                            setShowRegistrationManagement(true);
                          }}
                          className="px-3 py-1 bg-supernova-gold/30 hover:bg-supernova-gold/50 text-supernova-gold hover:text-space-navy rounded text-sm transition-colors flex items-center gap-1"
                        >
                          <span>📋</span>
                          Registrations
                        </button>
                      </div>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-starlight-white/50">
                      No events found. Create your first stellar event! 🚀
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Judge Assignment Modal */}
      {showJudgeModal && selectedEvent && (
        <JudgeAssignmentModal
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          currentJudges={selectedEvent.judges}
          onClose={() => {
            setShowJudgeModal(false);
            setSelectedEvent(null);
          }}
          onUpdate={() => {
            // Refresh events data
            // The useQuery will automatically refetch
          }}
        />
      )}

      {/* Judge Management Modal */}
      {showJudgeManagement && (
        <JudgeManagement onClose={() => setShowJudgeManagement(false)} />
      )}

      {/* File Management Modal */}
      {showFileManagement && (
        <FileManagement onClose={() => setShowFileManagement(false)} />
      )}

      {/* Registration Management Modal */}
      {showRegistrationManagement && (
        <RegistrationManagement
          eventId={selectedEventForRegistrations || undefined}
          onClose={() => {
            setShowRegistrationManagement(false);
            setSelectedEventForRegistrations(null);
          }}
        />
      )}

      {/* Participant Registration Manager Modal */}
      {showParticipantRegistrations && (
        <ParticipantRegistrationManager
          onClose={() => setShowParticipantRegistrations(false)}
        />
      )}

      {/* Pre-Qualifier Test Manager Modal */}
      {showPreQualifierTests && (
        <PreQualifierTestManager
          onClose={() => setShowPreQualifierTests(false)}
          currentUserEmail={profile.email}
        />
      )}
    </div>
  );
}
