import axios from "axios";
import { QUACK_API_KEY, QUACK_BASE } from "../config/index.js";

const client = axios.create({
  baseURL: QUACK_BASE,
  headers: {
    Authorization: `Bearer ${QUACK_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

/**
 * createSignToPayBundle
 * - The payload shape for Quack / x402 will depend on their API.
 * - Typically you send an array of actions (to, data, value, chainId) and get back a bundle id + preview.
 */
export async function createSignToPayBundle(payload) {
  try {
    const res = await client.post("/x402/bundles", payload);
    return res.data;
  } catch (error) {
    console.error("Quack createSignToPayBundle error:", error.message);
    if (error.response) {
      throw new Error(
        `Quack API error: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    }
    throw new Error(`Failed to create sign-to-pay bundle: ${error.message}`);
  }
}

/**
 * Submit the signed approval
 */
export async function submitSignedBundle(bundleId, signature) {
  try {
    const res = await client.post(`/x402/bundles/${bundleId}/submit`, {
      signature,
    });
    return res.data;
  } catch (error) {
    console.error("Quack submitSignedBundle error:", error.message);
    if (error.response) {
      throw new Error(
        `Quack API error: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    }
    throw new Error(`Failed to submit signed bundle: ${error.message}`);
  }
}
