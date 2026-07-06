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
        redirectUrl: makeRedirectUri(),
        strategy,
      });

      if (createdSessionId && setActive) {
        await setActive({
          navigate: ({ session }) => {
            if (session?.currentTask) {
              return;
            }
            router.replace(redirectPath);
          },
          session: createdSessionId,
        });
        return { success: true as const };
      }

      return { reason: "missing_requirements", success: false as const };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "OAuth sign-in failed";
      return { reason: message, success: false as const };
    }
  }, [startSSOFlow, strategy, router, redirectPath]);

  return { startOAuth };
};
