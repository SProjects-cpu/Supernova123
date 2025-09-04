import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface FileManagementProps {
  onClose: () => void;
}

export function FileManagement({ onClose }: FileManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<Id<"files">>>(new Set());

  const events = useQuery(api.events.list, {});
  const deleteFile = useMutation(api.files.deleteFile);

  // Get all files from all events
  const allEventFiles = events?.map(event => 
    useQuery(api.files.getEventFiles, { eventId: event._id })
  ).filter(Boolean).flat() || [];

  // Loading states
  const isLoadingEvents = events === undefined;
  const isLoadingFiles = allEventFiles === undefined;

  const categories = [
    { id: "all", name: "All Files", icon: "📁" },
    { id: "resume", name: "Resumes", icon: "📋" },
    { id: "portfolio", name: "Portfolios", icon: "🎨" },
    { id: "project", name: "Projects", icon: "💻" },
    { id: "document", name: "Documents", icon: "📄" },
    { id: "image", name: "Images", icon: "🖼️" },
    { id: "other", name: "Other", icon: "📦" }
  ];

  // Filter files based on criteria
  const filteredFiles = allEventFiles.filter(file => {
    if (!file) return false;
    
    const matchesSearch = 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uploader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uploader?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory;
    const matchesEvent = selectedEvent === "all" || file.eventId === selectedEvent;

    return matchesSearch && matchesCategory && matchesEvent;
  });

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedFiles).map(fileId => deleteFile({ fileId }))
      );
      toast.success(`${selectedFiles.size} file(s) deleted successfully`);
      setSelectedFiles(new Set());
    } catch (error: any) {
      toast.error(error.message || "Failed to delete files");
    }
  };

  const handleFileDownload = async (fileId: Id<"files">) => {
    try {
      const fileData = await api.files.getFileUrl({ fileId });
      if (fileData?.url) {
        window.open(fileData.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to download file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string, category: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("zip") || type.includes("archive")) return "📦";
    if (category === "resume") return "📋";
    if (category === "portfolio") return "🎨";
    if (category === "project") return "💻";
    return "📁";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "resume": return "bg-blue-500/20 text-blue-400";
      case "portfolio": return "bg-purple-500/20 text-purple-400";
      case "project": return "bg-green-500/20 text-green-400";
      case "document": return "bg-yellow-500/20 text-yellow-400";
      case "image": return "bg-pink-500/20 text-pink-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const totalSize = filteredFiles.reduce((sum, file) => sum + (file?.size || 0), 0);

  // Show loading state while data is being fetched
  if (isLoadingEvents || isLoadingFiles) {
    return (
      <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-silver mb-2">Loading Files...</h3>
          <p className="text-silver/70">Please wait while we fetch file information</p>
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
              📁 File Management System
            </h2>
            <p className="text-silver/70">
              Manage all uploaded files across events and registrations
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
                placeholder="Search files by name, description, or uploader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-silver/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Category Filter */}
            <div>
              <label className="block text-silver/80 text-sm font-medium mb-2">Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="cosmic-select"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Filter */}
            <div>
              <label className="block text-silver/80 text-sm font-medium mb-2">Filter by Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="cosmic-select"
              >
                <option value="all">🌟 All Events</option>
                {events?.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedFiles.size > 0 && (
            <div className="flex items-center gap-4 p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-xl">
              <span className="text-accent-blue font-medium">
                {selectedFiles.size} file(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedFiles(new Set())}
                  className="px-4 py-2 bg-medium-blue/20 text-silver/70 rounded-lg hover:bg-medium-blue/30 transition-colors text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="px-6 py-4 bg-dark-blue/30 border-b border-medium-blue/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-accent-blue">{filteredFiles.length}</div>
              <div className="text-silver/60 text-sm">Total Files</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-electric-blue">{formatFileSize(totalSize)}</div>
              <div className="text-silver/60 text-sm">Total Size</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {filteredFiles.filter(f => f?.category === "resume").length}
              </div>
              <div className="text-silver/60 text-sm">Resumes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {filteredFiles.filter(f => f?.category === "portfolio").length}
              </div>
              <div className="text-silver/60 text-sm">Portfolios</div>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {filteredFiles.length > 0 ? (
            <div className="space-y-3">
              {filteredFiles.map((file) => file && (
                <div
                  key={file._id}
                  className={`p-4 bg-dark-blue/40 border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 transition-all duration-300 ${
                    selectedFiles.has(file._id) ? "ring-2 ring-accent-blue/50 bg-accent-blue/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file._id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedFiles);
                        if (e.target.checked) {
                          newSelected.add(file._id);
                        } else {
                          newSelected.delete(file._id);
                        }
                        setSelectedFiles(newSelected);
                      }}
                      className="w-4 h-4 text-accent-blue bg-dark-blue border-medium-blue rounded focus:ring-accent-blue"
                    />

                    <div className="text-2xl">
                      {getFileIcon(file.type, file.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-silver font-medium truncate">{file.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(file.category)}`}>
                          {file.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-silver/60">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        <span>by {file.uploader?.profile?.firstName || file.uploader?.name}</span>
                        <span>{file.uploader?.email}</span>
                      </div>

                      {file.description && (
                        <p className="text-silver/70 text-sm mt-2 line-clamp-1">
                          {file.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFileDownload(file._id)}
                        className="p-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors"
                        title="Download"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => deleteFile({ fileId: file._id })}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h4 className="text-xl font-bold text-silver mb-2">No Files Found</h4>
              <p className="text-silver/70 mb-6">
                {searchTerm || selectedCategory !== "all" || selectedEvent !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "No files have been uploaded to the system yet."}
              </p>
              {(searchTerm || selectedCategory !== "all" || selectedEvent !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedEvent("all");
                  }}
                  className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-silver font-medium rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-medium-blue/30 bg-dark-blue/30">
          <div className="flex items-center justify-between">
            <div className="text-silver/60 text-sm">
              Showing {filteredFiles.length} files • Total size: {formatFileSize(totalSize)}
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
