import { tool } from "ai";
import { z } from "zod";
import { createChatAgent } from "../agent/chat";

const helloTool = tool({
  contextSchema: z.object({
    step: z.number().optional(),
  }),
  description:
    "A simple hello world tool. Use this to greet someone and see the current simulation step.",
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
  inputSchema: z.object({
    enthusiastic: z
      .boolean()
      .optional()
      .default(false)
      .describe("Add extra enthusiasm to the greeting"),
    name: z.string().describe("The name to greet"),
  }),
  strict: true,
});

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
