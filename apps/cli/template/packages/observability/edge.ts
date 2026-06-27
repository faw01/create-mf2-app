// biome-ignore lint/performance/noNamespaceImport: Sentry SDK convention
import * as Sentry from "@sentry/nextjs";
import { keys } from "./keys";

export const initializeSentry = (): ReturnType<typeof Sentry.init> =>
  Sentry.init({
    dsn: keys().NEXT_PUBLIC_SENTRY_DSN,

    enableLogs: true,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    debug: false,

    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
    ],
  });
