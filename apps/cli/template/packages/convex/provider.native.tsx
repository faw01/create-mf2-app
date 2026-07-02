import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ComponentProps, ReactNode } from "react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const convex = convexUrl
  ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false })
  : null;

type ConvexClientProviderProps = {
  children: ReactNode;
  useAuth: ComponentProps<typeof ConvexProviderWithClerk>["useAuth"];
};

export function ConvexClientProvider({
  children,
  useAuth,
}: ConvexClientProviderProps) {
  if (!convex) {
    return children;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

// When EXPO_PUBLIC_CONVEX_URL is unset the provider renders children without
// a Convex context, so any useQuery/useMutation/useAction descendant throws
// at runtime. These let UI degrade instead of crashing.
export function useConvexConfigured(): boolean {
  return convex !== null;
}

type ConvexGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function ConvexGate({ children, fallback = null }: ConvexGateProps) {
  return convex ? children : fallback;
}
