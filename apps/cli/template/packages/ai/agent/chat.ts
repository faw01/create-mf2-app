import type {
  HasRequiredKey,
  InferToolSetContext,
  ProviderOptions,
} from "@ai-sdk/provider-utils";
import type { ToolLoopAgentSettings, ToolSet } from "ai";
import { ToolLoopAgent } from "ai";
import { gateway } from "../gateway";
import {
  anthropicThinkingOptions,
  DEFAULT_CHAT_MODEL,
  getModelProviderOptions,
  googleThinkingOptions,
  openaiThinkingOptions,
} from "../models";
import { type PromptParams, SYSTEM_PROMPT } from "../prompts/system";

function getProviderOptions(modelId: string): ProviderOptions {
  const { only, zeroDataRetention } = getModelProviderOptions(modelId);
  const gatewayOptions = { only, zeroDataRetention };

  if (modelId.startsWith("anthropic/")) {
    return { anthropic: anthropicThinkingOptions, gateway: gatewayOptions };
  }
  if (modelId.startsWith("openai/")) {
    return { gateway: gatewayOptions, openai: openaiThinkingOptions };
  }
  if (modelId.startsWith("google/")) {
    return { gateway: gatewayOptions, google: googleThinkingOptions };
  }

  return { gateway: gatewayOptions };
}

type ChatAgentOptions<TOOLS extends ToolSet> = {
  modelId?: string;
  promptParams?: PromptParams;
  toolsContext?: InferToolSetContext<TOOLS>;
};

export const createChatAgent = <TOOLS extends ToolSet>(
  context: { token: string; orgId?: string },
  tools: TOOLS,
  ...rest: HasRequiredKey<InferToolSetContext<TOOLS>> extends true
    ? [
        options: ChatAgentOptions<TOOLS> & {
          toolsContext: InferToolSetContext<TOOLS>;
        },
      ]
    : [options?: ChatAgentOptions<TOOLS>]
) => {
  const [options] = rest;
  const model = options?.modelId ?? DEFAULT_CHAT_MODEL;
  const settings = {
    instructions: SYSTEM_PROMPT(options?.promptParams),
    model: gateway(model),
    providerOptions: getProviderOptions(model),
    runtimeContext: context,
    tools,
    toolsContext: options?.toolsContext,
  } as ToolLoopAgentSettings<never, TOOLS, { token: string; orgId?: string }>;
  return new ToolLoopAgent(settings);
};
