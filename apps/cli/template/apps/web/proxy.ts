import { authMiddleware } from "@repo/auth/proxy";
import { internationalizationMiddleware } from "@repo/internationalization/proxy";
import { parseError } from "@repo/observability/error";
import { secure } from "@repo/security";
import {
  noseconeOptions,
  noseconeOptionsWithToolbar,
  securityMiddleware,
} from "@repo/security/proxy";
import { type NextProxy, type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|ingest|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};

const securityHeaders = env.FLAGS_SECRET
  ? securityMiddleware(noseconeOptionsWithToolbar)
  : securityMiddleware(noseconeOptions);

export default authMiddleware(async (_auth, request) => {
  if (env.ARCJET_KEY) {
    try {
      await secure(
        [
          // See https://docs.arcjet.com/bot-protection/identifying-bots
          "CATEGORY:SEARCH_ENGINE", // Allow search engines
          "CATEGORY:PREVIEW", // Allow preview links to show OG images
          "CATEGORY:MONITOR", // Allow uptime monitoring services
        ],
        request
      );
    } catch (error) {
      const message = parseError(error);
      return NextResponse.json({ error: message }, { status: 403 });
    }
  }

  const response = internationalizationMiddleware(
    request as unknown as NextRequest
  );

  const noseconeResponse = await securityHeaders();
  for (const [key, value] of noseconeResponse.headers) {
    response.headers.set(key, value);
  }

  return response;
}) as unknown as NextProxy;
