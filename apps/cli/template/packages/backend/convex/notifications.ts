import { PushNotifications } from "@convex-dev/expo-push-notifications";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { mustGetCurrentUser } from "./auth/users";

const pushNotifications = new PushNotifications(components.pushNotifications);

export const recordToken = mutation({
  args: { pushToken: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    await pushNotifications.recordToken(ctx, {
      userId: user._id,
      pushToken: args.pushToken,
    });
    return null;
  },
});

export const send = mutation({
  args: {
    title: v.string(),
    body: v.optional(v.string()),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    return await pushNotifications.sendPushNotification(ctx, {
      userId: user._id,
      notification: {
        title: args.title,
        body: args.body,
      },
    });
  },
});

export const getStatus = query({
  args: {},
  returns: v.object({
    hasToken: v.boolean(),
    isPaused: v.boolean(),
  }),
  handler: async (ctx) => {
    const user = await mustGetCurrentUser(ctx);
    const status = await pushNotifications.getStatusForUser(ctx, {
      userId: user._id,
    });
    return { hasToken: status.hasToken, isPaused: status.paused };
  },
});

export const getNotification = query({
  args: { id: v.string() },
  returns: v.union(
    v.object({
      state: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    await mustGetCurrentUser(ctx);
    const notification = await pushNotifications.getNotification(ctx, args);
    if (!notification) {
      return null;
    }
    return { state: notification.state };
  },
});
