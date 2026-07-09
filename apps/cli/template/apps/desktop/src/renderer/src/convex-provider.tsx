import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

type DesktopConvexProviderProps = {
  readonly children: ReactNode;
};

export const DesktopConvexProvider = ({
  children,
}: DesktopConvexProviderProps) => {
  if (!convex) {
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
};

export const useConvexConfigured = (): boolean => convex !== null;

type ConvexGateProps = {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
};

export const ConvexGate = ({ children, fallback = null }: ConvexGateProps) =>
  convex ? children : fallback;
