import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    emptyStringAsUndefined: true,
    runtimeEnv: {
      FLAGS_SECRET: process.env.FLAGS_SECRET,
    },
    server: {
      FLAGS_SECRET: z.string().optional(),
    },
  });
