import { v } from "convex/values";
import { createEnv } from "convex-env";

// Every key is optional so a fresh scaffold pushes with zero keys. A blank
// or missing value disables that integration (the emptyStringAsUndefined
// convention used by the Next.js env schemas); consumers guard for it and
// log what to set. The convex-env clerk/resend presets are not used because
// they hard-require their variables.
const schema = {
  CLERK_JWT_ISSUER_DOMAIN: v.optional(v.string()),
  CLERK_SECRET_KEY: v.optional(v.string()),
  CLERK_WEBHOOK_SECRET: v.optional(v.string()),
  RESEND_API_KEY: v.optional(v.string()),
  RESEND_WEBHOOK_SECRET: v.optional(v.string()),
  AI_GATEWAY_API_KEY: v.optional(v.string()),
  AI_GATEWAY_URL: v.optional(v.string()),
};

// convex-env rejects variables that are set to an empty string, even when
// optional, so blank values are normalized to undefined before validation.
const values = Object.fromEntries(
  Object.keys(schema).map((key) => {
    const value = process.env[key];
    return [key, value?.trim() ? value : undefined] as const;
  })
);

export const env = createEnv({ schema, values });
