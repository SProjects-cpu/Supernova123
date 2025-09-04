import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    return profile;
  },
});

export const createOrUpdateProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal("admin"), v.literal("organizer"), v.literal("judge"), v.literal("participant")),
    bio: v.optional(v.string()),
    skills: v.array(v.string()),
    organization: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      twitter: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }
    
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, args);
      return existingProfile._id;
    } else {
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        ...args
      });
      return profileId;
    }
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) return null;
    
    let stats = {};
    
    if (profile.role === "admin") {
      const totalEvents = await ctx.db.query("events").collect();
      const totalUsers = await ctx.db.query("userProfiles").collect();
      const totalRegistrations = await ctx.db.query("registrations").collect();
      
      stats = {
        totalEvents: totalEvents.length,
        totalUsers: totalUsers.length,
        totalRegistrations: totalRegistrations.length,
        activeEvents: totalEvents.filter(e => e.status === "ongoing").length
      };
    } else if (profile.role === "organizer") {
      const myEvents = await ctx.db
        .query("events")
        .withIndex("by_organizer", (q) => q.eq("organizerId", userId))
        .collect();
      
      const myRegistrations = await Promise.all(
        myEvents.map(event => 
          ctx.db.query("registrations")
            .withIndex("by_event", (q) => q.eq("eventId", event._id))
            .collect()
        )
      );
      
      stats = {
        myEvents: myEvents.length,
        totalRegistrations: myRegistrations.flat().length,
        activeEvents: myEvents.filter(e => e.status === "ongoing").length,
        draftEvents: myEvents.filter(e => e.status === "draft").length
      };
    } else if (profile.role === "participant") {
      const myRegistrations = await ctx.db
        .query("registrations")
        .withIndex("by_participant", (q) => q.eq("participantId", userId))
        .collect();
      
      stats = {
        registeredEvents: myRegistrations.length,
        pendingRegistrations: myRegistrations.filter(r => r.status === "pending").length,
        approvedRegistrations: myRegistrations.filter(r => r.status === "approved").length
      };
    }
    
    return { profile, stats };
  },
});
