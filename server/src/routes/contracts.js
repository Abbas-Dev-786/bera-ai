import express from "express";
import {
  generateContractFromSpec,
  auditContract,
} from "../services/chaingpt.js";
import { ContractArtifact } from "../models/ContractArtifact.js";
import { AuditResult } from "../models/AuditResult.js";

const router = express.Router();

/**
 * POST /api/contracts/generate
 * Generate a solidity contract from a natural language specification using ChainGPT.
 */
router.post("/generate", async (req, res, next) => {
  try {
    const { spec, name } = req.body || {};

    if (!spec || typeof spec !== "string" || spec.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: { message: "spec must be a descriptive string (min 10 chars)" },
      });
    }

    const data = await generateContractFromSpec(spec);

    const artifact = await ContractArtifact.create({
      name: name || "generated_contract",
      spec,
      solidity: data.contract || data.solidity || JSON.stringify(data),
      abi: data.abi || null,
      bytecode: data.bytecode || null,
    });

    return res.status(200).json({
      success: true,
      data: {
        artifactId: artifact._id.toString(),
        contract: artifact.solidity,
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        createdAt: artifact.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/contracts/audit
 * Run an AI-based audit on a solidity contract (raw source or by artifactId).
 */
router.post("/audit", async (req, res, next) => {
  try {
    const { source, artifactId } = req.body || {};

    let contractSource = source;

    if (!contractSource && artifactId) {
      const artifact = await ContractArtifact.findById(artifactId);
      if (!artifact) {
        return res
          .status(404)
          .json({ success: false, error: { message: "Artifact not found" } });
      }
      contractSource = artifact.solidity;
    }

    if (
      !contractSource ||
      typeof contractSource !== "string" ||
      contractSource.trim().length < 10
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            "source is required (or a valid artifactId) and must be a non-empty solidity string",
        },
      });
    }

    const data = await auditContract(contractSource);
    const summary = (data?.summary || "").slice(0, 2000);
    const score = data?.score ?? null;

    const record = await AuditResult.create({
      artifactId: artifactId || null,
      report: data,
      summary,
      score,
    });

    return res.status(200).json({
      success: true,
      data: {
        auditId: record._id.toString(),
        summary: record.summary,
        score: record.score,
        report: record.report,
        createdAt: record.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


