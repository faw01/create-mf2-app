import { v } from "convex/values";
import { internal } from "../../_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../../_generated/server";
import { mustGetCurrentUser } from "../../auth/users";
import { messagePart } from "../tables";

export const send = mutation({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
  },
  returns: v.object({
    userMessageId: v.id("messages"),
    assistantMessageId: v.id("messages"),
  }),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const thread = await ctx.db.get("threads", args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const userMessageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: "user",
      content: args.content,
    });

    const assistantMessageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: "assistant",
      content: "",
    });

    return { userMessageId, assistantMessageId };
  },
});

export const list = query({
  args: { threadId: v.id("threads") },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      threadId: v.id("threads"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      parts: v.optional(v.array(messagePart)),
      model: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const thread = await ctx.db.get("threads", args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
  },
});

export const getHistory = internalQuery({
  args: { threadId: v.id("threads") },
  returns: v.array(
    v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();

    return messages
      .filter((m) => m.role === "user" || m.content.length > 0)
      .map((m) => ({ role: m.role, content: m.content }));
  },
});

export const updateContent = internalMutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("messages", args.messageId, { content: args.content });
    return null;
  },
});

export const persistExchange = mutation({
  args: {
    threadId: v.id("threads"),
    userContent: v.string(),
    assistantContent: v.string(),
    parts: v.optional(v.array(messagePart)),
    model: v.optional(v.string()),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const thread = await ctx.db.get("threads", args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: "user",
      content: args.userContent,
      parts: [{ type: "text", text: args.userContent }],
    });

    const assistantMessageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: "assistant",
      content: args.assistantContent,
      parts: args.parts,
      model: args.model,
    });

    return assistantMessageId;
  },
});

export const scheduleTitle = mutation({
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

    await ctx.scheduler.runAfter(0, internal.chat.api.title.generateTitle, {
      threadId: args.threadId,
    });

    return null;
  },
});
