import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export const PORT = process.env.PORT || 4000;
export const OPENROUTER_API_KEY = "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";
export const CHAINGPT_API_KEY = process.env.CHAINGPT_API_KEY;
export const CHAINGPT_BASE =
  process.env.CHAINGPT_BASE || "https://api.chaingpt.org/chat/stream";
export const QUACK_API_KEY = process.env.QUACK_API_KEY;
export const QUACK_BASE = process.env.QUACK_BASE || "https://api.quack.xyz";
export const RPC_URL = process.env.RPC_URL;
export const MONGODB_URI = process.env.MONGODB_URI;
export const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
