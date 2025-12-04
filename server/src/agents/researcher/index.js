import { Agent, tool } from "@openai/agents";
import { z } from "zod";
import { getTopicDetails } from "../../services/chaingpt.js";

const researchTopicTool = tool({
  name: "research_topic",
  description:
    "Fetch an AI-generated explanation about a blockchain/web3 topic using ChainGPT.",
  parameters: z.object({
    query: z
      .string()
      .min(5)
      .describe("A natural language question or topic (e.g. 'What is ERC20?')"),
  }),
  async execute({ query }) {
    try {
      const result = await getTopicDetails(query);

      return {
        summary: typeof result === "string" ? result : JSON.stringify(result),
      };
    } catch (error) {
      console.error("ChainGPT research API error:", error.message);
      throw new Error("Failed to fetch research content from ChainGPT.");
    }
  },
  
});

export const researchAgent = new Agent({
  name: "research_agent",
  instructions: `
You are Research Agent. Your ONLY job is to call the research_topic tool and return its output.

BEHAVIOR RULES:
- Always call the research_topic tool with the user's query.
- Do NOT rewrite, summarize, or change the content returned by the tool.
- Do NOT add your own explanations or commentary.
- If the tool returns JSON or a string, forward it verbatim to the caller (you may wrap JSON in a Markdown code block without changing it).
`,
  tools: [researchTopicTool],
  modelSettings: {
    toolChoice: "required",
  },
  toolUseBehavior: "stop_on_first_tool",
});
