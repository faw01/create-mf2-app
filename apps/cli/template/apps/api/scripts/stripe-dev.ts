import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

// `stripe listen` normally authenticates with machine-global `stripe login`
// state, which on an unconfigured machine is missing or stale and crashes the
// dev task. Gate on the project's own STRIPE_SECRET_KEY (shell env or
// apps/api/.env.local) so zero-config dev skips with one clear line instead.

const readKeyFromEnvLocal = (): string => {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      if (line.startsWith("STRIPE_SECRET_KEY=")) {
        return line
          .slice("STRIPE_SECRET_KEY=".length)
          .trim()
          .replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // No .env.local yet; treat as unconfigured.
  }
  return "";
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || readKeyFromEnvLocal();

if (!stripeSecretKey) {
  console.log(
    "Skipping Stripe listener: set STRIPE_SECRET_KEY in apps/api/.env.local to enable webhook forwarding"
  );
  process.exit(0);
}

const listener = spawn(
  "stripe",
  [
    "listen",
    "--api-key",
    stripeSecretKey,
    "--forward-to",
    "localhost:3002/webhooks/payments",
  ],
  { stdio: "inherit" }
);

listener.on("error", () => {
  console.log(
    "Skipping Stripe listener: Stripe CLI not found, install it from https://docs.stripe.com/stripe-cli"
  );
  process.exit(0);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    listener.kill(signal);
  });
}

listener.on("exit", (code) => {
  process.exit(code ?? 0);
});
