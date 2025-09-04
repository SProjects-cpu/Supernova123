import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Super Admin credentials (hardcoded for security)
const SUPER_ADMIN_EMAIL = "rutvikburra@gmail.com";
const SUPER_ADMIN_PASSWORD = "rutvikburra1234567890@#E";

export const authenticateSuperAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string()
  },
  returns: v.object({
    success: v.boolean(),
    isSuperAdmin: v.boolean()
  }),
  handler: async (ctx, args) => {
    console.log("Super admin authentication attempt:", {
      providedEmail: args.email,
      expectedEmail: SUPER_ADMIN_EMAIL,
      emailMatch: args.email === SUPER_ADMIN_EMAIL,
      providedPasswordLength: args.password.length,
      expectedPasswordLength: SUPER_ADMIN_PASSWORD.length,
      passwordMatch: args.password === SUPER_ADMIN_PASSWORD
    });

    if (args.email === SUPER_ADMIN_EMAIL && args.password === SUPER_ADMIN_PASSWORD) {
      console.log("Super admin authentication successful");
      return { success: true, isSuperAdmin: true };
    }

    console.log("Super admin authentication failed");
    throw new Error("Invalid super admin credentials");
  },
});

export const createOrganizerJudge = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("organizer"), v.literal("judge")),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  returns: v.id("organizerCredentials"),
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    // Check if email already exists
    const existingCredential = await ctx.db
      .query("organizerCredentials")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingCredential) {
      throw new Error("Email already exists");
    }

    // Create organizer/judge credential
    const credentialId = await ctx.db.insert("organizerCredentials", {
      email: args.email,
      password: args.password,
      role: args.role,
      firstName: args.firstName,
      lastName: args.lastName,
      organization: args.organization,
      isActive: true,
      createdAt: Date.now(),
      createdBy: args.superAdminEmail,
      passwordResetRequired: false
    });

    // Also create a user in the Convex Auth users table for authentication
    try {
      const userId = await ctx.db.insert("users", {
        email: args.email,
        name: `${args.firstName} ${args.lastName}`,
        emailVerificationTime: Date.now() // Mark as verified since created by super admin
      });

      // Create user profile with additional info
      await ctx.db.insert("userProfiles", {
        userId: userId,
        role: args.role as "organizer" | "judge",
        firstName: args.firstName,
        lastName: args.lastName,
        bio: `${args.role} at ${args.organization || 'Technical Fest'}`,
        skills: [],
        socialLinks: {},
        organization: args.organization
      });

      // Update the credential with the linked user ID
      await ctx.db.patch(credentialId, {
        linkedUserId: userId
      });

      console.log(`Created user account for ${args.email} with role ${args.role}`);
    } catch (error) {
      console.error("Error creating Convex Auth user:", error);
      // If user creation fails, we still have the credential
    }

    return credentialId;
  },
});

export const getAllOrganizerCredentials = query({
  args: {
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  returns: v.array(v.object({
    _id: v.id("organizerCredentials"),
    _creationTime: v.number(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("organizer"), v.literal("judge")),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    createdBy: v.string(),
    lastLogin: v.optional(v.number()),
    passwordResetRequired: v.boolean(),
    linkedUserId: v.optional(v.id("users"))
  })),
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    const credentials = await ctx.db
      .query("organizerCredentials")
      .collect();

    return credentials.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getAllOrganizersJudges = query({
  args: {
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  returns: v.array(v.object({
    _id: v.id("organizerCredentials"),
    _creationTime: v.number(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("organizer"), v.literal("judge")),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    createdBy: v.string(),
    lastLogin: v.optional(v.number()),
    passwordResetRequired: v.boolean(),
    linkedUserId: v.optional(v.id("users"))
  })),
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    const credentials = await ctx.db
      .query("organizerCredentials")
      .collect();

    return credentials.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateOrganizerJudgePassword = mutation({
  args: {
    credentialId: v.id("organizerCredentials"),
    newPassword: v.string(),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    await ctx.db.patch(args.credentialId, {
      password: args.newPassword,
      passwordResetRequired: false
    });

    return { success: true };
  },
});

export const toggleOrganizerJudgeStatus = mutation({
  args: {
    credentialId: v.id("organizerCredentials"),
    isActive: v.boolean(),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    await ctx.db.patch(args.credentialId, {
      isActive: args.isActive
    });

    return { success: true };
  },
});

export const deleteOrganizerJudge = mutation({
  args: {
    credentialId: v.id("organizerCredentials"),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    await ctx.db.delete(args.credentialId);
    return { success: true };
  },
});

export const authenticateOrganizerJudge = mutation({
  args: {
    email: v.string(),
    password: v.string()
  },
  returns: v.union(
    v.object({
      success: v.literal(false),
      message: v.string()
    }),
    v.object({
      success: v.literal(true),
      role: v.union(v.literal("organizer"), v.literal("judge")),
      firstName: v.string(),
      lastName: v.string(),
      organization: v.optional(v.string()),
      passwordResetRequired: v.boolean(),
      userId: v.id("users")
    })
  ),
  handler: async (ctx, args) => {
    console.log("Authentication attempt:", args.email);

    const credential = await ctx.db
      .query("organizerCredentials")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!credential) {
      console.log("No credential found for email:", args.email);
      return { success: false as const, message: "Invalid email or password" };
    }

    if (!credential.isActive) {
      console.log("Account inactive for email:", args.email);
      return { success: false as const, message: "Account is inactive. Please contact administrator." };
    }

    if (credential.password !== args.password) {
      console.log("Password mismatch for email:", args.email);
      return { success: false as const, message: "Invalid email or password" };
    }

    // Get or create the linked Convex Auth user
    let userId = credential.linkedUserId;
    if (!userId) {
      // Create a new user in the Convex Auth system
      try {
        userId = await ctx.db.insert("users", {
          email: args.email,
          name: `${credential.firstName} ${credential.lastName}`,
          emailVerificationTime: Date.now()
        });

        // Create user profile with additional info
        await ctx.db.insert("userProfiles", {
          userId: userId,
          role: credential.role as "organizer" | "judge",
          firstName: credential.firstName,
          lastName: credential.lastName,
          bio: `${credential.role} at ${credential.organization || 'Technical Fest'}`,
          skills: [],
          socialLinks: {},
          organization: credential.organization
        });

        // Update the credential with the linked user ID
        await ctx.db.patch(credential._id, {
          linkedUserId: userId
        });

        console.log(`Created linked user for ${args.email}`);
      } catch (error) {
        console.error("Error creating linked user:", error);
        return { success: false as const, message: "Authentication system error" };
      }
    }

    // Update last login
    await ctx.db.patch(credential._id, {
      lastLogin: Date.now()
    });

    console.log("Authentication successful for:", args.email);

    return {
      success: true as const,
      role: credential.role,
      firstName: credential.firstName,
      lastName: credential.lastName,
      organization: credential.organization,
      passwordResetRequired: credential.passwordResetRequired,
      userId: userId
    };
  },
});

// Update payment link for an event (super admin only)
export const updateEventPaymentLink = mutation({
  args: {
    eventId: v.id("events"),
    paymentLink: v.string()
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    // This should only be called by super admin
    // For now, we'll allow any authenticated user, but in production you'd check for super admin role

    await ctx.db.patch(args.eventId, {
      paymentLink: args.paymentLink
    });

    return { success: true };
  },
});

// Delete all events (for development/reset)
export const deleteAllEvents = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    deletedEvents: v.number(),
    deletedRegistrations: v.number()
  }),
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    const registrations = await ctx.db.query("registrations").collect();

    // Delete all registrations first
    for (const registration of registrations) {
      await ctx.db.delete(registration._id);
    }

    // Delete all events
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    return {
      success: true,
      deletedEvents: events.length,
      deletedRegistrations: registrations.length
    };
  },
});

