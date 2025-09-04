import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface EventAnalyticsModalProps {
  onClose: () => void;
  organizerId?: string;
}

export function EventAnalyticsModal({ onClose, organizerId }: EventAnalyticsModalProps) {
  const events = useQuery(api.events.list, {});
  const myEvents = events?.filter(event => event.organizerId === organizerId) || [];
  const registrationStats = useQuery(api.participantRegistrations.getRegistrationStats);

  // Calculate analytics data
  const totalEvents = myEvents.length;
  const publishedEvents = myEvents.filter(e => e.status === 'published').length;
  const ongoingEvents = myEvents.filter(e => e.status === 'ongoing').length;
  const completedEvents = myEvents.filter(e => e.status === 'completed').length;
  const draftEvents = myEvents.filter(e => e.status === 'draft').length;

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-medium-blue/30">
          <div>
            <h2 className="text-3xl font-bold text-silver mb-2">
              📊 Event Analytics Dashboard
            </h2>
            <p className="text-silver/70">
              Comprehensive insights into your event performance
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
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <span className="text-2xl font-bold text-silver">{totalEvents}</span>
              </div>
              <h3 className="text-silver font-semibold mb-1">Total Events</h3>
              <p className="text-silver/60 text-sm">All events created</p>
            </div>

            <div className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-stellar-blue to-cosmic-purple rounded-xl flex items-center justify-center">
                  <span className="text-xl">🚀</span>
                </div>
                <span className="text-2xl font-bold text-silver">{publishedEvents}</span>
              </div>
              <h3 className="text-silver font-semibold mb-1">Published Events</h3>
              <p className="text-silver/60 text-sm">Live and accepting registrations</p>
            </div>

            <div className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-nebula-pink to-cosmic-purple rounded-xl flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-2xl font-bold text-silver">{ongoingEvents}</span>
              </div>
              <h3 className="text-silver font-semibold mb-1">Ongoing Events</h3>
              <p className="text-silver/60 text-sm">Currently in progress</p>
            </div>

            <div className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-electric-blue rounded-xl flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <span className="text-2xl font-bold text-silver">{completedEvents}</span>
              </div>
              <h3 className="text-silver font-semibold mb-1">Completed Events</h3>
              <p className="text-silver/60 text-sm">Successfully finished</p>
            </div>
          </div>

          {/* Event Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-silver mb-4 flex items-center gap-2">
                <span>📈</span> Event Status Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-silver/80">Published</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-medium-blue/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-stellar-blue to-cosmic-purple rounded-full"
                        style={{ width: `${totalEvents > 0 ? (publishedEvents / totalEvents) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-silver font-semibold">{publishedEvents}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-silver/80">Ongoing</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-medium-blue/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-nebula-pink to-cosmic-purple rounded-full"
                        style={{ width: `${totalEvents > 0 ? (ongoingEvents / totalEvents) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-silver font-semibold">{ongoingEvents}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-silver/80">Completed</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-medium-blue/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-supernova-gold to-plasma-orange rounded-full"
                        style={{ width: `${totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-silver font-semibold">{completedEvents}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-silver/80">Draft</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-medium-blue/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent-blue to-electric-blue rounded-full"
                        style={{ width: `${totalEvents > 0 ? (draftEvents / totalEvents) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-silver font-semibold">{draftEvents}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-silver mb-4 flex items-center gap-2">
                <span>👥</span> Registration Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-medium-blue/20 rounded-lg">
                  <span className="text-silver/80">Total Registrations</span>
                  <span className="text-silver font-bold text-lg">{registrationStats?.totalRegistrations || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-medium-blue/20 rounded-lg">
                  <span className="text-silver/80">Unique Colleges</span>
                  <span className="text-silver font-bold text-lg">{registrationStats?.uniqueColleges || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-medium-blue/20 rounded-lg">
                  <span className="text-silver/80">Team Leaders</span>
                  <span className="text-silver font-bold text-lg">{registrationStats?.teamLeaders || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-medium-blue/20 rounded-lg">
                  <span className="text-silver/80">Team Members</span>
                  <span className="text-silver font-bold text-lg">{registrationStats?.teamMembers || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-silver mb-4 flex items-center gap-2">
              <span>🎪</span> Recent Events
            </h3>
            {myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.slice(0, 5).map((event) => (
                  <div key={event._id} className="flex items-center justify-between p-4 bg-medium-blue/20 rounded-lg">
                    <div>
                      <h4 className="text-silver font-semibold">{event.title}</h4>
                      <p className="text-silver/60 text-sm">{event.category}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.status === 'published' ? 'bg-stellar-blue/30 text-stellar-blue' :
                        event.status === 'ongoing' ? 'bg-nebula-pink/30 text-nebula-pink' :
                        event.status === 'completed' ? 'bg-supernova-gold/30 text-supernova-gold' :
                        'bg-medium-blue/30 text-silver/70'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-silver/60">No events created yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
