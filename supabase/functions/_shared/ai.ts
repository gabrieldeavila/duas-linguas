import { OpenAIProvider, createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase";

export const openai = createOpenAI({
  // custom settings, e.g.
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

createClient("", "");

function getModel(model?: string): [string, OpenAIProvider] {
  return [model ?? "gpt-4.1-mini", openai];
}

export default getModel;
