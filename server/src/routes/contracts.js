import express from "express";
import {
  generateContractFromSpec,
  auditContract,
} from "../services/chaingpt.js";
import { ContractArtifact } from "../models/ContractArtifact.js";
import { AuditResult } from "../models/AuditResult.js";
import { getScoreAndSummary } from "../services/gpt.js";

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
 * GET /api/contracts
 * Fetch all contract artifacts with optional pagination and filtering.
 */
router.get("/", async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10) || 50;
    const skip = Number.parseInt(req.query.skip, 10) || 0;
    const search = req.query.search;

    let query = {};
    if (search && typeof search === "string") {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { spec: { $regex: search, $options: "i" } },
        ],
      };
    }

    const [contracts, total] = await Promise.all([
      ContractArtifact.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      ContractArtifact.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        contracts: contracts.map((c) => ({
          artifactId: c._id.toString(),
          name: c.name,
          spec: c.spec,
          contract: c.solidity,
          abi: c.abi,
          bytecode: c.bytecode,
          createdAt: c.createdAt,
        })),
        total,
        limit,
        skip,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/contracts/audits
 * Fetch audit results with optional filtering by artifactId.
 */
router.get("/audits", async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10) || 50;
    const skip = Number.parseInt(req.query.skip, 10) || 0;
    const artifactId = req.query.artifactId;

    let query = {};
    if (artifactId && typeof artifactId === "string") {
      query.artifactId = artifactId;
    }

    const [audits, total] = await Promise.all([
      AuditResult.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      AuditResult.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        audits: audits.map((a) => ({
          auditId: a._id.toString(),
          artifactId: a.artifactId?.toString() || null,
          summary: a.summary,
          score: a.score,
          report: a.report,
          createdAt: a.createdAt,
        })),
        total,
        limit,
        skip,
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
    const { source } = req.body || {};

    let contractSource = source;

    if (!contractSource) {
      return res
        .status(400)
        .json({ success: false, error: { message: "source is required" } });
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

    const { score, summary } = await getScoreAndSummary(data);

    console.log("score", score);
    console.log("summary", summary);

    const record = await AuditResult.create({
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


/**
 * POST /api/contracts/compile
 * Attempt to compile a contract (generate ABI/Bytecode) if missing.
 */
router.post("/compile", async (req, res, next) => {
  try {
    const { artifactId } = req.body;

    if (!artifactId) {
      return res.status(400).json({ success: false, error: { message: "artifactId is required" } });
    }

    const artifact = await ContractArtifact.findById(artifactId);
    if (!artifact) {
      return res.status(404).json({ success: false, error: { message: "Contract not found" } });
    }

    if (artifact.bytecode && artifact.abi) {
      // Already compiled
      return res.status(200).json({
        success: true,
        data: {
          artifactId: artifact._id.toString(),
          contract: artifact.solidity,
          abi: artifact.abi,
          bytecode: artifact.bytecode,
        },
      });
    }

    // Call "compile"
    // Use the service directly (ensure it's exported)
    // Dynamic import to avoid circular dependencies if any, though likely not needed if imported at top.
    // For safety, we keep using dynamic import or add it to top-level imports if easy.
    const service = await import("../services/chaingpt.js");

    // Check if function exists
    if (!service.compileContract) {
      throw new Error("compileContract function missing in service");
    }

    const data = await service.compileContract(artifact.solidity);

    // Update artifact
    if (data.abi) artifact.abi = data.abi;
    if (data.bytecode) artifact.bytecode = data.bytecode;
    await artifact.save();

    return res.status(200).json({
      success: true,
      data: {
        artifactId: artifact._id.toString(),
        contract: artifact.solidity,
        abi: artifact.abi,
        bytecode: artifact.bytecode,
      },
    });
  } catch (error) {
    next(error);
  }
});


export default router;


