import type { WebhookEvent } from "@clerk/backend";
import { verifyWebhook } from "@clerk/backend/webhooks";
import { registerRoutes } from "@convex-dev/stripe";
import { httpRouter } from "convex/server";
import { components, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { env } from "./convex.env";
import { resend } from "./email/index";

const http = httpRouter();

http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Without the signing secret no event can be verified, so the route
    // reports itself unconfigured instead of failing verification.
    const signingSecret = env.CLERK_WEBHOOK_SECRET;
    if (!signingSecret) {
      console.warn(
        "Skipping Clerk webhook: set CLERK_WEBHOOK_SECRET to enable"
      );
      return new Response("Clerk webhook is not configured", { status: 503 });
    }

    let event: WebhookEvent;
    try {
      event = await verifyWebhook(request, { signingSecret });
    } catch {
      return new Response("Invalid webhook", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.auth.users.updateOrCreateUser, {
          clerkUser: event.data,
        });
        break;
      case "user.deleted":
        if (event.data.id) {
          await ctx.runMutation(internal.auth.users.deleteUserByClerkId, {
            id: event.data.id,
          });
        }
        break;
      default:
        break;
    }

    return new Response("OK", { status: 200 });
  }),
});

http.route({
  path: "/webhooks/resend",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    // The resend component throws on a missing secret; answer 503 instead.
    if (!env.RESEND_WEBHOOK_SECRET) {
      console.warn(
        "Skipping Resend webhook: set RESEND_WEBHOOK_SECRET to enable"
      );
      return new Response("Resend webhook is not configured", { status: 503 });
    }
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
});

export default http;
