import { keys as analytics } from "@repo/analytics/keys";
import { keys as auth } from "@repo/auth/keys";
import { keys as core } from "@repo/next-config/keys";
import { keys as observability } from "@repo/observability/keys";
import { keys as payments } from "@repo/payments/keys";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  client: {},
  emptyStringAsUndefined: true,
  extends: [auth(), analytics(), core(), observability(), payments()],
  runtimeEnv: {},
  server: {},
});
