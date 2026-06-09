import { AnalyticsProvider } from "@repo/analytics/provider.native";
import { useAuth } from "@repo/auth/client.native";
import { AuthProvider } from "@repo/auth/provider.native";
import { ConvexClientProvider } from "@repo/convex/provider.native";
import { DesignSystemNativeProvider } from "@repo/design-system-native";
import { initSentry, wrapWithSentry } from "@repo/observability/native";
import { initRevenueCat } from "@repo/payments/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { NAV_THEME } from "@/lib/theme";
import "../global.css";

preventAutoHideAsync();

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

initSentry();

const hasRevenueCatKeys = Boolean(
  process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY ||
    process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY
);

if (hasRevenueCatKeys) {
  initRevenueCat();
}

const ConvexProviderWithAuth = ({
  children,
}: {
  readonly children: React.ReactNode;
}) => <ConvexClientProvider useAuth={useAuth}>{children}</ConvexClientProvider>;

function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = NAV_THEME[colorScheme === "dark" ? "dark" : "light"];

  useEffect(() => {
    hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <DesignSystemNativeProvider>
          <AnalyticsProvider>
            <AuthProvider publishableKey={clerkPublishableKey}>
              <ConvexProviderWithAuth>
                <ThemeProvider value={theme}>
                  <StatusBar
                    style={colorScheme === "dark" ? "light" : "dark"}
                  />
                  <Stack screenOptions={{ headerShown: false }} />
                  <PortalHost />
                </ThemeProvider>
              </ConvexProviderWithAuth>
            </AuthProvider>
          </AnalyticsProvider>
        </DesignSystemNativeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

export default wrapWithSentry(RootLayout);
