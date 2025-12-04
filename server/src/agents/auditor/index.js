import { tool, Agent } from "@openai/agents";
import { z } from "zod";
import { auditContract } from "../../services/chaingpt.js";
import { AuditResult } from "../../models/AuditResult.js";

const auditContractTool = tool({
  name: "audit_contract",
  description: "Run automated audit on a solidity contract (ChainGPT auditor).",
  parameters: z.object({
    source: z.string().min(10),
    artifactId: z.string().optional(),
  }),
  async execute({ source, artifactId }) {
    const data = await auditContract(source);
    const summary = (data?.summary || "").slice(0, 2000);
    const score = data?.score ?? null;
    const record = await AuditResult.create({
      artifactId,
      report: data,
      summary,
      score,
    });
    return { auditId: record._id.toString(), report: data, summary, score };
  },
});

export const auditAgent = new Agent({
  name: "audit_agent",
  instructions: `
You are Audit Agent. Given solidity source, your only job is to call audit_contract.

BEHAVIOR RULES:
- Always call the audit_contract tool with the provided source (and optional artifactId). 
- Do NOT rewrite, summarize, or reinterpret the audit report returned by the tool.
- Do NOT invent additional findings, scores, or recommendations.
- Return exactly what the tool returns (report, summary, score) without modification. You may wrap JSON in a Markdown code block but must not change its content.
`,
  tools: [auditContractTool],
  modelSettings: {
    toolChoice: "required",
  },
  toolUseBehavior: "stop_on_first_tool",
});
