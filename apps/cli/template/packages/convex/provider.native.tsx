import { ConvexReactClient } from "convex/react";
import { createConvexComponents } from "./provider.shared";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const convex = convexUrl
  ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false })
  : null;

export const { ConvexClientProvider, ConvexGate, useConvexConfigured } =
  createConvexComponents(convex);
