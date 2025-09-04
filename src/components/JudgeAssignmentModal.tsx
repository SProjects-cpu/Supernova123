import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface JudgeAssignmentModalProps {
  eventId: Id<"events">;
  eventTitle: string;
  currentJudges: Id<"users">[];
  onClose: () => void;
  onUpdate: () => void;
}

export function JudgeAssignmentModal({ 
  eventId, 
  eventTitle, 
  currentJudges, 
  onClose, 
  onUpdate 
}: JudgeAssignmentModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJudges, setSelectedJudges] = useState<Set<Id<"users">>>(
    new Set(currentJudges)
  );

  const availableJudges = useQuery(api.events.getAvailableJudges);
  const assignJudge = useMutation(api.events.assignJudgeToEvent);
  const removeJudge = useMutation(api.events.removeJudgeFromEvent);

  // Filter judges based on search term
  const filteredJudges = availableJudges?.filter(judge => 
    judge.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    judge.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    judge.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    judge.organization?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleJudgeToggle = async (judgeId: Id<"users">) => {
    try {
      if (selectedJudges.has(judgeId)) {
        // Remove judge
        await removeJudge({ eventId, judgeId });
        setSelectedJudges(prev => {
          const newSet = new Set(prev);
          newSet.delete(judgeId);
          return newSet;
        });
        toast.success("Judge removed successfully! 👨‍⚖️");
      } else {
        // Add judge
        await assignJudge({ eventId, judgeId });
        setSelectedJudges(prev => new Set(prev).add(judgeId));
        toast.success("Judge assigned successfully! ⚖️");
      }
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update judge assignment");
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-medium-blue/30">
          <div>
            <h2 className="text-2xl font-bold text-silver mb-2">
              ⚖️ Assign Judges
            </h2>
            <p className="text-silver/70">
              Manage judges for: <span className="text-accent-blue font-medium">{eventTitle}</span>
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

        {/* Search Bar */}
        <div className="p-6 border-b border-medium-blue/30">
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

        {/* Judge List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredJudges.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-silver">
                  Available Judges ({filteredJudges.length})
                </h3>
                <div className="text-silver/60 text-sm">
                  {selectedJudges.size} judge{selectedJudges.size !== 1 ? 's' : ''} assigned
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredJudges.map((judge) => {
                  const isAssigned = selectedJudges.has(judge.userId);
                  return (
                    <div
                      key={judge.userId}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                        isAssigned
                          ? "bg-accent-blue/20 border-accent-blue/40 hover:bg-accent-blue/30"
                          : "bg-dark-blue/40 border-medium-blue/30 hover:border-accent-blue/40 hover:bg-dark-blue/60"
                      }`}
                      onClick={() => handleJudgeToggle(judge.userId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            isAssigned 
                              ? "bg-accent-blue text-silver" 
                              : "bg-medium-blue/40 text-silver/70"
                          }`}>
                            {judge.firstName[0]}{judge.lastName[0]}
                          </div>
                          
                          <div>
                            <h4 className="text-silver font-semibold">
                              {judge.firstName} {judge.lastName}
                            </h4>
                            <p className="text-silver/70 text-sm">
                              {judge.user.email}
                            </p>
                            {judge.organization && (
                              <p className="text-silver/60 text-xs">
                                {judge.organization}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {judge.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {judge.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-medium-blue/30 text-silver/80 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {judge.skills.length > 3 && (
                                <span className="text-silver/60 text-xs">
                                  +{judge.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isAssigned
                              ? "bg-accent-blue border-accent-blue"
                              : "border-medium-blue/40"
                          }`}>
                            {isAssigned && (
                              <svg className="w-4 h-4 text-silver" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {judge.bio && (
                        <div className="mt-3 pt-3 border-t border-medium-blue/20">
                          <p className="text-silver/70 text-sm line-clamp-2">
                            {judge.bio}
                          </p>
                        </div>
                      )}
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
              {selectedJudges.size} of {filteredJudges.length} judges assigned to this event
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-medium-blue/40 hover:bg-medium-blue/60 text-silver font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