export const getOrganizerJudgeStats = query({
  args: {
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  returns: v.object({
    totalOrganizers: v.number(),
    totalJudges: v.number(),
    activeAccounts: v.number(),
    inactiveAccounts: v.number(),
    recentLogins: v.number(),
    totalAccounts: v.number()
  }),
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    const allCredentials = await ctx.db
      .query("organizerCredentials")
      .collect();

    const totalOrganizers = allCredentials.filter(c => c.role === "organizer").length;
    const totalJudges = allCredentials.filter(c => c.role === "judge").length;
    const activeAccounts = allCredentials.filter(c => c.isActive).length;
    const inactiveAccounts = allCredentials.filter(c => !c.isActive).length;

    // Recent logins (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentLogins = allCredentials.filter(c => 
      c.lastLogin && c.lastLogin > sevenDaysAgo
    ).length;

    return {
      totalOrganizers,
      totalJudges,
      activeAccounts,
      inactiveAccounts,
      recentLogins,
      totalAccounts: allCredentials.length
    };
  },
});

export const updateOrganizerJudgeInfo = mutation({
  args: {
    credentialId: v.id("organizerCredentials"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    organization: v.optional(v.string()),
    superAdminEmail: v.string(),
    superAdminPassword: v.string()
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    // Verify super admin credentials
    if (args.superAdminEmail !== SUPER_ADMIN_EMAIL || args.superAdminPassword !== SUPER_ADMIN_PASSWORD) {
      throw new Error("Unauthorized access");
    }

    const { credentialId, superAdminEmail, superAdminPassword, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(credentialId, filteredUpdates);
    return { success: true };
  },
});

// Function to create default test accounts
export const createDefaultAccounts = mutation({
  args: {},
  returns: v.object({
    message: v.string(),
    success: v.optional(v.boolean()),
    accounts: v.optional(v.array(v.object({
      email: v.string(),
      password: v.string(),
      role: v.union(v.literal("organizer"), v.literal("judge"))
    })))
  }),
  handler: async (ctx) => {
    // Check if any accounts already exist
    const existingAccounts = await ctx.db
      .query("organizerCredentials")
      .collect();

    if (existingAccounts.length > 0) {
      return { message: "Default accounts already exist" };
    }

    // Create default organizer account
    await ctx.db.insert("organizerCredentials", {
      email: "organizer@test.com",
      password: "organizer123",
      role: "organizer",
      firstName: "Test",
      lastName: "Organizer",
      organization: "Test Organization",
      isActive: true,
      createdAt: Date.now(),
      createdBy: SUPER_ADMIN_EMAIL,
      passwordResetRequired: false
    });

    // Create default judge account
    await ctx.db.insert("organizerCredentials", {
      email: "judge@test.com",
      password: "judge123",
      role: "judge",
      firstName: "Test",
      lastName: "Judge",
      organization: "Test Organization",
      isActive: true,
      createdAt: Date.now(),
      createdBy: SUPER_ADMIN_EMAIL,
      passwordResetRequired: false
    });

    return {
      success: true,
      message: "Default accounts created",
      accounts: [
        { email: "organizer@test.com", password: "organizer123", role: "organizer" as const },
        { email: "judge@test.com", password: "judge123", role: "judge" as const }
      ]
    };
  },
});
