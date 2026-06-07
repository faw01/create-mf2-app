import { createGateway, type GatewayProvider } from "@ai-sdk/gateway";
import type { LanguageModelV4 } from "@ai-sdk/provider";
import { keys } from "../keys";

let _env: ReturnType<typeof keys> | null = null;
let _gateway: GatewayProvider | null = null;

function getEnv() {
  if (!_env) {
    _env = keys();
  }
  return _env;
}

export function getGatewayUrl(): string {
  return getEnv().AI_GATEWAY_URL;
}

function getGateway() {
  if (!_gateway) {
    const env = getEnv();
    _gateway = createGateway({
      apiKey: env.AI_GATEWAY_API_KEY,
      baseURL: `${env.AI_GATEWAY_URL}/ai`,
    });
    (globalThis as Record<string, unknown>).AI_SDK_DEFAULT_PROVIDER = _gateway;
  }
  return _gateway;
}

export function gateway(model: string): LanguageModelV4 {
  return getGateway()(model);
}
