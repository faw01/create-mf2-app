// biome-ignore lint/performance/noNamespaceImport: Sentry SDK convention
import * as Sentry from "@sentry/nextjs";
import { keys } from "./keys";

export const initializeSentry = (): ReturnType<typeof Sentry.init> =>
  Sentry.init({
    debug: false,
    dsn: keys().NEXT_PUBLIC_SENTRY_DSN,

    enableLogs: true,

    integrations: [
      Sentry.replayIntegration({
        blockAllMedia: true,
        maskAllText: true,
      }),
      Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
    ],

    replaysOnErrorSampleRate: 1,

    // You may want 100% in development and a lower rate in production.
    replaysSessionSampleRate: 0.1,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,
  });

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
