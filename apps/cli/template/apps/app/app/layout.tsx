import { env } from "@/env";
import "./styles.css";
import { AnalyticsProvider } from "@repo/analytics/provider";
import { AuthProvider } from "@repo/auth/provider";
import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";
import { Toolbar } from "@repo/feature-flags/components/toolbar";
import type { ReactNode } from "react";
import { AppConvexProvider } from "./convex-provider";

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const legalUrl = (path: string): string | undefined =>
  env.NEXT_PUBLIC_WEB_URL
    ? new URL(path, env.NEXT_PUBLIC_WEB_URL).toString()
    : undefined;

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={fonts} lang="en" suppressHydrationWarning>
    <body>
      <AnalyticsProvider>
        <DesignSystemProvider>
          <AuthProvider
            helpUrl={env.NEXT_PUBLIC_DOCS_URL}
            privacyUrl={legalUrl("/legal/privacy")}
            termsUrl={legalUrl("/legal/terms")}
          >
            <AppConvexProvider>{children}</AppConvexProvider>
          </AuthProvider>
        </DesignSystemProvider>
      </AnalyticsProvider>
      <Toolbar />
    </body>
  </html>
);

export default RootLayout;
