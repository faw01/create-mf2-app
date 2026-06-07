# @repo/ai

Multi-model AI gateway and agents with the Vercel AI SDK.

## Usage

```ts
import { gateway } from "@repo/ai/gateway";
import { CLAUDE_SONNET, DEFAULT_CHAT_MODEL } from "@repo/ai/models";
import { createChatAgent } from "@repo/ai/agent";
import { SYSTEM_PROMPT } from "@repo/ai/prompts";
import { helloTool } from "@repo/ai/tools/hello";

// Tools that declare a contextSchema receive their context at agent
// construction via toolsContext, nested by tool name (not at generate()
// time). See tools/hello.ts for the worked example.
const agent = createChatAgent(context, { hello: helloTool }, {
  toolsContext: { hello: { step: 1 } },
});
```

## Architecture

```
packages/ai/
  gateway/         # AI Gateway wrapper (createGateway, lazy env)
  models/          # Model constants, thinking options, presets
  agent/           # ToolLoopAgent factory (createChatAgent)
  prompts/         # System prompts, title generation
  tools/           # AI tools (Perplexity search, hello example)
  utils/           # Cost tracking via gateway API
  keys.ts          # T3 env validation for AI keys
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_GATEWAY_API_KEY` | Yes | Vercel AI Gateway key |
| `AI_GATEWAY_URL` | No | Gateway URL, defaults to https://ai-gateway.vercel.sh/v3 |
| `PERPLEXITY_API_KEY` | No | For web search tool |

## Docs

[mf2.dev/docs/packages/ai](https://mf2.dev/docs/packages/ai)
