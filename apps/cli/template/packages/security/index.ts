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
  denied: "Access denied",
  rate_limit: "Rate limit exceeded",
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
      characteristics: ["ip.src"],
      key: arcjetKey,
      rules: [
        shield({
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
    .withRule(detectBot({ allow, mode: "LIVE" }))
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
