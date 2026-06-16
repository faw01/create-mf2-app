import { v } from "convex/values";
import { internalMutation, mutation, query } from "../../_generated/server";
import { mustGetCurrentUser } from "../../auth/users";

export const create = mutation({
  args: {
    title: v.optional(v.string()),
  },
  returns: v.id("threads"),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    return await ctx.db.insert("threads", {
      userId: user._id,
      title: args.title,
    });
  },
});

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("threads"),
      _creationTime: v.number(),
      userId: v.id("users"),
      title: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const user = await mustGetCurrentUser(ctx);
    return await ctx.db
      .query("threads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { threadId: v.id("threads") },
  returns: v.union(
    v.object({
      _id: v.id("threads"),
      _creationTime: v.number(),
      userId: v.id("users"),
      title: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const thread = await ctx.db.get("threads", args.threadId);
    if (!thread) {
      return null;
    }
    if (thread.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    return thread;
  },
});

export const remove = mutation({
  args: { threadId: v.id("threads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const thread = await ctx.db.get("threads", args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete("messages", message._id);
    }

    await ctx.db.delete("threads", args.threadId);
    return null;
  },
});

export const updateTitle = mutation({
  args: { threadId: v.id("threads"), title: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const thread = await ctx.db.get("threads", args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch("threads", args.threadId, { title: args.title });
    return null;
  },
});

export const updateTitleInternal = internalMutation({
  args: { threadId: v.id("threads"), title: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("threads", args.threadId, { title: args.title });
    return null;
  },
});
