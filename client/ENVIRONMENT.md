## Client Environment Configuration

The client is built with Vite and reads non-secret configuration from `import.meta.env`.
Define these variables in a `.env` (or `.env.local`) file at the `client` root:

- `VITE_API_BASE_URL` – Base URL of the backend server (e.g. `http://localhost:4000`).
- `VITE_NETWORK_NAME` – Display name for the active network (e.g. `BNB Testnet`).
- `VITE_DEFAULT_CHAIN_ID` – Numeric chain ID for BNB testnet or mainnet (e.g. `97` for testnet).

Example `.env` snippet:

```bash
VITE_API_BASE_URL=http://localhost:4000
VITE_NETWORK_NAME="BNB Testnet"
VITE_DEFAULT_CHAIN_ID=97
```

Restart the dev server after changing any `VITE_` variables.
