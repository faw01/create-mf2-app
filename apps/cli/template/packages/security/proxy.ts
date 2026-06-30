import { defaults, type Options, withVercelToolbar } from "@nosecone/next";

export { createMiddleware as securityMiddleware } from "@nosecone/next";

export const noseconeOptions: Options = {
  ...defaults,
  // Content Security Policy (CSP) is disabled by default because the values
  // depend on which features are enabled.
  contentSecurityPolicy: false,
};

export const noseconeOptionsWithToolbar: Options =
  withVercelToolbar(noseconeOptions);
