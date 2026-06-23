import { getBaseUrl } from "@repo/seo/base-url";
import type { MetadataRoute } from "next";

const url = getBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", url).href,
  };
}
