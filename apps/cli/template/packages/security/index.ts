import arcjet, {
  type ArcjetBotCategory,
  type ArcjetWellKnownBot,
  detectBot,
  request,
  shield,
} from "@arcjet/next";
import { keys } from "./keys";

const arcjetKey = keys().ARCJET_KEY;

export type SecurityErrorReason = "bot" | "rate_limit" | "denied";

const securityErrorMessages: Record<SecurityErrorReason, string> = {
  bot: "No bots allowed",
  rate_limit: "Rate limit exceeded",
  denied: "Access denied",
};

export class SecurityError extends Error {
  readonly reason: SecurityErrorReason;

  constructor(reason: SecurityErrorReason) {
    super(securityErrorMessages[reason]);
    this.name = "SecurityError";
    this.reason = reason;
  }
}

const base = arcjetKey
  ? arcjet({
      key: arcjetKey,
      characteristics: ["ip.src"],
      rules: [
        shield({
          // "LIVE" blocks requests; use "DRY_RUN" to log only.
          mode: "LIVE",
        }),
      ],
    })
  : undefined;

export const secure = async (
  allow: (ArcjetWellKnownBot | ArcjetBotCategory)[],
  sourceRequest?: Request
) => {
  if (!base) {
    return;
  }

  const req = sourceRequest ?? (await request());
  const decision = await base
    .withRule(detectBot({ mode: "LIVE", allow }))
    .protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      throw new SecurityError("bot");
    }

    if (decision.reason.isRateLimit()) {
      throw new SecurityError("rate_limit");
    }

    throw new SecurityError("denied");
  }
};
