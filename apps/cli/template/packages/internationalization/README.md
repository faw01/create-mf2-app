# @repo/internationalization

Multi-language support with next-international.

## Usage

```ts
import { useTranslation } from "@repo/internationalization";
```

`internationalizationMiddleware` skips the locale rewrite for paths outside the `[locale]` segment (`/.well-known` by default; pass more prefixes as the second argument) so non-localized route handlers do not 404.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LANGUINE_API_KEY` | No | API key for auto-translation |

## Docs

[mf2.dev/docs/packages/i18n](https://mf2.dev/docs/packages/i18n)
