import type { AuthConfig } from "convex/server";

// Deliberately reads process.env instead of convex.env: the push-time auth
// config evaluation fails on any read of an unset variable ("is used in
// auth config file but its value was not set"), and createEnv reads every
// schema key. Probing with `in` keeps a zero-key scaffold pushable.
const clerkIssuerDomain =
  "CLERK_JWT_ISSUER_DOMAIN" in process.env
    ? process.env.CLERK_JWT_ISSUER_DOMAIN
    : undefined;

// Without CLERK_JWT_ISSUER_DOMAIN there is no auth provider: every request
// is anonymous and auth-gated functions return their signed-out state. Set
// it (Clerk dashboard, JWT template named "convex") to enable sign-in.
export default {
  providers: clerkIssuerDomain
    ? [
        {
          domain: clerkIssuerDomain,
          applicationID: "convex",
        },
      ]
    : [],
} satisfies AuthConfig;
