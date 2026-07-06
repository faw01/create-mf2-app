import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { getCurrentUser } from "../../auth/users";

export const search = query({
  args: {
    limit: v.optional(v.number()),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const searchQuery = args.query.trim();
    if (!searchQuery) {
      return [];
    }

    const limit = args.limit ?? 20;

    const titleMatches = await ctx.db
      .query("threads")
      .withSearchIndex("search_title", (q) =>
        q.search("title", searchQuery).eq("userId", user._id)
      )
      .take(50);

    const titleMatchIds = new Set(titleMatches.map((t) => t._id));

    const messageMatches = await ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q) =>
        q.search("content", searchQuery)
      )
      .take(100);

    const userThreads = await ctx.db
      .query("threads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const userThreadIds = new Set(userThreads.map((t) => t._id));

    const contentMatchThreadIds = new Set<Id<"threads">>();
    for (const msg of messageMatches) {
      if (userThreadIds.has(msg.threadId) && !titleMatchIds.has(msg.threadId)) {
        contentMatchThreadIds.add(msg.threadId);
      }
    }

    const contentMatchThreads = userThreads.filter((t) =>
      contentMatchThreadIds.has(t._id)
    );
    contentMatchThreads.sort((a, b) => b._creationTime - a._creationTime);

    const combined = [...titleMatches, ...contentMatchThreads];

    return combined.slice(0, limit);
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
