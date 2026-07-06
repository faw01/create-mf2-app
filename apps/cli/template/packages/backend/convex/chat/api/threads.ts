import { v } from "convex/values";
import { internalMutation, mutation, query } from "../../_generated/server";
import { mustGetCurrentUser } from "../../auth/users";

export const create = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    return await ctx.db.insert("threads", {
      title: args.title,
      userId: user._id,
    });
  },
  returns: v.id("threads"),
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await mustGetCurrentUser(ctx);
    return await ctx.db
      .query("threads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
  returns: v.array(
    v.object({
      _creationTime: v.number(),
      _id: v.id("threads"),
      title: v.optional(v.string()),
      userId: v.id("users"),
    })
  ),
});

export const get = query({
  args: { threadId: v.id("threads") },
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
  returns: v.union(
    v.object({
      _creationTime: v.number(),
      _id: v.id("threads"),
      title: v.optional(v.string()),
      userId: v.id("users"),
    }),
    v.null()
  ),
});

export const remove = mutation({
  args: { threadId: v.id("threads") },
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
    await Promise.all(
      messages.map((message) => ctx.db.delete("messages", message._id))
    );

    await ctx.db.delete("threads", args.threadId);
    return null;
  },
  returns: v.null(),
});

export const updateTitle = mutation({
  args: { threadId: v.id("threads"), title: v.string() },
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
  returns: v.null(),
});

export const updateTitleInternal = internalMutation({
  args: { threadId: v.id("threads"), title: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch("threads", args.threadId, { title: args.title });
    return null;
  },
  returns: v.null(),
});
