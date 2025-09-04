import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to upload files");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    eventId: v.optional(v.id("events")),
    registrationId: v.optional(v.id("registrations")),
    category: v.union(
      v.literal("resume"),
      v.literal("portfolio"),
      v.literal("project"),
      v.literal("document"),
      v.literal("image"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to save files");
    }

    const fileId = await ctx.db.insert("files", {
      ...args,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      isPublic: args.isPublic ?? false
    });

    return fileId;
  },
});

export const getFileUrl = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) return null;

    const userId = await getAuthUserId(ctx);
    
    // Check permissions
    if (!file.isPublic && file.uploadedBy !== userId) {
      // Check if user is admin or organizer of the event
      if (!userId) {
        throw new Error("Access denied");
      }

      const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      
      if (userProfile?.role !== "admin") {
        if (file.eventId) {
          const event = await ctx.db.get(file.eventId);
          if (!event || event.organizerId !== userId) {
            throw new Error("Access denied");
          }
        } else {
          throw new Error("Access denied");
        }
      }
    }

    const url = await ctx.storage.getUrl(file.storageId);
    return { ...file, url };
  },
});

export const getUserFiles = query({
  args: {
    eventId: v.optional(v.id("events")),
    category: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let files = await ctx.db
      .query("files")
      .withIndex("by_uploader", (q) => q.eq("uploadedBy", userId))
      .collect();

    if (args.eventId) {
      files = files.filter(file => file.eventId === args.eventId);
    }

    if (args.category) {
      files = files.filter(file => file.category === args.category);
    }

    return files.sort((a, b) => b.uploadedAt - a.uploadedAt);
  },
});

export const getEventFiles = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check if user has permission to view event files
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const event = await ctx.db.get(args.eventId);
    if (!event) return [];

    // Only admins, organizers, and judges can view all event files
    if (userProfile?.role !== "admin" && 
        event.organizerId !== userId && 
        !event.judges?.includes(userId)) {
      return [];
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get uploader information for each file
    const filesWithUploaders = await Promise.all(
      files.map(async (file) => {
        const uploader = await ctx.db.get(file.uploadedBy);
        const uploaderProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", file.uploadedBy))
          .first();

        return {
          ...file,
          uploader: {
            name: uploader?.name || "Unknown",
            email: uploader?.email,
            profile: uploaderProfile
          }
        };
      })
    );

    return filesWithUploaders.sort((a, b) => b.uploadedAt - a.uploadedAt);
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to delete files");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check permissions - only file owner or admin can delete
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (file.uploadedBy !== userId && userProfile?.role !== "admin") {
      throw new Error("Access denied");
    }

    // Delete from storage
    await ctx.storage.delete(file.storageId);
    
    // Delete from database
    await ctx.db.delete(args.fileId);

    return { success: true };
  },
});

export const updateFileMetadata = mutation({
  args: {
    fileId: v.id("files"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("resume"),
      v.literal("portfolio"),
      v.literal("project"),
      v.literal("document"),
      v.literal("image"),
      v.literal("other")
    )),
    isPublic: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update files");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check permissions - only file owner or admin can update
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (file.uploadedBy !== userId && userProfile?.role !== "admin") {
      throw new Error("Access denied");
    }

    const { fileId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(args.fileId, filteredUpdates);

    return { success: true };
  },
});
