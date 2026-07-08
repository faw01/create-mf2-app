import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_POSTHOG_HOST: z.url().optional(),
  EXPO_PUBLIC_POSTHOG_KEY: z.string().optional(),
});

export const keys = () =>
  envSchema.parse({
    EXPO_PUBLIC_POSTHOG_HOST: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    EXPO_PUBLIC_POSTHOG_KEY: process.env.EXPO_PUBLIC_POSTHOG_KEY,
  });
