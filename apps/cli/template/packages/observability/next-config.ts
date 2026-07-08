import { withLogtail } from "@logtail/next";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { keys } from "./keys";

export const sentryConfig: Parameters<typeof withSentryConfig>[1] = {
  org: keys().SENTRY_ORG,
  project: keys().SENTRY_PROJECT,

  silent: !process.env.CI,

  /*
   * Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
   * This can increase your server load as well as your hosting bill.
   * Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
   * side errors will fail.
   */
  tunnelRoute: "/monitoring",

  webpack: {
    // Automatic instrumentation of Vercel Cron Monitors; does not yet work
    // with App Router route handlers.
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
};

export const withSentry = (sourceConfig: NextConfig): NextConfig => {
  const configWithTranspile = {
    ...sourceConfig,
    transpilePackages: [
      ...(sourceConfig.transpilePackages ?? []),
      "@sentry/nextjs",
    ],
  };

  return withSentryConfig(configWithTranspile, sentryConfig);
};

// Every env var @logtail/next reads for its ingestion config (see its
// platform/generic.ts and config.ts), including the legacy Logtail spellings
// and the Vercel marketplace integration endpoint.
const betterStackEnvVars = [
  "NEXT_PUBLIC_BETTER_STACK_INGESTING_URL",
  "BETTER_STACK_INGESTING_URL",
  "BETTER_STACK_INGEST_ENDPOINT",
  // This is a vendor-defined env var *name* that @logtail/next reads, not a
  // secret value; BetterStack source tokens are designed for client-side
  // ingestion (like PostHog keys) and the SDK looks for this exact spelling.
  // react-doctor-disable-next-line react-doctor/public-env-secret-name
  "NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN",
  "BETTER_STACK_SOURCE_TOKEN",
  "NEXT_PUBLIC_BETTER_STACK_CUSTOM_ENDPOINT",
  "NEXT_PUBLIC_LOGTAIL_URL",
  "LOGTAIL_URL",
  "NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN",
  "LOGTAIL_SOURCE_TOKEN",
];

/*
 * When none of BetterStack's env vars are set, withLogtail's injected
 * rewrites() warns "Envvars not detected" on every dev compile and then does
 * nothing (logs fall back to console anyway). Skip the wrapper entirely in
 * that case, mirroring how withToolbar skips without FLAGS_SECRET. With any
 * of the vars set, behavior is unchanged, including @logtail/next's own
 * warning about a half-configured setup.
 */
export const withLogging = (config: NextConfig): NextConfig =>
  betterStackEnvVars.some((name) => process.env[name])
    ? withLogtail(config)
    : config;
