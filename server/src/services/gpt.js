import OpenAI from "openai";
import { OPENROUTER_API_KEY } from "../config/index.js";


const client = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
});

export default async function createPrompt(query, tone) {
    const response = await client.responses.create({
        model: "gpt-4o-mini",
        instructions: `
      You are an expert meta-prompter.
      Your task is NOT to answer the query, but to generate a prompt
      that another LLM will use to answer it.

      REQUIREMENTS:
      - Do NOT answer the query.
      - Generate a clear, detailed, standalone prompt.
      - Adapt complexity to the tone: beginner, intermediate, advanced, expert, research.
      - Include any missing context the answering LLM would need.
      - Output ONLY the final prompt, no explanation.
    `,
        input: [
            {
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: `Here is the query: "${query}". The tone is: "${tone}". Generate the meta-prompt now.`
                    }
                ]
            }
        ]
    });


    return response.output_text
}

createPrompt("what is polkadot", "beginner")


/*
 For beginner tone the prompt should cover all the parts and should be enough detailed to cover all the aspects of the query.
    For intermediate tone the prompt should cover all the parts and should be enough detailed to cover all the aspects of the query.
    For advanced tone the prompt should cover all the parts and should be enough detailed to cover all the aspects of the query.
    For expert tone the prompt should cover all the parts and should be enough detailed to cover all the aspects of the query.
    For research tone the prompt should cover all the parts and should be enough detailed to cover all the aspects of the query.
*/