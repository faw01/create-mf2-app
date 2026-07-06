import { defineTable } from "convex/server";
import { v } from "convex/values";

export const textPart = v.object({
  text: v.string(),
  type: v.literal("text"),
});

export const reasoningPart = v.object({
  duration: v.optional(v.number()),
  text: v.string(),
  type: v.literal("reasoning"),
});

export const toolCallPart = v.object({
  args: v.any(),
  toolCallId: v.string(),
  toolName: v.string(),
  type: v.literal("tool-call"),
});

export const toolResultPart = v.object({
  errorText: v.optional(v.string()),
  output: v.optional(v.any()),
  toolCallId: v.string(),
  toolName: v.string(),
  type: v.literal("tool-result"),
});

export const messagePart = v.union(
  textPart,
  reasoningPart,
  toolCallPart,
  toolResultPart
);

export const chatTables = {
  messages: defineTable({
    content: v.string(),
    model: v.optional(v.string()),
    parts: v.optional(v.array(messagePart)),
    role: v.union(v.literal("user"), v.literal("assistant")),
    threadId: v.id("threads"),
  })
    .index("by_thread", ["threadId"])
    .searchIndex("search_content", {
      filterFields: ["threadId"],
      searchField: "content",
    }),
  threads: defineTable({
    title: v.optional(v.string()),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .searchIndex("search_title", {
      filterFields: ["userId"],
      searchField: "title",
    }),
};
