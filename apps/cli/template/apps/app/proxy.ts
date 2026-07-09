import { authMiddleware } from "@repo/auth/proxy";
import { parseError } from "@repo/observability/error";
import { secure } from "@repo/security";
import {
  noseconeOptions,
  noseconeOptionsWithToolbar,
  securityMiddleware,
} from "@repo/security/proxy";
import { type NextProxy, NextResponse } from "next/server";
import { env } from "./env";

const securityHeaders = env.FLAGS_SECRET
  ? securityMiddleware(noseconeOptionsWithToolbar)
  : securityMiddleware(noseconeOptions);

export default authMiddleware(async (_auth, request) => {
  if (env.ARCJET_KEY) {
    try {
      await secure(["CATEGORY:PREVIEW", "CATEGORY:MONITOR"], request);
    } catch (error) {
      const message = parseError(error);
      return NextResponse.json({ error: message }, { status: 403 });
    }
  }

  return securityHeaders();
}) as unknown as NextProxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
