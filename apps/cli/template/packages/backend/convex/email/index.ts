import type { EmailId } from "@convex-dev/resend";
import { Resend, vOnEmailEventArgs } from "@convex-dev/resend";
import { v } from "convex/values";
import { components, internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { env } from "../convex.env";

export const resend: Resend = new Resend(components.resend, {
  onEmailEvent: internal.email.index.handleEmailEvent,
});

export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  handler: (_ctx, args) => {
    console.info(`Email event: ${args.event.type} for email ${args.id}`);
    return null;
  },
  returns: v.null(),
});

export const send = internalMutation({
  args: {
    from: v.string(),
    html: v.optional(v.string()),
    replyTo: v.optional(v.array(v.string())),
    subject: v.string(),
    text: v.optional(v.string()),
    to: v.union(v.string(), v.array(v.string())),
  },
  handler: async (ctx, args): Promise<EmailId> => {
    if (!env.RESEND_API_KEY) {
      throw new Error("Email is not configured: set RESEND_API_KEY to enable");
    }
    return await resend.sendEmail(ctx, {
      from: args.from,
      subject: args.subject,
      to: args.to,
      ...(args.html ? { html: args.html } : {}),
      ...(args.text ? { text: args.text } : {}),
      ...(args.replyTo ? { replyTo: args.replyTo } : {}),
    });
  },
  returns: v.string(),
});
