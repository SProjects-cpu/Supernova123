import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { EventCard } from "./EventCard";
import { EventCardSkeleton } from "./EventCardSkeleton";

interface EventsExplorerProps {
  onClose: () => void;
}

export function EventsExplorer({ onClose }: EventsExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const events = useQuery(api.events.list, { 
    category: selectedCategory || undefined,
    status: "published" 
  });

  // Loading states
  const isLoadingEvents = events === undefined;

  const categories = [
    { id: "", name: "All Events", icon: "🌟" },
    { id: "hackathon", name: "Hackathons", icon: "💻" },
    { id: "competition", name: "Competitions", icon: "🏆" },
    { id: "workshop", name: "Workshops", icon: "🛠️" },
    { id: "conference", name: "Conferences", icon: "🎤" },
    { id: "networking", name: "Networking", icon: "🤝" }
  ];

  // Filter events based on search term
  const filteredEvents = events?.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Show loading state while data is being fetched
  if (isLoadingEvents) {
    return (
      <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-silver mb-2">Loading Events...</h3>
          <p className="text-silver/70">Please wait while we fetch the latest events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-medium-blue/30">
          <div>
            <h2 className="text-3xl font-bold text-silver mb-2">
              🌌 Explore Stellar Events
            </h2>
            <p className="text-silver/70">
              Discover amazing events happening in the cosmic community
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

        {/* Filters and Search */}
        <div className="p-6 border-b border-medium-blue/30">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-silver/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-accent-blue to-electric-blue text-silver shadow-lg shadow-accent-blue/30"
                    : "bg-dark-blue/50 text-silver/70 hover:bg-dark-blue/70 hover:text-silver border border-medium-blue/30 hover:border-accent-blue/50"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {events === undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-silver">
                  {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Found
                </h3>
                <div className="text-silver/60 text-sm">
                  {searchTerm && `Searching for "${searchTerm}"`}
                  {selectedCategory && categories.find(c => c.id === selectedCategory)?.name !== "All Events" &&
                    ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event._id} event={event} showRegisterButton />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔭</div>
              <h4 className="text-xl font-bold text-silver mb-2">
                {searchTerm || selectedCategory ? "No Events Found" : "No Events Available"}
              </h4>
              <p className="text-silver/70 mb-6">
                {searchTerm || selectedCategory
                  ? "Try adjusting your search criteria or browse all events."
                  : "Check back soon for new stellar events to explore!"}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                  }}
                  className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-silver font-medium rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-medium-blue/30 bg-dark-blue/30">
          <div className="flex items-center justify-between">
            <div className="text-silver/60 text-sm">
              Showing {filteredEvents.length} of {events?.length || 0} total events
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-medium-blue/40 hover:bg-medium-blue/60 text-silver font-medium rounded-lg transition-colors"
            >
              Close Explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
