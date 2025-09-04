import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new pre-qualifier test
export const createTest = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    testLink: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    duration: v.number(),
    instructions: v.string(),
    eligibilityCriteria: v.string(),
    maxAttempts: v.number(),
    passingScore: v.optional(v.number()),
    eventId: v.optional(v.id("events")),
    tags: v.array(v.string()),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    totalQuestions: v.optional(v.number()),
    testType: v.union(v.literal("MCQ"), v.literal("Coding"), v.literal("Mixed")),
    createdBy: v.string()
  },
  handler: async (ctx, args) => {
    const testId = await ctx.db.insert("preQualifierTests", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return testId;
  },
});

// Get all active tests for participants
export const getActiveTests = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const tests = await ctx.db
      .query("preQualifierTests")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter tests that are currently available (between start and end date)
    const availableTests = tests.filter(test => 
      test.startDate <= now && test.endDate >= now
    );

    return availableTests.sort((a, b) => a.startDate - b.startDate);
  },
});

// Get all tests for admin management
export const getAllTests = query({
  args: {},
  handler: async (ctx) => {
    const tests = await ctx.db
      .query("preQualifierTests")
      .collect();

    return tests.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get test by ID
export const getTestById = query({
  args: { testId: v.id("preQualifierTests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.testId);
  },
});

// Update test
export const updateTest = mutation({
  args: {
    testId: v.id("preQualifierTests"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    testLink: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    duration: v.optional(v.number()),
    instructions: v.optional(v.string()),
    eligibilityCriteria: v.optional(v.string()),
    maxAttempts: v.optional(v.number()),
    passingScore: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    difficulty: v.optional(v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard"))),
    totalQuestions: v.optional(v.number()),
    testType: v.optional(v.union(v.literal("MCQ"), v.literal("Coding"), v.literal("Mixed"))),
    isActive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { testId, ...updates } = args;
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(testId, {
      ...filteredUpdates,
      updatedAt: Date.now()
    });

    return { success: true };
  },
});

// Delete test
export const deleteTest = mutation({
  args: { testId: v.id("preQualifierTests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.testId);
    return { success: true };
  },
});

// Toggle test active status
export const toggleTestStatus = mutation({
  args: { 
    testId: v.id("preQualifierTests"),
    isActive: v.boolean()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.testId, {
      isActive: args.isActive,
      updatedAt: Date.now()
    });

    return { success: true };
  },
});

// Record test attempt
export const recordTestAttempt = mutation({
  args: {
    testId: v.id("preQualifierTests"),
    participantEmail: v.string(),
    participantName: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Check if participant has already reached max attempts
    const existingAttempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_test_participant", (q) => 
        q.eq("testId", args.testId).eq("participantEmail", args.participantEmail)
      )
      .collect();

    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    if (existingAttempts.length >= test.maxAttempts) {
      throw new Error("Maximum attempts reached for this test");
    }

    const attemptId = await ctx.db.insert("testAttempts", {
      testId: args.testId,
      participantEmail: args.participantEmail,
      participantName: args.participantName,
      attemptNumber: existingAttempts.length + 1,
      startedAt: Date.now(),
      status: "started",
      ipAddress: args.ipAddress,
      userAgent: args.userAgent
    });

    return { attemptId, attemptNumber: existingAttempts.length + 1 };
  },
});

// Complete test attempt
export const completeTestAttempt = mutation({
  args: {
    attemptId: v.id("testAttempts"),
    score: v.optional(v.number()),
    timeSpent: v.optional(v.number()),
    responses: v.optional(v.any()),
    feedback: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { attemptId, ...updates } = args;

    await ctx.db.patch(attemptId, {
      ...updates,
      completedAt: Date.now(),
      status: "completed"
    });

    return { success: true };
  },
});

// Get participant's test attempts
export const getParticipantAttempts = query({
  args: { 
    participantEmail: v.string(),
    testId: v.optional(v.id("preQualifierTests"))
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("testAttempts")
      .withIndex("by_participant", (q) => q.eq("participantEmail", args.participantEmail));

    const attempts = await query.collect();

    if (args.testId) {
      return attempts.filter(attempt => attempt.testId === args.testId);
    }

    return attempts.sort((a, b) => b.startedAt - a.startedAt);
  },
});

// Get test statistics
export const getTestStatistics = query({
  args: { testId: v.id("preQualifierTests") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .collect();

    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.status === "completed");
    const averageScore = completedAttempts.length > 0 
      ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length 
      : 0;

    const uniqueParticipants = new Set(attempts.map(a => a.participantEmail)).size;

    return {
      totalAttempts,
      completedAttempts: completedAttempts.length,
      uniqueParticipants,
      averageScore: Math.round(averageScore * 100) / 100,
      completionRate: totalAttempts > 0 ? (completedAttempts.length / totalAttempts) * 100 : 0
    };
  },
});

// Check if participant can take test
export const canParticipantTakeTest = query({
  args: {
    testId: v.id("preQualifierTests"),
    participantEmail: v.string()
  },
  handler: async (ctx, args) => {
    const test = await ctx.db.get(args.testId);
    if (!test || !test.isActive) {
      return { canTake: false, reason: "Test is not available" };
    }

    const now = Date.now();
    if (now < test.startDate) {
      return { canTake: false, reason: "Test has not started yet" };
    }

    if (now > test.endDate) {
      return { canTake: false, reason: "Test has ended" };
    }

    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_test_participant", (q) => 
        q.eq("testId", args.testId).eq("participantEmail", args.participantEmail)
      )
      .collect();

    if (attempts.length >= test.maxAttempts) {
      return { canTake: false, reason: "Maximum attempts reached" };
    }

    // Check if there's an ongoing attempt
    const ongoingAttempt = attempts.find(a => a.status === "started");
    if (ongoingAttempt) {
      return { 
        canTake: false, 
        reason: "You have an ongoing attempt",
        ongoingAttemptId: ongoingAttempt._id
      };
    }

    return { 
      canTake: true, 
      attemptsLeft: test.maxAttempts - attempts.length,
      completedAttempts: attempts.filter(a => a.status === "completed").length
    };
  },
});

// Get upcoming tests notification
export const getUpcomingTestsNotification = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayFromNow = now + (24 * 60 * 60 * 1000); // 24 hours from now

    const tests = await ctx.db
      .query("preQualifierTests")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Tests starting within 24 hours
    const upcomingTests = tests.filter(test => 
      test.startDate > now && test.startDate <= oneDayFromNow
    );

    // Currently active tests
    const activeTests = tests.filter(test => 
      test.startDate <= now && test.endDate >= now
    );

    return {
      hasActiveTests: activeTests.length > 0,
      hasUpcomingTests: upcomingTests.length > 0,
      activeTestsCount: activeTests.length,
      upcomingTestsCount: upcomingTests.length,
      nextTestStartTime: upcomingTests.length > 0 
        ? Math.min(...upcomingTests.map(t => t.startDate))
        : null
    };
  },
});
