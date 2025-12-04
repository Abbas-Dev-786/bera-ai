## Server Environment Configuration

The server expects the following environment variables to be defined in a `.env` file
located in the `server` directory (loaded via `src/config/index.js`):

- `PORT` – HTTP port for the API (default: `4000`).
- `CHAINGPT_API_KEY` – ChainGPT API key for Web3 chat, contract generation, and auditing.
- `CHAINGPT_BASE` – ChainGPT base URL (default: `https://api.chaingpt.org/chat/stream`).
- `QUACK_API_KEY` – Quack / x402 API key used for sign-to-pay bundles.
- `QUACK_BASE` – Quack base URL (default: `https://api.quack.xyz`).
- `RPC_URL` – BNB Chain RPC URL (use a BNB testnet endpoint for development).
- `SIGNER_PRIVATE_KEY` – Private key for a testnet signer (never use real mainnet keys here).
- `MONGODB_URI` – MongoDB connection string (e.g. `mongodb://localhost:27017/super-web3-agent`).
- `OPENROUTER_API_KEY` – API key used by the OpenAI Agents / OpenRouter integration.

Create a `.env` file with the keys above and restart the server after any changes.


