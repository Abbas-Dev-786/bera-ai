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
router.post("/preview", async (req, res, next) => {
  try {
    const { actions, artifactId, createdBy } = req.body || {};

    if (!Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "actions must be a non-empty array" },
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

    const payload = { actions, meta: { createdBy, policy: getPolicy() } };
    const quackRes = await createSignToPayBundle(payload);

    const bundle = await Bundle.create({
      artifactId: artifactId || null,
      createdBy: createdBy || null,
      bundleId: quackRes.id || quackRes.bundleId,
      preview: quackRes.preview || quackRes,
      status: "awaiting_signature",
    });

    return res.status(200).json({
      success: true,
      data: {
        bundleId: bundle.bundleId,
        dbId: bundle._id.toString(),
        preview: bundle.preview,
        status: bundle.status,
        createdAt: bundle.createdAt,
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


