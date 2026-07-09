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

    replaysSessionSampleRate: 0.1,

    tracesSampleRate: 1,
  });

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
