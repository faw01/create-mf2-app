# @repo/convex

Convex client provider package that bridges Clerk authentication with Convex's real-time backend, for web (Next.js) and native (Expo).

## Setup

This package provides `ConvexProviderWithClerk` which authenticates Convex queries/mutations using Clerk's JWT tokens.

## Usage

```tsx
// Web (Next.js client component)
import { useAuth } from "@clerk/nextjs";
import { ConvexClientProvider } from "@repo/convex/provider";

// Native (Expo)
import { useAuth } from "@clerk/clerk-expo";
import { ConvexClientProvider } from "@repo/convex/provider.native";

function App({ children }) {
  return (
    <ConvexClientProvider useAuth={useAuth}>
      {children}
    </ConvexClientProvider>
  );
}
```

## No-URL fallback and ConvexGate

When the Convex URL env var is unset, the provider renders children WITHOUT a Convex context so the app still boots with zero keys. Any `useQuery`/`useMutation`/`useAction`/`useConvexAuth` descendant then throws "Could not find Convex client!" at runtime, invisible to typecheck. Wrap Convex-consuming subtrees in `ConvexGate` (or branch on `useConvexConfigured()`) at the closest sensible boundary:

```tsx
import { ConvexGate, useConvexConfigured } from "@repo/convex/provider";
// native: from "@repo/convex/provider.native"

<ConvexGate fallback={<EmptyState />}>
  <ThreadList /> {/* calls useQuery */}
</ConvexGate>
```

`useConvexConfigured()` reads the same env the provider reads, so it works even outside the provider. The desktop app (`apps/desktop`) has its own provider with the same exports, keyed on `VITE_CONVEX_URL`.

## Exports

- `@repo/convex/provider` - ConvexClientProvider, ConvexGate, useConvexConfigured (web)
- `@repo/convex/provider.native` - same three for Expo
- `@repo/convex/keys` - T3 env validation for NEXT_PUBLIC_CONVEX_URL
- `@repo/convex/keys.native` - env validation for EXPO_PUBLIC_CONVEX_URL

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL` (optional) - Convex deployment URL (web); unset means no Convex context
- `EXPO_PUBLIC_CONVEX_URL` (optional) - Convex deployment URL (native); unset means no Convex context
