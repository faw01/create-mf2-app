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
    theme: isDark ? dark : undefined,
    options: {
      privacyPageUrl: privacyUrl,
      termsPageUrl: termsUrl,
      helpPageUrl: helpUrl,
    },
    variables: {
      fontFamily: "var(--font-sans)",
      fontFamilyButtons: "var(--font-sans)",
      fontWeight: {
        bold: "var(--font-weight-bold)",
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
      },
    },
    elements: {
      dividerLine: "bg-border",
      socialButtonsIconButton: "bg-card",
      navbarButton: "text-foreground",
      organizationSwitcherTrigger__open: "bg-background",
      organizationPreviewMainIdentifier: "text-foreground",
      organizationSwitcherTriggerIcon: "text-muted-foreground",
      organizationPreview__organizationSwitcherTrigger: "gap-2",
      organizationPreviewAvatarContainer: "shrink-0",
    },
  };

  return <ClerkProvider {...properties} appearance={appearance} />;
};
