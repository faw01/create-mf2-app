import { withVercelToolbar } from "@vercel/toolbar/plugins/next";
import type { NextConfig } from "next";
import { keys } from "../keys";

export const withToolbar = (config: NextConfig): NextConfig =>
  keys().FLAGS_SECRET ? withVercelToolbar()(config) : config;
