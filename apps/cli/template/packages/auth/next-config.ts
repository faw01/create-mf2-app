import type { NextConfig } from "next";

export const withAuthImages = (sourceConfig: NextConfig): NextConfig => ({
  ...sourceConfig,
  images: {
    ...sourceConfig.images,
    remotePatterns: [
      ...(sourceConfig.images?.remotePatterns ?? []),
      {
        hostname: "img.clerk.com",
        protocol: "https",
      },
    ],
  },
});
