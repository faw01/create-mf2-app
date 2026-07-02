import type { NextConfig } from "next";

export const withAuthImages = (sourceConfig: NextConfig): NextConfig => ({
  ...sourceConfig,
  images: {
    ...sourceConfig.images,
    remotePatterns: [
      ...(sourceConfig.images?.remotePatterns ?? []),
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
});
