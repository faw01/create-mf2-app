"use client";

import { NotificationsProvider as RawNotificationsProvider } from "@repo/notifications/components/provider";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

type NotificationsProviderProperties = {
  children: ReactNode;
  userId: string;
};

export const NotificationsProvider = ({
  children,
  userId,
}: NotificationsProviderProperties) => {
  const { resolvedTheme } = useTheme();
  // resolvedTheme is undefined until next-themes hydrates.
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <RawNotificationsProvider theme={theme} userId={userId}>
      {children}
    </RawNotificationsProvider>
  );
};
