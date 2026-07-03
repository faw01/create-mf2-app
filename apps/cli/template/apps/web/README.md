# Web

Marketing website with landing pages, blog, and pricing. Runs on port 3001.

## Development

```bash
turbo dev --filter=web
```

## Key Features

- Landing pages scaffolded from TWBlocks
- Blog from BaseHub CMS
- Contact form with Resend email
- Internationalization (6 languages)
- SEO with metadata, JSON-LD, sitemaps
- Analytics with PostHog
- Feature flags with Vercel Toolbar

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BASEHUB_TOKEN` | No | BaseHub CMS token (blog and legal content render empty without it) |
| `RESEND_TOKEN` | No | Resend API key |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project key |
| `ARCJET_KEY` | No | Arcjet security key |

See full list at [mf2.dev/docs/setup/env](https://mf2.dev/docs/setup/env).

## Docs

[mf2.dev/docs/apps/web](https://mf2.dev/docs/apps/web)
