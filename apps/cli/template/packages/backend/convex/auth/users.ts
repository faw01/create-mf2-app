import { createClerkClient, type UserJSON } from "@clerk/backend";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
  query,
} from "../_generated/server";
import { env } from "../convex.env";

function getClerkClient() {
  const secretKey = env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Clerk admin API is not configured: set CLERK_SECRET_KEY to enable"
    );
  }
  return createClerkClient({ secretKey });
}

export const userLoginStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { status: "No JWT Token" as const, user: null };
    }
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { status: "No Clerk User" as const, user: null };
    }
    return { status: "Logged In" as const, user };
  },
  returns: v.union(
    v.object({ status: v.literal("No JWT Token"), user: v.null() }),
    v.object({ status: v.literal("No Clerk User"), user: v.null() }),
    v.object({ status: v.literal("Logged In"), user: v.any() })
  ),
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => getCurrentUser(ctx),
  returns: v.union(v.null(), v.any()),
});

export const getUser = internalQuery({
  args: { subject: v.string() },
  handler: async (ctx, args) => userQuery(ctx, args.subject),
  returns: v.union(v.null(), v.any()),
});

export const updateOrCreateUser = internalMutation({
  args: { clerkUser: v.any() },
  handler: async (ctx, { clerkUser }: { clerkUser: UserJSON }) => {
    const userRecord = await userQuery(ctx, clerkUser.id);
    if (userRecord) {
      await ctx.db.patch("users", userRecord._id, { clerkUser });
    } else {
      await ctx.db.insert("users", { clerkUser });
    }
    return null;
  },
  returns: v.null(),
});

async function cascadeDeleteUserData(
  ctx: { db: MutationCtx["db"] },
  userId: Id<"users">
) {
  const threads = await ctx.db
    .query("threads")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  await Promise.all(
    threads.map(async (thread) => {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_thread", (q) => q.eq("threadId", thread._id))
        .collect();
      await Promise.all(
        messages.map((message) => ctx.db.delete("messages", message._id))
      );
      await ctx.db.delete("threads", thread._id);
    })
  );
}

export const deleteUserByClerkId = internalMutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const userRecord = await userQuery(ctx, id);
    if (!userRecord) {
      return null;
    }

    await cascadeDeleteUserData(ctx, userRecord._id);
    await ctx.db.delete("users", userRecord._id);

    return null;
  },
  returns: v.null(),
});

export function userQuery(
  ctx: QueryCtx,
  clerkUserId: string
): Promise<(Omit<Doc<"users">, "clerkUser"> & { clerkUser: UserJSON }) | null> {
  return ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkUser.id", clerkUserId))
    .unique();
}

export function userById(
  ctx: QueryCtx,
  id: Id<"users">
): Promise<(Omit<Doc<"users">, "clerkUser"> & { clerkUser: UserJSON }) | null> {
  return ctx.db.get("users", id);
}

export async function getCurrentUser(
  ctx: QueryCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return userQuery(ctx, identity.subject);
}

export async function mustGetCurrentUser(ctx: QueryCtx): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export async function getOrgContext(ctx: QueryCtx): Promise<{
  user: Doc<"users">;
  orgId: string | undefined;
} | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  const user = await userQuery(ctx, identity.subject);
  if (!user) {
    return null;
  }
  const orgId =
    typeof (identity as Record<string, unknown>).org_id === "string"
      ? ((identity as Record<string, unknown>).org_id as string)
      : undefined;
  return { orgId, user };
}

export const deleteUser = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean }> => {
    const user: Doc<"users"> | null = await ctx.runQuery(
      api.auth.users.currentUser
    );
    if (!user) {
      throw new Error("Not authenticated");
    }

    await ctx.runAction(internal.auth.users.deleteClerkUser, {
      clerkUserId: user.clerkUser.id,
    });

    return { success: true };
  },
  returns: v.object({ success: v.boolean() }),
});

export const deleteClerkUser = internalAction({
  args: { clerkUserId: v.string() },
  handler: async (_, { clerkUserId }) => {
    await getClerkClient().users.deleteUser(clerkUserId);
    return { success: true };
  },
  returns: v.object({ success: v.boolean() }),
});
