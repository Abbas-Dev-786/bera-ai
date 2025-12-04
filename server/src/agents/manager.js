import { Agent, run } from "@openai/agents";
import setupOpenrouter from "../utils/setupOpenrouter.js";
import { researchAgent } from "./researcher/index.js";
import { buildAgent } from "./builder/index.js";
import { auditAgent } from "./auditor/index.js";
// import { actionsAgent } from "./action/index.js";

setupOpenrouter();

export const agent = new Agent({
  name: "Super web3 Agent",
  instructions: [
    "You are a super intelligent web3 agent that can build, audit, and deploy smart contracts using the provided tools.",
    "",
    "CRITICAL BEHAVIOR RULES:",
    "- You MUST NOT rewrite, summarize, or otherwise modify the raw outputs returned by tools.",
    "- When a tool returns a result, you should pass that result through to the user as-is (you may wrap JSON in a Markdown code block, but do not change keys, values, or wording).",
    "- Do NOT add your own additional commentary, conclusions, or rephrasing around tool outputs.",
    "- If multiple tools are used, present each tool's output clearly separated and labeled, but keep each tool's content verbatim.",
    "",
    "If you are unsure about something and no tool can answer it, explicitly say you don't know.",
    "Only answer questions that are relevant to web3 and smart contracts.",
  ].join("\n"),
  tools: [
    researchAgent.asTool({
      toolName: "topic_explainer",
      toolDescription:
        "Handles all the web3 related queries and doubts and questions.",
    }),
    buildAgent.asTool({
      toolName: "contract_builder",
      toolDescription: "Handles contract building.",
    }),
    auditAgent.asTool({
      toolName: "contract_auditor",
      toolDescription: "Handles contract auditing.",
    }),

    // actionsAgent.asTool({
    //   toolName: "transaction_handler",
    //   toolDescription: "Handles transaction preparation and execution via sign-to-pay bundles.",
    // }),
  ],
  modelSettings: {
    toolChoice: "required",
  },
  // toolUseBehavior: "stop_on_first_tool",
});

/**
 * Run the agent with a user query
 * @param {string} query - The user's query or request
 * @returns {Promise<{finalOutput: string}>} The agent's response
 */
export async function runAgent(query) {
  try {
    const result = await run(agent, query);
    return {
      finalOutput: result.finalOutput,
      success: true,
    };
  } catch (error) {
    console.error("Agent execution error:", error);
    throw new Error(`Failed to execute agent: ${error.message}`);
  }
}
