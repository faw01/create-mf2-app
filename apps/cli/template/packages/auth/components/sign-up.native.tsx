import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type SignUpProps = {
  redirectPath?: string;
};

export const SignUp = ({ redirectPath = "/(tabs)" }: SignUpProps) => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    setError("");

    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, email, password]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({
          session: result.createdSessionId,
          navigate: ({ session }) => {
            if (session?.currentTask) {
              return;
            }
            router.replace(redirectPath);
          },
        });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, code, setActive, router, redirectPath]);

  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center px-6">
        <Text className="mb-2 text-center font-bold text-3xl text-foreground">
          Verify your email
        </Text>
        <Text className="mb-8 text-center text-muted-foreground text-sm">
          A verification code has been sent to your email.
        </Text>

        {error ? (
          <Text className="mb-4 text-center text-destructive text-sm">
            {error}
          </Text>
        ) : null}

        <TextInput
          autoComplete="one-time-code"
          className="mb-6 h-12 rounded-md border border-input bg-background px-3 text-center text-base text-foreground"
          keyboardType="number-pad"
          onChangeText={setCode}
          placeholder="Enter verification code"
          placeholderTextColor="#9ca3af"
          value={code}
        />

        <Pressable
          className="h-12 items-center justify-center rounded-md bg-primary"
          disabled={loading}
          onPress={handleVerify}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-medium text-primary-foreground">Verify</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center px-6">
      <Text className="mb-8 text-center font-bold text-3xl text-foreground">
        Create Account
      </Text>

      {error ? (
        <Text className="mb-4 text-center text-destructive text-sm">
          {error}
        </Text>
      ) : null}

      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        className="mb-3 h-12 rounded-md border border-input bg-background px-3 text-base text-foreground"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        value={email}
      />

      <TextInput
        autoComplete="new-password"
        className="mb-6 h-12 rounded-md border border-input bg-background px-3 text-base text-foreground"
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={password}
      />

      <Pressable
        className="h-12 items-center justify-center rounded-md bg-primary"
        disabled={loading || !email || !password}
        onPress={handleSignUp}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="font-medium text-primary-foreground">
            Create Account
          </Text>
        )}
      </Pressable>

      <Pressable
        className="mt-4"
        onPress={() => router.push("/(auth)/sign-in")}
      >
        <Text className="text-center text-muted-foreground text-sm">
          Already have an account? <Text className="text-primary">Sign In</Text>
        </Text>
      </Pressable>
    </View>
  );
};
