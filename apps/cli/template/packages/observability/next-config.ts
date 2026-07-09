import { withLogtail } from "@logtail/next";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { keys } from "./keys";

export const sentryConfig: Parameters<typeof withSentryConfig>[1] = {
  org: keys().SENTRY_ORG,
  project: keys().SENTRY_PROJECT,

  silent: !process.env.CI,

  tunnelRoute: "/monitoring",

  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },

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

const betterStackEnvVars = [
  "NEXT_PUBLIC_BETTER_STACK_INGESTING_URL",
  "BETTER_STACK_INGESTING_URL",
  "BETTER_STACK_INGEST_ENDPOINT",
  // react-doctor-disable-next-line react-doctor/public-env-secret-name
  "NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN",
  "BETTER_STACK_SOURCE_TOKEN",
  "NEXT_PUBLIC_BETTER_STACK_CUSTOM_ENDPOINT",
  "NEXT_PUBLIC_LOGTAIL_URL",
  "LOGTAIL_URL",
  "NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN",
  "LOGTAIL_SOURCE_TOKEN",
];

export const withLogging = (config: NextConfig): NextConfig =>
  betterStackEnvVars.some((name) => process.env[name])
    ? withLogtail(config)
    : config;
