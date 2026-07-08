import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_CONVEX_URL: z.url().optional(),
});

export const keys = () =>
  envSchema.parse({
    EXPO_PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL,
  });
