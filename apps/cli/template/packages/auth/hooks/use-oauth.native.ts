import { useSSO } from "@clerk/clerk-expo";
import { makeRedirectUri } from "expo-auth-session";
import { type Href, useRouter } from "expo-router";
import { useCallback } from "react";

type OAuthStrategy =
  | "oauth_google"
  | "oauth_apple"
  | "oauth_facebook"
  | "oauth_microsoft"
  | "oauth_github";

type UseOAuthFlowOptions = {
  redirectPath?: Href;
  strategy: OAuthStrategy;
};

export const useOAuthFlow = ({
  strategy,
  redirectPath = "/",
}: UseOAuthFlowOptions) => {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const startOAuth = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: makeRedirectUri(),
      });

      if (createdSessionId && setActive) {
        await setActive({
          session: createdSessionId,
          navigate: ({ session }) => {
            if (session?.currentTask) {
              return;
            }
            router.replace(redirectPath);
          },
        });
        return { success: true as const };
      }

      return { success: false as const, reason: "missing_requirements" };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "OAuth sign-in failed";
      return { success: false as const, reason: message };
    }
  }, [startSSOFlow, strategy, router, redirectPath]);

  return { startOAuth };
};
