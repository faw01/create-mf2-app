import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

type DesktopConvexProviderProps = {
  readonly children: ReactNode;
};

// TODO: Wire up Clerk auth for desktop once @clerk/electron is available.
// For now, Convex connects without auth.
export const DesktopConvexProvider = ({
  children,
}: DesktopConvexProviderProps) => {
  if (!convex) {
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
};

// When VITE_CONVEX_URL is unset the provider renders children without a
// Convex context, so any useQuery/useMutation/useAction descendant throws
// at runtime. These let UI degrade instead of crashing.
export const useConvexConfigured = (): boolean => convex !== null;

type ConvexGateProps = {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
};

export const ConvexGate = ({ children, fallback = null }: ConvexGateProps) =>
  convex ? children : fallback;
