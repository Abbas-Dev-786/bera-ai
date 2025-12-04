import { OpenAI } from "openai";
import { setDefaultOpenAIClient } from "@openai/agents";
import { OPENROUTER_API_KEY } from "../config/index.js";

console.log("openrouter api key:", OPENROUTER_API_KEY);

export default function setupOpenrouter() {
  const customClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
  });
  setDefaultOpenAIClient(customClient);
}
