import { OpenAIProvider, createOpenAI } from "@ai-sdk/openai";

export const openai = createOpenAI({
  // custom settings, e.g.
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

export function getModel(model?: string): [string, OpenAIProvider] {
  return [model ?? "gpt-5-mini", openai];
}
