import express from "express";
import { handleAgentQuery } from "../controllers/agentController.js";

const router = express.Router();

/**
 * POST /api/agent/query
 * Execute an agent query
 */
router.post("/query", handleAgentQuery);

export default router;

