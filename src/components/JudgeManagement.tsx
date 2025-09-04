import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface JudgeManagementProps {
  onClose: () => void;
}

export function JudgeManagement({ onClose }: JudgeManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const judges = useQuery(api.events.getAvailableJudges);
  const events = useQuery(api.events.list, {});

  // Loading states
  const isLoadingJudges = judges === undefined;
  const isLoadingEvents = events === undefined;

  // Filter judges based on search term and filter
  const filteredJudges = judges?.filter(judge => {
    const matchesSearch = 
      judge.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      judge.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      judge.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      judge.organization?.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "assigned") {
      // Check if judge is assigned to any event
      const isAssigned = events?.some(event => event.judges?.includes(judge.userId));
      return matchesSearch && isAssigned;
    }
    if (selectedFilter === "unassigned") {
      // Check if judge is not assigned to any event
      const isAssigned = events?.some(event => event.judges?.includes(judge.userId));
      return matchesSearch && !isAssigned;
    }
    return matchesSearch;
  }) || [];

  const getJudgeEventCount = (judgeId: string) => {
    return events?.filter(event => event.judges?.includes(judgeId)).length || 0;
  };

  const getJudgeEvents = (judgeId: string) => {
    return events?.filter(event => event.judges?.includes(judgeId)) || [];
  };

  const filters = [
    { id: "all", name: "All Judges", count: judges?.length || 0 },
    { 
      id: "assigned", 
      name: "Assigned", 
      count: judges?.filter(judge => 
        events?.some(event => event.judges?.includes(judge.userId))
      ).length || 0 
    },
    { 
      id: "unassigned", 
      name: "Unassigned", 
      count: judges?.filter(judge => 
        !events?.some(event => event.judges?.includes(judge.userId))
      ).length || 0 
    }
  ];

  // Show loading state while data is being fetched
  if (isLoadingJudges || isLoadingEvents) {
    return (
      <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-silver mb-2">Loading Judges...</h3>
          <p className="text-silver/70">Please wait while we fetch judge information</p>
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
              👨‍⚖️ Judge Management
            </h2>
            <p className="text-silver/70">
              Manage all judges in the system and their event assignments
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
                placeholder="Search judges by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-silver/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedFilter === filter.id
                    ? "bg-gradient-to-r from-accent-blue to-electric-blue text-silver shadow-lg shadow-accent-blue/30"
                    : "bg-dark-blue/50 text-silver/70 hover:bg-dark-blue/70 hover:text-silver border border-medium-blue/30 hover:border-accent-blue/50"
                }`}
              >
                {filter.name} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Judge List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredJudges.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-silver">
                  {filteredJudges.length} Judge{filteredJudges.length !== 1 ? 's' : ''} Found
                </h3>
                <div className="text-silver/60 text-sm">
                  {searchTerm && `Searching for "${searchTerm}"`}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJudges.map((judge) => {
                  const eventCount = getJudgeEventCount(judge.userId);
                  const judgeEvents = getJudgeEvents(judge.userId);
                  
                  return (
                    <div
                      key={judge.userId}
                      className="p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-electric-blue rounded-full flex items-center justify-center font-bold text-xl text-silver">
                          {judge.firstName[0]}{judge.lastName[0]}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-lg font-bold text-silver">
                                {judge.firstName} {judge.lastName}
                              </h4>
                              <p className="text-silver/70 text-sm">
                                {judge.user.email}
                              </p>
                              {judge.organization && (
                                <p className="text-silver/60 text-xs mt-1">
                                  {judge.organization}
                                </p>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                eventCount > 0 
                                  ? "bg-accent-blue/20 text-accent-blue" 
                                  : "bg-medium-blue/20 text-silver/60"
                              }`}>
                                {eventCount} event{eventCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          
                          {judge.bio && (
                            <p className="text-silver/70 text-sm mb-3 line-clamp-2">
                              {judge.bio}
                            </p>
                          )}
                          
                          {judge.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {judge.skills.slice(0, 4).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-medium-blue/30 text-silver/80 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {judge.skills.length > 4 && (
                                <span className="text-silver/60 text-xs px-2 py-1">
                                  +{judge.skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                          
                          {judgeEvents.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-medium-blue/20">
                              <h5 className="text-silver/80 text-sm font-medium mb-2">
                                Assigned Events:
                              </h5>
                              <div className="space-y-1">
                                {judgeEvents.slice(0, 3).map((event) => (
                                  <div key={event._id} className="flex items-center justify-between text-xs">
                                    <span className="text-silver/70 truncate">{event.title}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      event.status === 'published' ? 'bg-supernova-gold/20 text-supernova-gold' :
                                      event.status === 'ongoing' ? 'bg-stellar-blue/20 text-stellar-blue' :
                                      event.status === 'completed' ? 'bg-nebula-pink/20 text-nebula-pink' :
                                      'bg-medium-blue/20 text-silver/60'
                                    }`}>
                                      {event.status}
                                    </span>
                                  </div>
                                ))}
                                {judgeEvents.length > 3 && (
                                  <div className="text-silver/60 text-xs">
                                    +{judgeEvents.length - 3} more events
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍⚖️</div>
              <h4 className="text-xl font-bold text-silver mb-2">
                {searchTerm ? "No Judges Found" : "No Judges Available"}
              </h4>
              <p className="text-silver/70 mb-6">
                {searchTerm 
                  ? "Try adjusting your search criteria." 
                  : "No users with judge role found in the system."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-silver font-medium rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-medium-blue/30 bg-dark-blue/30">
          <div className="flex items-center justify-between">
            <div className="text-silver/60 text-sm">
              Total: {judges?.length || 0} judges • Assigned: {filters[1]?.count || 0} • Unassigned: {filters[2]?.count || 0}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-medium-blue/40 hover:bg-medium-blue/60 text-silver font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
