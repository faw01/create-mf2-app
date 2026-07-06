import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  reactStrictMode: true,
  transpilePackages: ["@repo/design-system"],
};

export default nextConfig;
