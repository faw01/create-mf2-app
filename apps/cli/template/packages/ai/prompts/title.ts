import { generateText } from "ai";
import { gateway } from "../gateway";
import { GEMINI_FLASH } from "../models";

const TITLE_SYSTEM_PROMPT = `You are a concise title generator. Given a user's first message in a chat conversation, generate a short, descriptive title (3-6 words max). The title should capture the main topic or intent. Do not use quotes, punctuation at the end, or prefixes like "Title:". Just output the title text.`;

export async function generateChatTitle(message: string): Promise<string> {
  const { text } = await generateText({
    model: gateway(GEMINI_FLASH),
    instructions: TITLE_SYSTEM_PROMPT,
    prompt: message,
  });

  return text.trim() || "New Chat";
}
