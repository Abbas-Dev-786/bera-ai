import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export const PORT = process.env.PORT || 4000;
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const CHAINGPT_API_KEY = process.env.CHAINGPT_API_KEY;
export const CHAINGPT_BASE =
  process.env.CHAINGPT_BASE || "https://api.chaingpt.org/chat/stream";
export const QUACK_API_KEY = process.env.QUACK_API_KEY;
export const QUACK_BASE = process.env.QUACK_BASE || "https://api.quack.xyz";
export const RPC_URL = process.env.RPC_URL;
export const MONGODB_URI = process.env.MONGODB_URI;
export const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
