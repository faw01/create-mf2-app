import { keys } from "../keys";

/*
 * @vercel/toolbar/next logs "You are rendering the Vercel Toolbar in
 * development, but the configuration is missing." at module scope the moment
 * the module is evaluated in an unlinked dev environment, before any render
 * gate can run. Import it lazily so unconfigured projects never evaluate it;
 * with FLAGS_SECRET set the toolbar renders exactly as before.
 */
export const Toolbar = async () => {
  if (!keys().FLAGS_SECRET) {
    return null;
  }

  const { VercelToolbar } = await import("@vercel/toolbar/next");

  return <VercelToolbar />;
};
