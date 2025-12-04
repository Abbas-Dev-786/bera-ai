import express from "express";
import { AuditResult } from "../models/AuditResult.js";
import { Bundle } from "../models/Bundle.js";

const router = express.Router();

/**
 * GET /api/logs
 * Return a simple activity log combining recent audits and transaction bundles.
 */
router.get("/", async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10) || 20;

    const [audits, bundles] = await Promise.all([
      AuditResult.find().sort({ createdAt: -1 }).limit(limit),
      Bundle.find().sort({ createdAt: -1 }).limit(limit),
    ]);

    const items = [
      ...audits.map((a) => ({
        type: "audit",
        id: a._id.toString(),
        createdAt: a.createdAt,
        summary: a.summary,
        score: a.score,
      })),
      ...bundles.map((b) => ({
        type: "transaction",
        id: b._id.toString(),
        createdAt: b.createdAt,
        bundleId: b.bundleId,
        status: b.status,
        txHash: b.txHash,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


