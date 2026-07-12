import type { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ComponentProps, ReactNode } from "react";

type ConvexClientProviderProps = {
  children: ReactNode;
  useAuth: ComponentProps<typeof ConvexProviderWithClerk>["useAuth"];
};

type ConvexGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export const createConvexComponents = (convex: ConvexReactClient | null) => {
  function ConvexClientProvider({
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

  function useConvexConfigured(): boolean {
    return convex !== null;
  }

  function ConvexGate({ children, fallback = null }: ConvexGateProps) {
    return convex ? children : fallback;
  }

  return { ConvexClientProvider, ConvexGate, useConvexConfigured };
};
