import { useClerk, useUser } from "@repo/auth/client.native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, Text, View } from "@/tw";

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="border-border border-b px-4 pt-3 pb-3">
        <Text className="font-semibold text-foreground text-lg">Settings</Text>
      </View>
      <View className="p-6">
        {user ? (
          <View className="mb-6 rounded-lg border border-border bg-card p-4">
            <Text className="font-semibold text-foreground text-lg">
              {user.fullName ?? "User"}
            </Text>
            <Text className="text-muted-foreground text-sm">
              {user.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        ) : null}
        <Pressable
          className="rounded-lg bg-destructive px-4 py-3"
          onPress={handleSignOut}
        >
          <Text className="text-center font-medium text-destructive-foreground">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
