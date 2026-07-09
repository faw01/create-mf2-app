import { keys } from "../keys";

export const Toolbar = async () => {
  if (!keys().FLAGS_SECRET) {
    return null;
  }

  const { VercelToolbar } = await import("@vercel/toolbar/next");

  return <VercelToolbar />;
};
