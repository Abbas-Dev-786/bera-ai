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



export async function getScoreAndSummary(report) {
    const response = await client.responses.create({
        model: "gpt-5-mini",

        // System instructions -> becomes a "system" message internally
        instructions: `
      You are a senior smart contract security auditor.

      You will receive a full smart contract audit report as input.

      Your job is to output ONLY a json object with:
      - "summary": a concise plain-text summary of the audit, max 2000 characters.
      - "score": an integer from 0 to 100 (higher = more secure overall).

      SCORING GUIDELINES (for your internal reasoning only):
      - Start from 100 and deduct based on number and severity of issues.
      - Critical/high unresolved issues pull the score down a lot.
      - Mostly low/informational issues can still be 85–100.
      - Very serious unresolved issues may be below 60.

      OUTPUT RULES (VERY IMPORTANT):
      - The response MUST be valid json.
      - Do not wrap json in markdown.
      - No headings, no prose, no explanation.
      - The json object MUST have exactly this shape:

        {
          "summary": "string, <= 2000 chars",
          "score": 0-100
        }
    `,

        // User input -> becomes a "user" message internally
        input: `
      Below is a smart contract audit report.

      Return ONLY a json object with "summary" and "score" as described.
      Do not include any text that is not part of the json.

      --- START REPORT ---
      ${report}
      --- END REPORT ---
    `,

        // Ask the Responses API to give us a json object string
        text: {
            format: {
                type: "json_object"
            }
        },
        max_output_tokens: 512
    });

    const raw = response.output_text;

    let data;
    try {
        data = JSON.parse(raw);
    } catch (err) {
        // Optional: try to salvage a JSON substring if something weird happens
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
            console.error("Failed to parse JSON from model:", raw);
            throw err;
        }
        data = JSON.parse(match[0]);
    }



    // Enforce the 2000-character limit from our side as well
    if (data.summary.length > 2000) {
        data.summary = data.summary.slice(0, 2000);
    }

    return data; // { summary: '...', score: 0–100 }
}