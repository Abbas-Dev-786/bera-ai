import { tool, Agent } from "@openai/agents";
import { z } from "zod";
import { generateContractFromSpec } from "../../services/chaingpt.js";
import { ContractArtifact } from "../../models/ContractArtifact.js";

const generateContractTool = tool({
  name: "generate_contract",
  description:
    "Generate a solidity contract from a natural language spec (ChainGPT).",
  parameters: z.object({ spec: z.string().min(10) }),
  async execute({ spec }) {
    console.log("BUILDER TOOL CALLED WITH SPEC:", spec);
    const data = await generateContractFromSpec(spec);
    console.log("BUILDER TOOL RECEIVED DATA:", data);
    // data should include solidity source, abi, bytecode — adapt as needed
    const artifact = await ContractArtifact.create({
      name: "generated_contract",
      spec,
      solidity: data.contract || data.solidity || JSON.stringify(data),
      abi: data.abi || null,
      bytecode: data.bytecode || null,
    });
    return { artifactId: artifact._id.toString(), contract: artifact.solidity };
  },
});

export const buildAgent = new Agent({
  name: "build_agent",
  instructions: `
You are a Builder Agent. Given a clear spec, call the generate_contract tool to produce Solidity source code.

BEHAVIOR RULES:
- You MUST NOT write any Solidity or other code yourself; only use the generate_contract tool.
- You MUST NOT modify or reformat the tool's output (contract, ABI, bytecode, or any text).
- Return exactly what the tool returns (you may wrap it in a Markdown code block without changing the content).
`,
  tools: [generateContractTool],
  modelSettings: {
    toolChoice: "required",
  },
  toolUseBehavior: "stop_on_first_tool",
});
