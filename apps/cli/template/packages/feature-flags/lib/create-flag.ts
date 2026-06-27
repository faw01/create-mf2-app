import { analytics } from "@repo/analytics/server";
import { auth } from "@repo/auth/server";
import { flag } from "flags/next";

export const createFlag = (key: string, defaultValue = false) =>
  flag({
    key,
    defaultValue,
    async decide() {
      const { userId } = await auth();

      if (!userId) {
        return this.defaultValue as boolean;
      }

      if (!analytics) {
        return this.defaultValue as boolean;
      }

      const flags = await analytics.evaluateFlags(userId, {
        flagKeys: [key],
      });

      return flags.isEnabled(key) ?? (this.defaultValue as boolean);
    },
  });
