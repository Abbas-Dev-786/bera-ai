import express from "express";
import {
  createSignToPayBundle,
  submitSignedBundle,
} from "../services/quack.js";
import {
  getPolicy,
  validateActionsAgainstPolicy,
} from "../services/policyEngine.js";
import { Bundle } from "../models/Bundle.js";

const router = express.Router();

/**
 * POST /api/tx/preview
 * Create a Quack/x402 bundle and return a human-readable preview plus bundleId.
 * The actual execution happens only after /api/tx/execute with a user signature.
 */
import { TxBuilder } from "../services/txBuilder.js";

/**
 * POST /api/tx/execute
 * (Note: The client calls this "execute" but it actually prepares the bundle first, 
 * then the client signs it. We might want to split this or keep it as is.
 * For now, let's make /execute do the bundle creation + return the bundleId for signing.)
 * 
 * Actually, looking at client api.ts, it calls /api/tx/execute.
 * Let's map that to creating the bundle.
 */
router.post("/execute", async (req, res, next) => {
  try {
    const { type, from, to, amount, token, slippage } = req.body || {};

    let actions = [];

    if (type === "transfer") {
      // Simple native transfer or ERC20 transfer
      if (!token || token === "BNB") {
        actions.push({
          to: to,
          value: ethers.parseEther(amount).toString(),
          data: "0x",
        });
      } else {
        // ERC20 Transfer
        // TODO: Resolve token address from symbol
        const tokenAddress = "0x..."; // Placeholder
        const data = TxBuilder.encodeTransfer(to, ethers.parseUnits(amount, 18)); // Assume 18 decimals
        actions.push({
          to: tokenAddress,
          value: "0",
          data: data,
        });
      }
    } else if (type === "swap") {
      // Swap logic
      // 1. Approve Router (if token in)
      // 2. Swap
      const routerAddress = TxBuilder.getRouterAddress();
      // ... logic to construct swap actions
      // For MVP, let's just do a dummy swap action
       actions.push({
          to: routerAddress,
          value: "0",
          data: "0x", // TODO: Real swap encoding
        });
    }

    // Policy validation
    const policyCheck = validateActionsAgainstPolicy(actions);
    if (!policyCheck.allowed) {
      return res.status(400).json({
        success: false,
        error: { message: policyCheck.reason },
      });
    }

    const payload = { actions, meta: { createdBy: from, policy: getPolicy() } };
    const quackRes = await createSignToPayBundle(payload);

    const bundle = await Bundle.create({
      createdBy: from,
      bundleId: quackRes.id || quackRes.bundleId,
      preview: quackRes.preview || quackRes,
      status: "awaiting_signature",
    });

    return res.status(200).json({
      success: true,
      data: {
        bundleId: bundle.bundleId,
        txHash: null, // No hash yet
        status: bundle.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tx/execute
 * Submit a user's signature to execute a previously prepared bundle.
 */
router.post("/execute", async (req, res, next) => {
  try {
    const { bundleId, signature } = req.body || {};

    if (!bundleId || typeof bundleId !== "string") {
      return res.status(400).json({
        success: false,
        error: { message: "bundleId is required" },
      });
    }

    if (!signature || typeof signature !== "string") {
      return res.status(400).json({
        success: false,
        error: { message: "signature is required" },
      });
    }

    const result = await submitSignedBundle(bundleId, signature);

    const updated = await Bundle.findOneAndUpdate(
      { bundleId },
      {
        status: "submitted",
        txHash: result.txHash,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: {
        bundleId: updated?.bundleId || bundleId,
        txHash: updated?.txHash || result.txHash,
        status: updated?.status || "submitted",
        raw: result,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tx/policy
 * Return the in-memory policy used for validation.
 */
router.get("/policy", (req, res) => {
  return res.status(200).json({
    success: true,
    data: getPolicy(),
  });
});


export default router;


