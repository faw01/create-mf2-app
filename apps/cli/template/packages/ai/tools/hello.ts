/**
 * Example tool demonstrating the tool creation pattern; use it as a
 * reference when creating your own tools.
 */

import { tool } from "ai";
import { z } from "zod";
import { createChatAgent } from "../agent/chat";

// Per-tool context arrives at agent construction via the `toolsContext`
// setting, keyed by tool name; it is NOT a `generate()` argument and is
// separate from `runtimeContext`.
const helloTool = tool({
  description:
    "A simple hello world tool. Use this to greet someone and see the current simulation step.",
  inputSchema: z.object({
    name: z.string().describe("The name to greet"),
    enthusiastic: z
      .boolean()
      .optional()
      .default(false)
      .describe("Add extra enthusiasm to the greeting"),
  }),
  contextSchema: z.object({
    step: z.number().optional(),
  }),
  strict: true,
  execute: ({ name, enthusiastic }, { context }) => {
    const currentStep = context?.step ?? "unknown";

    const greeting = enthusiastic
      ? `Hello, ${name}! Great to meet you!`
      : `Hello, ${name}.`;

    return {
      message: greeting,
      step: currentStep,
      timestamp: new Date().toISOString(),
    };
  },
});

/**
 * Worked example: wiring a context-ful tool through createChatAgent.
 * Declaring a contextSchema makes the `hello` key required at agent
 * construction, even when all of its fields are optional (pass an empty
 * object in that case).
 */
const createHelloAgent = (
  context: { token: string; orgId?: string },
  step: number
) =>
  createChatAgent(
    context,
    { hello: helloTool },
    {
      toolsContext: { hello: { step } },
    }
  );

export { createHelloAgent, helloTool };
