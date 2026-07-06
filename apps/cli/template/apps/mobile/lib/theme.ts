import type { Theme } from "expo-router/react-navigation";
import { DarkTheme, DefaultTheme } from "expo-router/react-navigation";

export const THEME = {
  dark: {
    accent: "hsl(0 0% 14.9%)",
    accentForeground: "hsl(0 0% 98%)",
    background: "hsl(0 0% 3.9%)",
    border: "hsl(0 0% 14.9%)",
    card: "hsl(0 0% 3.9%)",
    cardForeground: "hsl(0 0% 98%)",
    destructive: "hsl(0 70.9% 59.4%)",
    foreground: "hsl(0 0% 98%)",
    input: "hsl(0 0% 14.9%)",
    muted: "hsl(0 0% 14.9%)",
    mutedForeground: "hsl(0 0% 63.9%)",
    popover: "hsl(0 0% 3.9%)",
    popoverForeground: "hsl(0 0% 98%)",
    primary: "hsl(0 0% 98%)",
    primaryForeground: "hsl(0 0% 9%)",
    ring: "hsl(300 0% 45%)",
    secondary: "hsl(0 0% 14.9%)",
    secondaryForeground: "hsl(0 0% 98%)",
  },
  light: {
    accent: "hsl(0 0% 96.1%)",
    accentForeground: "hsl(0 0% 9%)",
    background: "hsl(0 0% 100%)",
    border: "hsl(0 0% 89.8%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(0 0% 3.9%)",
    destructive: "hsl(0 84.2% 60.2%)",
    foreground: "hsl(0 0% 3.9%)",
    input: "hsl(0 0% 89.8%)",
    muted: "hsl(0 0% 96.1%)",
    mutedForeground: "hsl(0 0% 45.1%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(0 0% 3.9%)",
    primary: "hsl(0 0% 9%)",
    primaryForeground: "hsl(0 0% 98%)",
    ring: "hsl(0 0% 63%)",
    secondary: "hsl(0 0% 96.1%)",
    secondaryForeground: "hsl(0 0% 9%)",
  },
} as const;

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
};
