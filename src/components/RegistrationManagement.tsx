import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface RegistrationManagementProps {
  eventId?: Id<"events">;
  onClose: () => void;
}

export function RegistrationManagement({ eventId, onClose }: RegistrationManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<string>(eventId || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const events = useQuery(api.events.list, {});
  const updateRegistrationStatus = useMutation(api.events.updateRegistrationStatus);

  // Get registrations for selected event or all events
  const eventRegistrations = selectedEvent === "all" 
    ? events?.map(event => useQuery(api.events.getRegistrations, { eventId: event._id })).filter(Boolean).flat().filter(Boolean) || []
    : useQuery(api.events.getRegistrations, { eventId: selectedEvent as Id<"events"> }) || [];

  // Loading states
  const isLoadingEvents = events === undefined;
  const isLoadingRegistrations = eventRegistrations === undefined;

  const statusFilters = [
    { id: "all", name: "All Registrations", count: eventRegistrations.length, color: "bg-medium-blue/20 text-silver" },
    { 
      id: "pending", 
      name: "Pending Review", 
      count: eventRegistrations.filter(r => r && r.status === "pending").length,
      color: "bg-yellow-500/20 text-yellow-400"
    },
    { 
      id: "approved", 
      name: "Approved", 
      count: eventRegistrations.filter(r => r && r.status === "approved").length,
      color: "bg-green-500/20 text-green-400"
    },
    { 
      id: "rejected", 
      name: "Rejected", 
      count: eventRegistrations.filter(r => r && r.status === "rejected").length,
      color: "bg-red-500/20 text-red-400"
    }
  ];

  // Filter registrations
  const filteredRegistrations = eventRegistrations.filter(registration => {
    if (!registration) return false;
    
    const matchesSearch = 
      registration.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.participant?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.submissionData?.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.submissionData?.projectDescription?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === "all" || registration.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (registrationId: Id<"registrations">, status: "approved" | "rejected") => {
    try {
      await updateRegistrationStatus({
        registrationId,
        status,
        reviewNotes: reviewNotes.trim() || undefined
      });
      
      toast.success(`Registration ${status} successfully!`);
      setSelectedRegistration(null);
      setReviewNotes("");
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} registration`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "approved": return "bg-green-500/20 text-green-400";
      case "rejected": return "bg-red-500/20 text-red-400";
      default: return "bg-medium-blue/20 text-silver";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return "⏳";
      case "approved": return "✅";
      case "rejected": return "❌";
      default: return "📋";
    }
  };

  // Show loading state while data is being fetched
  if (isLoadingEvents || isLoadingRegistrations) {
    return (
      <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-silver mb-2">Loading Registration Data...</h3>
          <p className="text-silver/70">Please wait while we fetch the latest registrations</p>
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
              📋 Registration Management
            </h2>
            <p className="text-silver/70">
              Review and manage participant registrations
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
                placeholder="Search by participant name, email, team name, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-silver/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Event Filter */}
          {!eventId && (
            <div className="mb-6">
              <label className="block text-silver/80 text-sm font-medium mb-2">Filter by Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="cosmic-select max-w-md"
              >
                <option value="all">🌟 All Events</option>
                {events?.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-3">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedStatus(filter.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedStatus === filter.id
                    ? "bg-gradient-to-r from-accent-blue to-electric-blue text-silver shadow-lg shadow-accent-blue/30"
                    : `${filter.color} hover:bg-opacity-80 border border-medium-blue/30 hover:border-accent-blue/50`
                }`}
              >
                {filter.name} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Registration List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredRegistrations.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-silver">
                  {filteredRegistrations.length} Registration{filteredRegistrations.length !== 1 ? 's' : ''} Found
                </h3>
                <div className="text-silver/60 text-sm">
                  {searchTerm && `Searching for "${searchTerm}"`}
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredRegistrations.map((registration) => {
                  if (!registration) return null;
                  
                  return (
                  <div
                    key={registration._id}
                    className="p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-electric-blue rounded-full flex items-center justify-center font-bold text-lg text-silver">
                          {registration.participant?.profile?.firstName?.[0] || registration.participant?.name?.[0] || "P"}
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-bold text-silver">
                            {registration.participant?.profile?.firstName} {registration.participant?.profile?.lastName} 
                            {!registration.participant?.profile && registration.participant?.name}
                          </h4>
                          <p className="text-silver/70 text-sm">{registration.participant?.email}</p>
                          {registration.submissionData?.teamName && (
                            <p className="text-accent-blue text-sm font-medium mt-1">
                              Team: {registration.submissionData.teamName}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(registration.status)}`}>
                          {getStatusIcon(registration.status)} {registration.status}
                        </span>
                        <div className="text-silver/60 text-xs text-right">
                          <div>Registered: {new Date(registration.registeredAt).toLocaleDateString()}</div>
                          {registration.reviewedAt && (
                            <div>Reviewed: {new Date(registration.reviewedAt).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {registration.submissionData?.projectDescription && (
                      <div className="mb-4 p-3 bg-dark-blue/30 rounded-lg">
                        <h5 className="text-silver/80 text-sm font-medium mb-2">Project Description:</h5>
                        <p className="text-silver/70 text-sm line-clamp-3">
                          {registration.submissionData.projectDescription}
                        </p>
                      </div>
                    )}

                    {registration.submissionData?.skills && registration.submissionData.skills.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-silver/80 text-sm font-medium mb-2">Skills:</h5>
                        <div className="flex flex-wrap gap-2">
                          {registration.submissionData.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-medium-blue/30 text-silver/80 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {registration.submissionData.skills.length > 5 && (
                            <span className="text-silver/60 text-xs px-2 py-1">
                              +{registration.submissionData.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {registration.attachments && registration.attachments.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-silver/80 text-sm font-medium mb-2">
                          Attachments ({registration.attachments.length}):
                        </h5>
                        <div className="text-silver/60 text-sm">
                          📎 {registration.attachments.length} file(s) uploaded
                        </div>
                      </div>
                    )}

                    {registration.status === "pending" && (
                      <div className="flex gap-3 pt-4 border-t border-medium-blue/20">
                        <button
                          onClick={() => setSelectedRegistration(registration)}
                          className="px-4 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors text-sm"
                        >
                          Review Registration
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(registration._id, "approved")}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                        >
                          ✅ Quick Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(registration._id, "rejected")}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                        >
                          ❌ Quick Reject
                        </button>
                      </div>
                    )}

                    {registration.reviewNotes && (
                      <div className="mt-4 p-3 bg-medium-blue/20 rounded-lg border border-medium-blue/30">
                        <h5 className="text-silver/80 text-sm font-medium mb-1">Review Notes:</h5>
                        <p className="text-silver/70 text-sm">{registration.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h4 className="text-xl font-bold text-silver mb-2">
                {searchTerm ? "No Registrations Found" : "No Registrations Available"}
              </h4>
              <p className="text-silver/70 mb-6">
                {searchTerm 
                  ? "Try adjusting your search criteria." 
                  : "No participant registrations found for the selected criteria."}
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
              Total: {eventRegistrations.length} registrations • 
              Pending: {statusFilters[1]?.count || 0} • 
              Approved: {statusFilters[2]?.count || 0} • 
              Rejected: {statusFilters[3]?.count || 0}
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

      {/* Review Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-charcoal/90 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-medium-blue/30">
              <h3 className="text-xl font-bold text-silver">Review Registration</h3>
              <p className="text-silver/70">
                {selectedRegistration.participant?.profile?.firstName} {selectedRegistration.participant?.profile?.lastName}
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-silver font-medium mb-2">Review Notes (Optional)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-24 resize-none"
                  placeholder="Add notes about your decision..."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="flex-1 px-6 py-3 border border-medium-blue/40 text-silver rounded-lg hover:bg-medium-blue/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedRegistration._id, "rejected")}
                  className="flex-1 px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedRegistration._id, "approved")}
                  className="flex-1 px-6 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  ✅ Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
