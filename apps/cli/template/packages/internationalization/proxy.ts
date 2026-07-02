import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { type NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";
import languine from "./languine.json" with { type: "json" };

const locales = [languine.locale.source, ...languine.locale.targets];

const I18nMiddleware = createI18nMiddleware({
  locales,
  defaultLocale: "en",
  urlMappingStrategy: "rewriteDefault",
  resolveLocaleFromRequest: (request: NextRequest) => {
    try {
      const headers = Object.fromEntries(request.headers.entries());
      const negotiator = new Negotiator({ headers });
      const acceptedLanguages = negotiator
        .languages()
        .filter((lang) => lang !== "*");

      if (acceptedLanguages.length === 0) {
        return "en";
      }

      return matchLocale(acceptedLanguages, locales, "en");
    } catch {
      return "en";
    }
  },
});

// rewriteDefault rewrites every unprefixed path under /<locale>, which 404s
// routes that live outside the [locale] segment (e.g. /.well-known/*).
const defaultNonLocalizedPaths = ["/.well-known"];

export const internationalizationMiddleware = (
  request: NextRequest,
  nonLocalizedPaths: string[] = []
) => {
  const { pathname } = request.nextUrl;
  const isNonLocalized = [
    ...defaultNonLocalizedPaths,
    ...nonLocalizedPaths,
  ].some((prefix) => pathname.startsWith(prefix));

  if (isNonLocalized) {
    return NextResponse.next();
  }

  return I18nMiddleware(request);
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
