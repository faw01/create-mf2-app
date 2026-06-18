import { DesignSystemProvider } from "@repo/design-system";
import type { ReactNode } from "react";
import { DesktopConvexProvider } from "./convex-provider";

type ProvidersProps = {
  readonly children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => (
  <DesktopConvexProvider>
    <DesignSystemProvider>{children}</DesignSystemProvider>
  </DesktopConvexProvider>
);
