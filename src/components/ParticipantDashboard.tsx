import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { EventCard } from "./EventCard";

interface ParticipantDashboardProps {
  profile: any;
  stats: any;
}

export function ParticipantDashboard({ profile, stats }: ParticipantDashboardProps) {
  const events = useQuery(api.events.list, { status: "published" });

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-starlight-white to-supernova-gold bg-clip-text text-transparent mb-2">
            Stellar Explorer 🌌
          </h1>
          <p className="text-starlight-white/70 text-lg">
            Welcome back, {profile.firstName}! Discover amazing events and showcase your talents.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { 
              label: "Registered Events", 
              value: stats.registeredEvents || 0, 
              icon: "🎫", 
              color: "from-supernova-gold to-plasma-orange"
            },
            { 
              label: "Pending Applications", 
              value: stats.pendingRegistrations || 0, 
              icon: "⏳", 
              color: "from-stellar-blue to-cosmic-purple"
            },
            { 
              label: "Approved Events", 
              value: stats.approvedRegistrations || 0, 
              icon: "✅", 
              color: "from-nebula-pink to-cosmic-purple"
            }
          ].map((stat, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r opacity-20 rounded-2xl blur group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-supernova-gold/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-starlight-white mb-1">{stat.value}</div>
                <div className="text-starlight-white/70 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Available Events */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-starlight-white mb-6 flex items-center gap-2">
            <span>🌟</span> Discover Events
          </h3>
          
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 6).map((event) => (
                <EventCard key={event._id} event={event} showRegisterButton />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="text-6xl mb-4">🔭</div>
              <h4 className="text-xl font-bold text-starlight-white mb-2">No Events Available</h4>
              <p className="text-starlight-white/70">
                Check back soon for new stellar events to join!
              </p>
            </div>
          )}
        </div>

        {/* My Registrations */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-starlight-white mb-6 flex items-center gap-2">
            <span>🎪</span> My Registrations
          </h3>
          
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚀</div>
            <p className="text-starlight-white/70">
              Your event registrations will appear here once you join some events!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
