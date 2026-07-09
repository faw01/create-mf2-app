"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ComponentProps, ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

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
