import { getGatewayUrl } from "../gateway";

const BACKOFF_MULTIPLIER = 1.5;

type GenerationData = {
  created_at: string;
  generation_time: number;
  id: string;
  is_byok: boolean;
  latency: number;
  model: string;
  native_tokens_cached: number;
  native_tokens_completion: number;
  native_tokens_prompt: number;
  native_tokens_reasoning: number;
  provider_name: string;
  streamed: boolean;
  tokens_completion: number;
  tokens_prompt: number;
  total_cost: number;
  usage: number;
};

type CreditsData = {
  balance: string;
  total_used: string;
};

type BatchCostResult = {
  failed: string[];
  generations: GenerationData[];
  totalCost: number;
};

const fetchGenerationCost = async (
  generationId: string
): Promise<GenerationData | null> => {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `${getGatewayUrl()}/generation?id=${encodeURIComponent(generationId)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const { data } = (await response.json()) as { data: GenerationData };
    return data;
  } catch {
    return null;
  }
};

const fetchCredits = async (): Promise<CreditsData | null> => {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${getGatewayUrl()}/credits`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CreditsData;
  } catch {
    return null;
  }
};

const fetchGenerationCostWithRetry = async (
  id: string,
  maxAttempts: number,
  initialDelayMs: number,
  maxDelayMs: number
): Promise<GenerationData | null> => {
  let delay = initialDelayMs;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    // biome-ignore lint/performance/noAwaitInLoops: polling with backoff is inherently sequential
    const data = await fetchGenerationCost(id);
    if (data) {
      return data;
    }
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * BACKOFF_MULTIPLIER, maxDelayMs);
  }

  return null;
};

const fetchAllGenerationCosts = async (
  genIds: string[],
  options?: {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
  }
): Promise<BatchCostResult> => {
  const {
    maxAttempts = 20,
    initialDelayMs = 5000,
    maxDelayMs = 30_000,
  } = options ?? {};

  const outcomes = await Promise.all(
    genIds.map(async (id) => ({
      data: await fetchGenerationCostWithRetry(
        id,
        maxAttempts,
        initialDelayMs,
        maxDelayMs
      ),
      id,
    }))
  );

  const results: GenerationData[] = [];
  const failed: string[] = [];

  for (const { data, id } of outcomes) {
    if (data) {
      results.push(data);
    } else {
      failed.push(id);
    }
  }

  return {
    failed,
    generations: results,
    totalCost: results.reduce((sum, g) => sum + g.total_cost, 0),
  };
};

const createUsageTracker = () => {
  const generationIds: string[] = [];

  const onStepFinish = ({
    providerMetadata,
  }: {
    providerMetadata?: Record<string, Record<string, unknown> | undefined>;
  }) => {
    const genId = providerMetadata?.gateway?.generationId;
    if (typeof genId === "string" && !generationIds.includes(genId)) {
      generationIds.push(genId);
    }
  };

  const getGenerationIds = () => [...generationIds];

  const clear = () => {
    generationIds.length = 0;
  };

  return { clear, getGenerationIds, onStepFinish };
};

export type { BatchCostResult, CreditsData, GenerationData };
export {
  createUsageTracker,
  fetchAllGenerationCosts,
  fetchCredits,
  fetchGenerationCost,
};
