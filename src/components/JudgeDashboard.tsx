import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface JudgeDashboardProps {
  profile: any;
  stats: any;
}

export function JudgeDashboard({ profile, stats }: JudgeDashboardProps) {
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const events = useQuery(api.events.list, {});
  const assignedEvents = events?.filter(event => 
    event.judges?.some((judge: any) => judge.email === profile.email)
  ) || [];

  // Loading states
  const isLoadingEvents = events === undefined;

  // Show loading state while data is being fetched
  if (isLoadingEvents) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-silver mb-2">Loading Judge Dashboard...</h3>
            <p className="text-silver/70">Please wait while we fetch your assigned events</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-starlight-white to-electric-blue bg-clip-text text-transparent mb-2">
              Judge Command Center ⚖️
            </h1>
            <p className="text-starlight-white/70 text-lg">
              Welcome back, {profile.firstName}! Ready to evaluate stellar projects?
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-starlight-white/70 text-sm">Assigned Events</p>
                <p className="text-3xl font-bold text-starlight-white">{assignedEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-blue rounded-xl flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-starlight-white/70 text-sm">Pending Reviews</p>
                <p className="text-3xl font-bold text-starlight-white">
                  {assignedEvents.filter(event => event.status === 'ongoing').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-nebula-pink to-cosmic-purple rounded-xl flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-starlight-white/70 text-sm">Completed Reviews</p>
                <p className="text-3xl font-bold text-starlight-white">
                  {assignedEvents.filter(event => event.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-xl flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-starlight-white mb-4 flex items-center gap-2">
            <span>🚀</span> Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-electric-blue/50 transition-all duration-300 hover:scale-105 transform cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-blue rounded-xl flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Review Submissions</h4>
                  <p className="text-starlight-white/70 text-sm">Evaluate participant projects</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-electric-blue hover:bg-electric-blue/80 text-starlight-white rounded-lg transition-colors text-sm font-medium">
                Start Reviewing
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-nebula-pink/50 transition-all duration-300 hover:scale-105 transform cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-nebula-pink to-cosmic-purple rounded-xl flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Scoring Criteria</h4>
                  <p className="text-starlight-white/70 text-sm">View evaluation guidelines</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-nebula-pink hover:bg-nebula-pink/80 text-starlight-white rounded-lg transition-colors text-sm font-medium">
                View Criteria
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-supernova-gold/50 transition-all duration-300 hover:scale-105 transform cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Leaderboard</h4>
                  <p className="text-starlight-white/70 text-sm">View current rankings</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-supernova-gold hover:bg-supernova-gold/80 text-space-navy rounded-lg transition-colors text-sm font-medium">
                View Rankings
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-stellar-blue/50 transition-all duration-300 hover:scale-105 transform cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-stellar-blue to-cosmic-purple rounded-xl flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Judge Notes</h4>
                  <p className="text-starlight-white/70 text-sm">Add evaluation comments</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-stellar-blue hover:bg-stellar-blue/80 text-starlight-white rounded-lg transition-colors text-sm font-medium">
                Manage Notes
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-accent-blue/50 transition-all duration-300 hover:scale-105 transform cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-electric-blue rounded-xl flex items-center justify-center">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Analytics</h4>
                  <p className="text-starlight-white/70 text-sm">View judging statistics</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-starlight-white rounded-lg transition-colors text-sm font-medium">
                View Analytics
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-plasma-orange/50 transition-all duration-300 hover:scale-105 transform cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-plasma-orange to-supernova-gold rounded-xl flex items-center justify-center">
                  <span className="text-xl">⏰</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-starlight-white">Schedule</h4>
                  <p className="text-starlight-white/70 text-sm">View judging timeline</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-plasma-orange hover:bg-plasma-orange/80 text-space-navy rounded-lg transition-colors text-sm font-medium">
                View Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Assigned Events */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-starlight-white mb-6 flex items-center gap-2">
            <span>🎯</span> Your Assigned Events
          </h3>
          
          {assignedEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignedEvents.map((event: any) => (
                <div key={event._id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-electric-blue/50 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-starlight-white mb-1">{event.title}</h4>
                      <p className="text-starlight-white/70 text-sm">by {event.organizer?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === 'published' ? 'bg-supernova-gold/30 text-supernova-gold' :
                      event.status === 'ongoing' ? 'bg-stellar-blue/30 text-stellar-blue' :
                      event.status === 'completed' ? 'bg-nebula-pink/30 text-nebula-pink' :
                      'bg-white/20 text-starlight-white/70'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="text-starlight-white/70 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventDetails(true);
                      }}
                      className="flex-1 px-4 py-2 bg-electric-blue hover:bg-electric-blue/80 text-starlight-white rounded-lg transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {event.status === 'ongoing' && (
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy rounded-lg hover:scale-105 transform transition-all duration-300 text-sm font-bold">
                        Start Judging
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚖️</div>
              <h4 className="text-xl font-bold text-starlight-white mb-2">No Events Assigned Yet</h4>
              <p className="text-starlight-white/70 mb-6">
                You'll see events here once organizers assign you as a judge.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
