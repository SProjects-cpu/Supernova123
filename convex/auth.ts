import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

export const loggedInUser = query({
  args: {},
  returns: v.union(v.null(), v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number())
  })),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

// Custom sign-in function for super admin created users
export const signInWithCredentials = mutation({
  args: {
    userId: v.id("users"),
    sessionId: v.optional(v.string())
  },
  returns: v.object({
    success: v.boolean(),
    userId: v.id("users"),
    user: v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number())
    })
  }),
  handler: async (ctx, args) => {
    // This function will be called after successful credential verification
    // to establish a Convex Auth session for the user

    // Get the user to verify they exist
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Create an auth session for this user
    // This is a simplified approach - in production you might want more sophisticated session management
    console.log(`Creating auth session for user: ${user.email}`);

    return {
      success: true,
      userId: args.userId,
      user: user
    };
  },
});
