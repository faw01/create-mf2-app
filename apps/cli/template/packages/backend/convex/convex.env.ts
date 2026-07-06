import { v } from "convex/values";
import { createEnv } from "convex-env";

const schema = {
  AI_GATEWAY_API_KEY: v.optional(v.string()),
  AI_GATEWAY_URL: v.optional(v.string()),
  CLERK_JWT_ISSUER_DOMAIN: v.optional(v.string()),
  CLERK_SECRET_KEY: v.optional(v.string()),
  CLERK_WEBHOOK_SECRET: v.optional(v.string()),
  RESEND_API_KEY: v.optional(v.string()),
  RESEND_FROM: v.optional(v.string()),
  RESEND_WEBHOOK_SECRET: v.optional(v.string()),
};

const values = Object.fromEntries(
  Object.keys(schema).map((key) => {
    const value = process.env[key];
    return [key, value?.trim() ? value : undefined] as const;
  })
);

export const env = createEnv({ schema, values });
