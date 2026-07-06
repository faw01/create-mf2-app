"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";

type ClerkAppearance = ComponentProps<typeof ClerkProvider>["appearance"];

type AuthProviderProperties = ComponentProps<typeof ClerkProvider> & {
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
};

export const AuthProvider = ({
  privacyUrl,
  termsUrl,
  helpUrl,
  ...properties
}: AuthProviderProperties) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const appearance: ClerkAppearance = {
    elements: {
      dividerLine: "bg-border",
      navbarButton: "text-foreground",
      organizationPreview__organizationSwitcherTrigger: "gap-2",
      organizationPreviewAvatarContainer: "shrink-0",
      organizationPreviewMainIdentifier: "text-foreground",
      organizationSwitcherTrigger__open: "bg-background",
      organizationSwitcherTriggerIcon: "text-muted-foreground",
      socialButtonsIconButton: "bg-card",
    },
    options: {
      helpPageUrl: helpUrl,
      privacyPageUrl: privacyUrl,
      termsPageUrl: termsUrl,
    },
    theme: isDark ? dark : undefined,
    variables: {
      fontFamily: "var(--font-sans)",
      fontFamilyButtons: "var(--font-sans)",
      fontWeight: {
        bold: "var(--font-weight-bold)",
        medium: "var(--font-weight-medium)",
        normal: "var(--font-weight-normal)",
      },
    },
  };

  return <ClerkProvider {...properties} appearance={appearance} />;
};
