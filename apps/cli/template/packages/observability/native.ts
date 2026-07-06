import { init, mobileReplayIntegration, wrap } from "@sentry/react-native";

export const wrapWithSentry = wrap;

export const initSentry = (): void => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    return;
  }

  init({
    dsn,
    integrations: [mobileReplayIntegration()],
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
  });
};
