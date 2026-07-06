import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    emptyStringAsUndefined: true,
    runtimeEnv: {
      AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
      AI_GATEWAY_URL: process.env.AI_GATEWAY_URL,
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    },
    server: {
      AI_GATEWAY_API_KEY: z.string().min(1).optional(),
      AI_GATEWAY_URL: z.url().default("https://ai-gateway.vercel.sh/v3"),
      PERPLEXITY_API_KEY: z.string().min(1).optional(),
    },
  });
