import { StripeAgentToolkit } from "@stripe/agent-toolkit/ai-sdk";
import { keys } from "./keys";

const { STRIPE_SECRET_KEY } = keys();

export const paymentsAgentToolkit = STRIPE_SECRET_KEY
  ? new StripeAgentToolkit({
      secretKey: STRIPE_SECRET_KEY,
      configuration: {},
    })
  : undefined;
