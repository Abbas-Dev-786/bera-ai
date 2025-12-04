import axios from "axios";
import { CHAINGPT_API_KEY, CHAINGPT_BASE } from "../config/index.js";

/**
 * NOTE: Adapt endpoints and request bodies to the exact ChainGPT API spec.
 * The examples below show typical REST calls: /smart-contracts/generate and /smart-contracts/audit
 */

const client = axios.create({
  baseURL: CHAINGPT_BASE,
  headers: {
    Authorization: `Bearer ${CHAINGPT_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

export async function generateContractFromSpec(spec) {
  try {
    const res = await client.post(
      "/",
      {
        model: "smart_contract_generator",
        question: spec,
        chatHistory: "on",
        // sdkUniqueId: "",
      },
      { responseType: "json" }
    );

    console.log("ChainGPT response:", res.data);
    // Typical response: { contract: "pragma ...", abi: [...], bytecode: "..."}
    return res.data;
  } catch (error) {
    console.error("ChainGPT generateContractFromSpec error:", error.message);
    if (error.response) {
      throw new Error(
        `ChainGPT API error: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    }
    throw new Error(`Failed to generate contract: ${error.message}`);
  }
}

export async function getTopicDetails(spec) {
  try {
    const res = await client.post(
      "/",
      {
        model: "general_assistant",
        question: spec,
        chatHistory: "on",
        // sdkUniqueId: "",
      },
      { responseType: "json" }
    );

    console.log("ChainGPT response:", res.data);
    // Typical response: { contract: "pragma ...", abi: [...], bytecode: "..."}
    return res.data;
  } catch (error) {
    console.error("ChainGPT getTopicDetails error:", error.message);
    if (error.response) {
      throw new Error(
        `ChainGPT API error: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    }
    throw new Error(`Failed to get topic details: ${error.message}`);
  }
}

export async function auditContract(source) {
  try {
    // TODO: adapt to ChainGPT's auditor endpoint and expected shape
    const res = await client.post("/smart-contracts/audit", { source });
    return res.data;
  } catch (error) {
    console.error("ChainGPT auditContract error:", error.message);
    if (error.response) {
      throw new Error(
        `ChainGPT API error: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    }
    throw new Error(`Failed to audit contract: ${error.message}`);
  }
}

