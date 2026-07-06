import { PushNotifications } from "@convex-dev/expo-push-notifications";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { mustGetCurrentUser } from "./auth/users";

const pushNotifications = new PushNotifications(components.pushNotifications);

export const recordToken = mutation({
  args: { pushToken: v.string() },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    await pushNotifications.recordToken(ctx, {
      pushToken: args.pushToken,
      userId: user._id,
    });
    return null;
  },
  returns: v.null(),
});

export const send = mutation({
  args: {
    body: v.optional(v.string()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    return await pushNotifications.sendPushNotification(ctx, {
      notification: {
        body: args.body,
        title: args.title,
      },
      userId: user._id,
    });
  },
  returns: v.union(v.string(), v.null()),
});

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await mustGetCurrentUser(ctx);
    const status = await pushNotifications.getStatusForUser(ctx, {
      userId: user._id,
    });
    return { hasToken: status.hasToken, isPaused: status.paused };
  },
  returns: v.object({
    hasToken: v.boolean(),
    isPaused: v.boolean(),
  }),
});

export const getNotification = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    await mustGetCurrentUser(ctx);
    const notification = await pushNotifications.getNotification(ctx, args);
    if (!notification) {
      return null;
    }
    return { state: notification.state };
  },
  returns: v.union(
    v.object({
      state: v.string(),
    }),
    v.null()
  ),
});
