import { devToolsMiddleware } from "@ai-sdk/devtools";
import type { LanguageModelV4 } from "@ai-sdk/provider";
import { wrapLanguageModel } from "ai";
import { gateway as baseGateway } from "./index";

export function gatewayWithDevTools(model: string): LanguageModelV4 {
  return wrapLanguageModel({
    middleware: devToolsMiddleware(),
    model: baseGateway(model),
  });
}
