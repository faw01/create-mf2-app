"use client";

import { ConvexReactClient } from "convex/react";
import { createConvexComponents } from "./provider.shared";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export const { ConvexClientProvider, ConvexGate, useConvexConfigured } =
  createConvexComponents(convex);
