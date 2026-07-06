import type { GatewayProviderOptions } from "@ai-sdk/gateway";

export const CLAUDE_HAIKU = "anthropic/claude-haiku-4.5";
export const CLAUDE_SONNET = "anthropic/claude-sonnet-4.6";
export const CLAUDE_OPUS = "anthropic/claude-opus-4.6";

export const GPT_4O = "openai/gpt-4o";
export const GPT_4O_MINI = "openai/gpt-4o-mini";

export const GEMINI_FLASH = "google/gemini-3-flash";
export const GEMINI_PRO = "google/gemini-3-pro-preview";

export const defaultGatewayOptions = {
  zeroDataRetention: true,
} satisfies GatewayProviderOptions;

export const gatewayPresets = {
  baseten: {
    ...defaultGatewayOptions,
    only: ["baseten"],
  },
  cerebras: {
    ...defaultGatewayOptions,
    only: ["cerebras"],
  },
  deepinfra: {
    ...defaultGatewayOptions,
    only: ["deepinfra"],
  },
  fireworks: {
    only: ["fireworks"],
  },
  none: {},
  openai: {
    only: ["openai"],
  },
  vertex: {
    ...defaultGatewayOptions,
    only: ["vertex"],
  },
  xai: {
    ...defaultGatewayOptions,
    only: ["xai"],
  },
} as const satisfies Record<string, GatewayProviderOptions>;

export type GatewayPresetKey = keyof typeof gatewayPresets;

export const DEFAULT_THINKING_BUDGET = 12_000;

export type OpenAIThinkingOptions = {
  reasoningEffort: "medium";
  reasoningSummary: "detailed";
};

export type AnthropicThinkingOptions = {
  thinking: { type: "enabled"; budgetTokens: number };
};

export type GoogleThinkingOptions = {
  thinkingConfig: { includeThoughts: boolean; thinkingBudget: number };
};

export const openaiThinkingOptions: OpenAIThinkingOptions = {
  reasoningEffort: "medium",
  reasoningSummary: "detailed",
};

export const anthropicThinkingOptions: AnthropicThinkingOptions = {
  thinking: { budgetTokens: DEFAULT_THINKING_BUDGET, type: "enabled" },
};

export const googleThinkingOptions: GoogleThinkingOptions = {
  thinkingConfig: {
    includeThoughts: true,
    thinkingBudget: DEFAULT_THINKING_BUDGET,
  },
};

export type ChatModelEntry = Pick<
  import("@ai-sdk/gateway").GatewayLanguageModelEntry,
  "id" | "name"
> & {
  chef: string;
  chefSlug: string;
  gatewayPreset: GatewayPresetKey;
};

export const CHAT_MODELS: ChatModelEntry[] = [
  {
    chef: "Anthropic",
    chefSlug: "anthropic",
    gatewayPreset: "vertex",
    id: CLAUDE_SONNET,
    name: "Claude Sonnet 4.6",
  },
  {
    chef: "Anthropic",
    chefSlug: "anthropic",
    gatewayPreset: "vertex",
    id: CLAUDE_HAIKU,
    name: "Claude Haiku 4.5",
  },
  {
    chef: "Anthropic",
    chefSlug: "anthropic",
    gatewayPreset: "vertex",
    id: CLAUDE_OPUS,
    name: "Claude Opus 4.6",
  },
  {
    chef: "OpenAI",
    chefSlug: "openai",
    gatewayPreset: "openai",
    id: GPT_4O,
    name: "GPT-4o",
  },
  {
    chef: "OpenAI",
    chefSlug: "openai",
    gatewayPreset: "openai",
    id: GPT_4O_MINI,
    name: "GPT-4o Mini",
  },
  {
    chef: "Google",
    chefSlug: "google",
    gatewayPreset: "vertex",
    id: GEMINI_FLASH,
    name: "Gemini 3 Flash",
  },
  {
    chef: "Google",
    chefSlug: "google",
    gatewayPreset: "vertex",
    id: GEMINI_PRO,
    name: "Gemini 3 Pro",
  },
];

export function getModelProviders(modelId: string): readonly string[] {
  const model = CHAT_MODELS.find((m) => m.id === modelId);
  if (!model) {
    return [];
  }
  const preset = gatewayPresets[model.gatewayPreset];
  return "only" in preset ? preset.only : [];
}

export function getModelProviderOptions(
  modelId: string
): GatewayProviderOptions {
  const model = CHAT_MODELS.find((m) => m.id === modelId);
  if (!model) {
    return defaultGatewayOptions;
  }
  return gatewayPresets[model.gatewayPreset];
}

export const MODEL_CHEFS = Array.from(
  new Set(CHAT_MODELS.map((model) => model.chef))
);

export const DEFAULT_CHAT_MODEL = CLAUDE_SONNET;
