import { defaults, type Options, withVercelToolbar } from "@nosecone/next";

export { createMiddleware as securityMiddleware } from "@nosecone/next";

export const noseconeOptions: Options = {
  ...defaults,
  contentSecurityPolicy: false,
};

export const noseconeOptionsWithToolbar: Options =
  withVercelToolbar(noseconeOptions);
