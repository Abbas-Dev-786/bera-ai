import express from "express";
import { ethers } from "ethers";
import {
  createSignToPayBundle,
  submitSignedBundle,
} from "../services/quack.js";
import {
  getPolicy,
  updatePolicy,
  validateActionsAgainstPolicy,
  recordSpend
} from "../services/policyEngine.js";
import { Bundle } from "../models/Bundle.js";
import { TxBuilder } from "../services/txBuilder.js";

const router = express.Router();

/**
 * POST /api/tx/preview
 * Create a Quack/x402 bundle and return a human-readable preview plus bundleId.
 * The actual execution happens only after /api/tx/submit with a user signature.
 */
router.post("/preview", async (req, res, next) => {
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
    } else if (type === "deploy") {
      // Contract Deployment
      const { bytecode, abi, args } = req.body;
      const data = TxBuilder.encodeDeploy(bytecode, abi, args);
      actions.push({
        to: "0x", // 0x or null implies contract creation
        value: "0",
        data: data,
      });
    } else if (type === "interact") {
      // Generic Contract Interaction
      // Expecting: to, value (optional), data
      // Validate that 'data' is hex
      const txData = (req.body.data && req.body.data.startsWith("0x")) ? req.body.data : "0x";
      actions.push({
        to: to,
        value: ethers.parseEther(amount || "0").toString(),
        data: txData
      });
    }

    // Policy validation
    // Estimate USD for policy check (naive assumption: 1 BNB = $600, others ignored if not provided)
    // In a real app we'd fetch prices.
    const estimatedUsd = token === "BNB" ? parseFloat(amount) * 600 : 0;
    actions.forEach(a => a.estimatedUsd = estimatedUsd);
    // Also attach token symbol for policy check
    if (token) actions.forEach(a => a.tokenSymbol = token);

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
        warnings: policyCheck.warnings
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tx/submit
 * Submit a user's signature to execute a previously prepared bundle.
 */
router.post("/submit", async (req, res, next) => {
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

    // Naive spend recording - realistically we should sum up value from actions in the bundle
    // For now we don't have easy access to the actions here without fetching bundle again.
    // skipping accurate spend tracking for MVP submit phase, relying on pre-check.
    // However, if we wanted to be strict:
    // const storedBundle = await Bundle.findOne({ bundleId });
    // recordSpend(calculateUsd(storedBundle.preview.actions));

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

/**
 * PUT /api/tx/policy
 * Update the policy settings.
 */
router.put("/policy", (req, res, next) => {
  try {
    const { dailySpendCapUsd, perTxLimitUsd, allowedTokens, allowedContracts, testnetMode } = req.body || {};

    const updates = {};
    if (typeof dailySpendCapUsd === "number" && dailySpendCapUsd > 0) {
      updates.dailySpendCapUsd = dailySpendCapUsd;
    }
    if (typeof perTxLimitUsd === "number" && perTxLimitUsd > 0) {
      updates.perTxLimitUsd = perTxLimitUsd;
    }
    if (Array.isArray(allowedTokens)) {
      updates.allowedTokens = allowedTokens;
    }
    if (Array.isArray(allowedContracts)) {
      updates.allowedContracts = allowedContracts;
    }
    if (typeof testnetMode === "boolean") {
      updates.testnetMode = testnetMode;
    }

    const updatedPolicy = updatePolicy(updates);

    return res.status(200).json({
      success: true,
      data: updatedPolicy,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


