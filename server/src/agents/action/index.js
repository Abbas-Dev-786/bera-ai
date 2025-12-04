import { tool, Agent } from "@openai/agents";
import { z } from "zod";
import {
  createSignToPayBundle,
  submitSignedBundle,
} from "../../services/quack.js";
import { Bundle } from "../../models/Bundle.js";

/**
 * prepare_bundle: create a x402 bundle to be signed by the user
 */
const prepareBundleTool = tool({
  name: "prepare_bundle",
  description:
    "Prepare a Quack/x402 sign-to-pay bundle for deployment or transactions.",
  parameters: z.object({
    artifactId: z.string().optional(),
    actions: z.array(z.any()).min(1),
    createdBy: z.string().optional(),
  }),
  async execute({ artifactId, actions, createdBy }) {
    // run policy checks here (caps, allowlist) — omitted for brevity
    const payload = { actions, meta: { createdBy } };
    const res = await createSignToPayBundle(payload);
    // res should contain bundleId and preview
    const bundle = await Bundle.create({
      artifactId,
      createdBy,
      bundleId: res.id || res.bundleId,
      preview: res.preview || res,
      status: "awaiting_signature",
    });
    return {
      bundleId: bundle.bundleId,
      preview: bundle.preview,
      dbId: bundle._id.toString(),
    };
  },
});

/**
 * submit_signature: submit a user's signature to Quack to execute the bundle
 */
const submitSignatureTool = tool({
  name: "submit_signature",
  description: "Submit signed approval for a prepared bundle.",
  parameters: z.object({ bundleId: z.string(), signature: z.string() }),
  async execute({ bundleId, signature }) {
    const res = await submitSignedBundle(bundleId, signature);
    // Update DB entry (simple example)
    const bundle = await Bundle.findOneAndUpdate(
      { bundleId },
      { status: "submitted", txHash: res.txHash },
      { new: true }
    );
    return { result: res, bundleId: bundle?.bundleId, txHash: res.txHash };
  },
});

export const actionsAgent = new Agent({
  name: "actions_agent",
  instructions: `
You are Actions Agent.

BEHAVIOR RULES:
- You must NOT broadcast transactions without explicit human approval.
- Use prepare_bundle to create an x402 sign-to-pay bundle for the required actions.
- Use submit_signature only after a user has provided a signature.
- Do NOT modify or reinterpret the outputs of these tools; return their responses exactly as they are.
- If you need to show the user the result, you may wrap JSON in a Markdown code block without changing it.
`,
  tools: [prepareBundleTool, submitSignatureTool],
  modelSettings: {
    toolChoice: "required",
  },
  toolUseBehavior: "stop_on_first_tool",
});
