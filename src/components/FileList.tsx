import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface FileListProps {
  eventId?: Id<"events">;
  userId?: Id<"users">;
  category?: string;
  showActions?: boolean;
  className?: string;
}

export function FileList({ 
  eventId, 
  userId, 
  category, 
  showActions = true, 
  className = "" 
}: FileListProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<Id<"files">>>(new Set());

  const userFiles = useQuery(api.files.getUserFiles, { eventId, category });
  const eventFiles = useQuery(api.files.getEventFiles, eventId ? { eventId } : undefined);
  const deleteFile = useMutation(api.files.deleteFile);

  const files = eventId && !userId ? eventFiles : userFiles;

  const handleFileDelete = async (fileId: Id<"files">) => {
    try {
      await deleteFile({ fileId });
      toast.success("File deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete file");
    }
  };

  const handleDownload = async (fileId: Id<"files">) => {
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

  if (!files || files.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-4">📁</div>
        <h4 className="text-lg font-semibold text-silver mb-2">No files uploaded</h4>
        <p className="text-silver/70 text-sm">
          {eventId ? "No files have been uploaded for this event yet." : "Upload your first file to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-silver">
          Uploaded Files ({files.length})
        </h3>
        {showActions && selectedFiles.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                selectedFiles.forEach(fileId => handleFileDelete(fileId));
                setSelectedFiles(new Set());
              }}
              className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
            >
              Delete Selected ({selectedFiles.size})
            </button>
            <button
              onClick={() => setSelectedFiles(new Set())}
              className="px-3 py-1 bg-medium-blue/20 text-silver/70 rounded text-sm hover:bg-medium-blue/30 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {files.map((file) => (
          <div
            key={file._id}
            className={`p-4 bg-dark-blue/40 border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 transition-all duration-300 ${
              selectedFiles.has(file._id) ? "ring-2 ring-accent-blue/50 bg-accent-blue/10" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              {showActions && (
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
              )}

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
                  {file.uploader && (
                    <span>by {file.uploader.profile?.firstName || file.uploader.name}</span>
                  )}
                </div>

                {file.description && (
                  <p className="text-silver/70 text-sm mt-2 line-clamp-2">
                    {file.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(file._id)}
                  className="p-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>

                {showActions && (
                  <button
                    onClick={() => handleFileDelete(file._id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
