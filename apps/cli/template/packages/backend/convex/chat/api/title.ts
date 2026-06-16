"use node";

import { generateChatTitle } from "@repo/ai/prompts/title";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { env } from "../../convex.env";

export const generateTitle = internalAction({
  args: { threadId: v.id("threads") },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    // Threads keep their default title rather than failing the action.
    if (!env.AI_GATEWAY_API_KEY) {
      console.info(
        "Skipping chat title generation: set AI_GATEWAY_API_KEY to enable"
      );
      return null;
    }

    // The return annotation above and the type here break a circular type
    // inference: an action that calls its own deployment's functions through
    // `internal` (or `api`) otherwise collapses the whole generated api type
    // to `any` for every consumer.
    const messages: Array<{ role: "user" | "assistant"; content: string }> =
      await ctx.runQuery(internal.chat.api.messages.getHistory, {
        threadId: args.threadId,
      });

    if (messages.length === 0) {
      return null;
    }

    const firstUserMessage = messages.find((m) => m.role === "user");
    if (!firstUserMessage) {
      return null;
    }

    const title = await generateChatTitle(firstUserMessage.content);

    await ctx.runMutation(internal.chat.api.threads.updateTitleInternal, {
      threadId: args.threadId,
      title,
    });

    return null;
  },
});
