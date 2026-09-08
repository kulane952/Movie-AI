import { createOpenAI } from "@ai-sdk/openai";

// Waxaan sameyneynaa OpenAI-compatible provider,
// laakiin URL-ka waxaan u beddelaynaa OpenRouter.
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,

  // OpenRouter wuxuu isticmaalaa OpenAI-compatible API.
  baseURL: "https://openrouter.ai/api/v1",
});

// Waxaan export gareyneynaa provider-ka
// si API route-keena uu u isticmaalo.
export { openrouter };