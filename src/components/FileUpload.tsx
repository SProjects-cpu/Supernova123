import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface FileUploadProps {
  eventId?: Id<"events">;
  registrationId?: Id<"registrations">;
  category?: "resume" | "portfolio" | "project" | "document" | "image" | "other";
  onFileUploaded?: (fileId: Id<"files">) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  className?: string;
}

export function FileUpload({
  eventId,
  registrationId,
  category = "document",
  onFileUploaded,
  maxFiles = 5,
  acceptedTypes = [".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".zip"],
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  className = ""
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    if (files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file size
        if (file.size > maxSizeBytes) {
          toast.error(`File "${file.name}" is too large. Maximum size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
          continue;
        }

        // Validate file type
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
        if (!acceptedTypes.includes(fileExtension)) {
          toast.error(`File type "${fileExtension}" is not allowed`);
          continue;
        }

        // Generate upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        const { storageId } = await result.json();

        // Save file metadata
        const fileId = await saveFile({
          storageId,
          name: file.name,
          type: file.type,
          size: file.size,
          eventId,
          registrationId,
          category,
          isPublic: false
        });

        toast.success(`File "${file.name}" uploaded successfully!`);
        onFileUploaded?.(fileId);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          dragActive
            ? "border-accent-blue bg-accent-blue/10"
            : "border-medium-blue/40 hover:border-accent-blue/60 hover:bg-dark-blue/20"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
            <div className="text-silver">Uploading files...</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-electric-blue rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-silver" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-silver mb-2">
                Drop files here or click to browse
              </h3>
              <p className="text-silver/70 text-sm mb-4">
                {maxFiles > 1 ? `Upload up to ${maxFiles} files` : "Upload a file"}
              </p>
              
              <div className="text-xs text-silver/60 space-y-1">
                <div>Accepted types: {acceptedTypes.join(", ")}</div>
                <div>Maximum size: {formatFileSize(maxSizeBytes)} per file</div>
              </div>
            </div>

            <button
              type="button"
              className="px-6 py-2 bg-accent-blue hover:bg-accent-blue/80 text-silver font-medium rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
            >
              Choose Files
            </button>
          </div>
        )}
      </div>

      {/* File type examples */}
      <div className="mt-4 p-4 bg-dark-blue/30 rounded-lg border border-medium-blue/20">
        <h4 className="text-silver/80 text-sm font-medium mb-2">Suggested files for {category}:</h4>
        <div className="text-xs text-silver/60">
          {category === "resume" && "CV, Resume, Cover Letter"}
          {category === "portfolio" && "Portfolio PDF, Design samples, Project showcase"}
          {category === "project" && "Source code, Documentation, Demo videos"}
          {category === "document" && "Requirements, Specifications, Reports"}
          {category === "image" && "Screenshots, Mockups, Diagrams"}
          {category === "other" && "Any supporting documents"}
        </div>
      </div>
    </div>
  );
}
