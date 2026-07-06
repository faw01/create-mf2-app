import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    emptyStringAsUndefined: true,
    runtimeEnv: {
      BASEHUB_TOKEN: process.env.BASEHUB_TOKEN,
    },
    server: {
      BASEHUB_TOKEN: z.string().startsWith("bshb_pk_").optional(),
    },
  });
