import { useAuth } from "@repo/auth/client.native";
import { useNotificationListeners } from "@repo/notifications/native";
import { Redirect, Tabs } from "expo-router";
import { Home, Settings } from "lucide-react-native";
import { useColorScheme } from "react-native";
import { THEME } from "@/lib/theme";

const NotificationListeners = () => {
  useNotificationListeners();
  return null;
};

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const colorScheme = useColorScheme();
  const theme = THEME[colorScheme === "dark" ? "dark" : "light"];

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <>
      <NotificationListeners />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Settings color={color} size={size} />
            ),
            title: "Settings",
          }}
        />
      </Tabs>
    </>
  );
}
