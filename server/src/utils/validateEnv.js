import {
  OPENROUTER_API_KEY,
  CHAINGPT_API_KEY,
  QUACK_API_KEY,
  MONGODB_URI,
} from "../config/index.js";

/**
 * Validate that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
export function validateEnv() {
  const required = [
    { name: "OPENROUTER_API_KEY", value: OPENROUTER_API_KEY },
    { name: "CHAINGPT_API_KEY", value: CHAINGPT_API_KEY },
    { name: "QUACK_API_KEY", value: QUACK_API_KEY },
    { name: "MONGODB_URI", value: MONGODB_URI },
  ];

  const missing = required.filter(({ value }) => !value);

  if (missing.length > 0) {
    const missingNames = missing.map(({ name }) => name).join(", ");
    throw new Error(
      `Missing required environment variables: ${missingNames}. Please check your .env file.`
    );
  }

  console.log("Environment variables validated successfully");
}

