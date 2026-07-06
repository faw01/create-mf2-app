import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";
import { cn } from "@repo/design-system/lib/utils";
import { createMetadata } from "@repo/seo/metadata";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles.css";

export const metadata = createMetadata({
  description:
    "The production-ready SaaS monorepo with auth, payments, database, AI, analytics, and email.",
  title: "Ship your startup in one command",
}) as Metadata;

type RootLayoutProps = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => (
  <html
    className={cn(fonts, "scroll-smooth")}
    lang="en"
    suppressHydrationWarning
  >
    <body>
      <DesignSystemProvider defaultTheme="light">
        {children}
      </DesignSystemProvider>
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
