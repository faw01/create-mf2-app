import { blog, legal } from "@repo/cms";
import { getBaseUrl } from "@repo/seo/base-url";
import type { MetadataRoute } from "next";

const pages = ["blog", "contact", "pricing"];

const blogs = (await blog.getPosts()).map((post) => post._slug);
const legals = (await legal.getPosts()).map((post) => post._slug);
const url = getBaseUrl();

const sitemap = async (): Promise<MetadataRoute.Sitemap> => [
  {
    lastModified: new Date(),
    url: new URL("/", url).href,
  },
  ...pages.map((page) => ({
    lastModified: new Date(),
    url: new URL(page, url).href,
  })),
  ...blogs.map((slug) => ({
    lastModified: new Date(),
    url: new URL(`blog/${slug}`, url).href,
  })),
  ...legals.map((slug) => ({
    lastModified: new Date(),
    url: new URL(`legal/${slug}`, url).href,
  })),
];

export default sitemap;
