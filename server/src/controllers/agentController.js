import { runAgent } from "../agents/manager.js";

/**
 * Handle agent query requests
 */
export async function handleAgentQuery(req, res, next) {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: "Query is required and must be a non-empty string",
        },
      });
    }

    const result = await runAgent(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
