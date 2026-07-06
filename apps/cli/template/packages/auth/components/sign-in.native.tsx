import { useSignIn } from "@clerk/clerk-expo";
import type { EmailCodeFactor } from "@clerk/types";
import { type Href, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type SignInProps = {
  redirectPath?: Href;
};

export const SignIn = ({ redirectPath = "/(tabs)" }: SignInProps) => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({
          navigate: ({ session }) => {
            if (session?.currentTask) {
              return;
            }
            router.replace(redirectPath);
          },
          session: result.createdSessionId,
        });
      } else if (result.status === "needs_second_factor") {
        const emailCodeFactor = result.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor =>
            factor.strategy === "email_code"
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            emailAddressId: emailCodeFactor.emailAddressId,
            strategy: "email_code",
          });
          setShowEmailCode(true);
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email, password, setActive, router, redirectPath]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await signIn.attemptSecondFactor({
        code,
        strategy: "email_code",
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({
          navigate: ({ session }) => {
            if (session?.currentTask) {
              return;
            }
            router.replace(redirectPath);
          },
          session: result.createdSessionId,
        });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, code, setActive, router, redirectPath]);

  const goToSignUp = useCallback(() => {
    router.push("/(auth)/sign-up");
  }, [router]);

  if (showEmailCode) {
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
        Sign In
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
        autoComplete="password"
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
        onPress={handleSignIn}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="font-medium text-primary-foreground">Sign In</Text>
        )}
      </Pressable>

      <Pressable className="mt-4" onPress={goToSignUp}>
        <Text className="text-center text-muted-foreground text-sm">
          Don't have an account? <Text className="text-primary">Sign Up</Text>
        </Text>
      </Pressable>
    </View>
  );
};
