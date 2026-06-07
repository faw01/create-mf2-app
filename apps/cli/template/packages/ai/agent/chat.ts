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
    return { gateway: gatewayOptions, anthropic: anthropicThinkingOptions };
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
  /** Overrides DEFAULT_CHAT_MODEL. */
  modelId?: string;
  promptParams?: PromptParams;
  /**
   * Per-tool context, nested by tool name, e.g. `{ hello: { step: 1 } }`.
   *
   * In AI SDK 7 this is an agent construction setting, not a `generate()`
   * argument. Any tool that declares a `contextSchema` receives its slice of
   * this object as `context` inside `execute`. See `tools/hello.ts` for a
   * worked example.
   */
  toolsContext?: InferToolSetContext<TOOLS>;
};

export const createChatAgent = <TOOLS extends ToolSet>(
  context: { token: string; orgId?: string },
  tools: TOOLS,
  // Mirrors ai@7's ToolLoopAgentSettings contract: as soon as a tool declares
  // a non-optional contextSchema, forgetting toolsContext is a compile error
  // instead of an undefined context at runtime.
  ...rest: HasRequiredKey<InferToolSetContext<TOOLS>> extends true
    ? [
        options: ChatAgentOptions<TOOLS> & {
          toolsContext: InferToolSetContext<TOOLS>;
        },
      ]
    : [options?: ChatAgentOptions<TOOLS>]
) => {
  const options = rest[0];
  const model = options?.modelId ?? DEFAULT_CHAT_MODEL;
  // ToolLoopAgentSettings types toolsContext with a conditional on TOOLS that
  // TypeScript cannot resolve for an unbound generic, so the settings object
  // is asserted once here; call sites stay fully typed via the rest parameter.
  const settings = {
    model: gateway(model),
    instructions: SYSTEM_PROMPT(options?.promptParams),
    tools,
    toolsContext: options?.toolsContext,
    runtimeContext: context,
    providerOptions: getProviderOptions(model),
  } as ToolLoopAgentSettings<never, TOOLS, { token: string; orgId?: string }>;
  return new ToolLoopAgent(settings);
};
