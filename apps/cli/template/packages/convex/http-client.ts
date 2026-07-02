import { ConvexHttpClient } from "convex/browser";
import { keys } from "./keys";

let client: ConvexHttpClient | undefined;

export const getConvexHttpClient = (): ConvexHttpClient => {
  const url = keys().NEXT_PUBLIC_CONVEX_URL;

  if (!url) {
    throw new Error("Convex is not configured: set NEXT_PUBLIC_CONVEX_URL");
  }

  client ??= new ConvexHttpClient(url);
  return client;
};
