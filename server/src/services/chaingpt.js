import axios from "axios";
import { CHAINGPT_API_KEY, CHAINGPT_BASE } from "../config/index.js";

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

    return res.data;
  } catch (error) {
    console.error("ChainGPT generateContractFromSpec error:", error.message);
    throw error;
  }
}

export async function getTopicDetails(question) {
  try {
    const res = await client.post(
      "/",
      {
        model: "general_assistant",
        question: question,
        chatHistory: "on",
        // sdkUniqueId: "",
      },
      { responseType: "json" }
    );

    // Typical response: { contract: "pragma ...", abi: [...], bytecode: "..."}
    return res.data;
  } catch (error) {
    console.error("ChainGPT getTopicDetails error:", error.message);
    throw error;
  }
}

export async function auditContract(source) {
  try {
    // Assuming /audit-smart-contract based on naming convention, 
    // if fails we might need to check docs again or use the general chatbot to audit.
    const res = await client.post("/",
      {
        model: "smart_contract_auditor",
        question: source,
        chatHistory: "on",
        // sdkUniqueId: "",
      },
      { responseType: "json" });
    return res.data;
  } catch (error) {
    console.error("ChainGPT auditContract error:", error.message);
    throw error;
  }
}

