import Constants from "expo-constants";
import { isDevice } from "expo-device";
import {
  AndroidImportance,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (): Promise<
  string | null
> => {
  if (Platform.OS === "web" || !isDevice) {
    return null;
  }

  if (Platform.OS === "android") {
    await setNotificationChannelAsync("default", {
      name: "default",
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    return null;
  }

  const { data: token } = await getExpoPushTokenAsync({ projectId });
  return token;
};

export const useNotificationListeners = (
  onTokenReceived?: (token: string) => void
) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const responseListenerRef = useRef<ReturnType<
    typeof addNotificationResponseReceivedListener
  > | null>(null);
  const notificationListenerRef = useRef<ReturnType<
    typeof addNotificationReceivedListener
  > | null>(null);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        onTokenReceived?.(token);
      }
    });

    notificationListenerRef.current = addNotificationReceivedListener(() => {
      // Notification received while app is foregrounded
    });

    responseListenerRef.current = addNotificationResponseReceivedListener(
      () => {
        // User tapped on notification
      }
    );

    return () => {
      notificationListenerRef.current?.remove();
      responseListenerRef.current?.remove();
    };
  }, [onTokenReceived]);

  return { expoPushToken };
};
