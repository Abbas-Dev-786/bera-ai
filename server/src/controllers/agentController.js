import { getTopicDetails } from "../services/chaingpt.js";
import createPrompt from "../services/gpt.js";


/**
 * Handle general Web3 query requests using ChainGPT directly.
 * This endpoint answers research/explanation questions without any extra orchestration layer.
 */
export async function handleAgentQuery(req, res, next) {
  try {
    const { query, tone = "beginner" } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Query is required and must be a non-empty string",
        },
      });
    }

    const prompt = await createPrompt(query, tone)
    const result = await getTopicDetails(prompt);

    // Normalise into the shape expected by the client lib (data.finalOutput)
    const finalOutput =
      typeof result === "string" ? result : JSON.stringify(result);

    res.status(200).json({
      success: true,
      data: {
        finalOutput,
        raw: result,
      },
    });
  } catch (error) {
    next(error);
  }
}
