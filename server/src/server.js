import express from "express";
import cors from "cors";
import morgan from "morgan";

import { createWalletClient, http } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { bscTestnet } from "viem/chains";
import { createQ402Middleware } from "./middleware/q402/index.js";

import { PORT } from "./config/index.js";
import { connectDB } from "./config/db.js";
import { validateEnv } from "./utils/validateEnv.js";
import agentRoutes from "./routes/agent.js";
import contractsRoutes from "./routes/contracts.js";
import txRoutes from "./routes/tx.js";
import logsRoutes from "./routes/logs.js";

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/agent", agentRoutes);
app.use("/api/contracts", contractsRoutes);
app.use("/api/tx", txRoutes);
app.use("/api/logs", logsRoutes);

// Q402 Configuration
const sponsorKey = process.env.SPONSOR_KEY || generatePrivateKey(); // Use env or random for demo
const account = privateKeyToAccount(sponsorKey);

const walletClient = createWalletClient({
  account,
  chain: bscTestnet,
  transport: http(),
});

// Q402 Middleware
app.use(
  createQ402Middleware({
    network: "bsc-testnet",
    recipientAddress: "0x0000000000000000000000000000000000000000", // Replace with real treasury
    implementationContract: "0x0000000000000000000000000000000000000000", // Replace with real implementation
    verifyingContract: "0x0000000000000000000000000000000000000000", // Replace with real verifying
    walletClient,
    endpoints: [
      {
        path: "/api/premium",
        amount: "1000000000000000000", // 1 BNB (Wei) - example amount
        token: "0x0000000000000000000000000000000000000000", // Native BNB or Token Address
        description: "Premium API access",
      },
    ],
  })
);

// Protected Route Example
app.get("/api/premium", (req, res) => {
  res.json({
    message: "You have accessed premium content!",
    payment: req.payment,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
    },
  });
});

// Start server
async function startServer() {
  try {
    // Validate environment variables
    validateEnv();

    // Connect to database
    await connectDB();

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

export default app;
export { startServer };
