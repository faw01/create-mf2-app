import { blog, legal } from "@repo/cms";
import { getBaseUrl } from "@repo/seo/base-url";
import type { MetadataRoute } from "next";

const pages = ["blog", "contact", "pricing"];

const blogs = (await blog.getPosts()).map((post) => post._slug);
const legals = (await legal.getPosts()).map((post) => post._slug);
const url = getBaseUrl();

const sitemap = async (): Promise<MetadataRoute.Sitemap> => [
  {
    url: new URL("/", url).href,
    lastModified: new Date(),
  },
  ...pages.map((page) => ({
    url: new URL(page, url).href,
    lastModified: new Date(),
  })),
  ...blogs.map((slug) => ({
    url: new URL(`blog/${slug}`, url).href,
    lastModified: new Date(),
  })),
  ...legals.map((slug) => ({
    url: new URL(`legal/${slug}`, url).href,
    lastModified: new Date(),
  })),
];

export default sitemap;
