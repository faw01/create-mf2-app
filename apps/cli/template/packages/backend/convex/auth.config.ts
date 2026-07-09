import type { AuthConfig } from "convex/server";

const clerkIssuerDomain =
  "CLERK_JWT_ISSUER_DOMAIN" in process.env
    ? process.env.CLERK_JWT_ISSUER_DOMAIN
    : undefined;

export default {
  providers: clerkIssuerDomain
    ? [
        {
          applicationID: "convex",
          domain: clerkIssuerDomain,
        },
      ]
    : [],
} satisfies AuthConfig;
