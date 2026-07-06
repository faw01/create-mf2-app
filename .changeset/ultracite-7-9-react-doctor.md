---
"create-mf2-app": minor
---

Upgrade Ultracite to 7.9 (Biome 2.5.2 with the newly stabilized rules and the tightened cross-linter rule graph) and fix every new violation across the template and CLI. Bolt React Doctor into scaffolds as `bun run doctor` for the React-specific checks lint rules miss: the "You Might Not Need an Effect" family, render performance, hydration, server-component, and security scans. Fixes real bugs the new rules caught: uncleaned carousel timers, a missing rate-limit note on the public contact action, and sequential awaits in scaffold and Convex cascade-delete paths now run in parallel.
