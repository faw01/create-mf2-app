// biome-ignore lint/performance/noNamespaceImport: Sentry SDK convention
import * as Sentry from "@sentry/nextjs";
import { keys } from "./keys";

export const initializeSentry = (): ReturnType<typeof Sentry.init> =>
  Sentry.init({
    debug: false,
    dsn: keys().NEXT_PUBLIC_SENTRY_DSN,

    enableLogs: true,

    includeLocalVariables: true,

    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
    ],

    tracesSampleRate: 1,
  });
