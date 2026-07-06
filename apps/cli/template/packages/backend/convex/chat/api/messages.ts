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
    content: v.string(),
    threadId: v.id("threads"),
  },
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
      content: args.content,
      role: "user",
      threadId: args.threadId,
    });

    const assistantMessageId = await ctx.db.insert("messages", {
      content: "",
      role: "assistant",
      threadId: args.threadId,
    });

    return { assistantMessageId, userMessageId };
  },
  returns: v.object({
    assistantMessageId: v.id("messages"),
    userMessageId: v.id("messages"),
  }),
});

export const list = query({
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

    return await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
  },
  returns: v.array(
    v.object({
      _creationTime: v.number(),
      _id: v.id("messages"),
      content: v.string(),
      model: v.optional(v.string()),
      parts: v.optional(v.array(messagePart)),
      role: v.union(v.literal("user"), v.literal("assistant")),
      threadId: v.id("threads"),
    })
  ),
});

export const getHistory = internalQuery({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();

    return messages
      .filter((m) => m.role === "user" || m.content.length > 0)
      .map((m) => ({ content: m.content, role: m.role }));
  },
  returns: v.array(
    v.object({
      content: v.string(),
      role: v.union(v.literal("user"), v.literal("assistant")),
    })
  ),
});

export const updateContent = internalMutation({
  args: {
    content: v.string(),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch("messages", args.messageId, { content: args.content });
    return null;
  },
  returns: v.null(),
});

export const persistExchange = mutation({
  args: {
    assistantContent: v.string(),
    model: v.optional(v.string()),
    parts: v.optional(v.array(messagePart)),
    threadId: v.id("threads"),
    userContent: v.string(),
  },
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
      content: args.userContent,
      parts: [{ text: args.userContent, type: "text" }],
      role: "user",
      threadId: args.threadId,
    });

    const assistantMessageId = await ctx.db.insert("messages", {
      content: args.assistantContent,
      model: args.model,
      parts: args.parts,
      role: "assistant",
      threadId: args.threadId,
    });

    return assistantMessageId;
  },
  returns: v.id("messages"),
});

export const scheduleTitle = mutation({
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

    await ctx.scheduler.runAfter(0, internal.chat.api.title.generateTitle, {
      threadId: args.threadId,
    });

    return null;
  },
  returns: v.null(),
});
