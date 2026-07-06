import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_KNOCK_API_KEY: z.string().optional(),
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: z.string().optional(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      KNOCK_SECRET_API_KEY: process.env.KNOCK_SECRET_API_KEY,
      NEXT_PUBLIC_KNOCK_API_KEY: process.env.NEXT_PUBLIC_KNOCK_API_KEY,
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID:
        process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID,
    },
    server: {
      KNOCK_SECRET_API_KEY: z.string().optional(),
    },
  });
