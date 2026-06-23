export const getBaseUrl = (): URL => {
  const configured = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (!configured) {
    return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
  }

  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    return new URL(configured);
  }

  const scheme = configured.startsWith("localhost") ? "http" : "https";
  return new URL(`${scheme}://${configured}`);
};
