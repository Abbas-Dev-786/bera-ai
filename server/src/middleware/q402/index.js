import { decodeBase64, encodeBase64 } from "../../services/q402/utils.js";
import { verifyPayment, settlePayment } from "../../services/q402/core.js";
import { send402Response } from "./handlers.js";

const X_PAYMENT_HEADER = "x-payment";
const X_PAYMENT_RESPONSE_HEADER = "x-payment-response";

/**
 * Create q402 payment middleware for Express
 * @param {Object} config - Middleware configuration
 * @returns {Function} Express middleware
 */
export function createQ402Middleware(config) {
    return async (req, res, next) => {
        try {
            // Find matching endpoint
            // We check if the request path *matches* one of the configured endpoints.
            // Ideally this should use path-to-regexp or similar if we want wildcards, but strict match is fine for now.
            const endpoint = config.endpoints.find((ep) => req.path === ep.path);

            if (!endpoint) {
                // Not a protected endpoint
                next();
                return;
            }

            // Check for X-PAYMENT header
            const paymentHeader = req.headers[X_PAYMENT_HEADER];

            if (!paymentHeader) {
                // No payment header - return 402
                send402Response(res, config, endpoint, req);
                return;
            }

            // Decode payment payload
            let payload;
            try {
                payload = decodeBase64(paymentHeader);
            } catch (e) {
                res.status(400).json({
                    error: "Invalid payment header format",
                });
                return;
            }

            // Verify payment
            const verificationResult = await verifyPayment(payload);

            if (!verificationResult.isValid) {
                res.status(402).json({
                    x402Version: 1,
                    accepts: [],
                    error: `Payment verification failed: ${verificationResult.invalidReason}`,
                });
                return;
            }

            // Verification succeeded - proceed with request
            // Attach payment info to request
            req.payment = {
                verified: true,
                payer: verificationResult.payer,
                amount: payload.paymentDetails.amount,
                token: payload.paymentDetails.token,
            };

            // Settle payment if auto-settle is enabled
            if (config.autoSettle !== false) {
                try {
                    const settlementResult = await settlePayment(config.walletClient, payload);

                    if (settlementResult.success) {
                        // Add settlement response header
                        const executionResponse = {
                            txHash: settlementResult.txHash,
                            blockNumber: settlementResult.blockNumber ? settlementResult.blockNumber.toString() : "0",
                            status: "confirmed",
                        };

                        res.setHeader(X_PAYMENT_RESPONSE_HEADER, encodeBase64(executionResponse));
                    } else {
                        console.error("Settlement failed:", settlementResult.error);
                        // Continue anyway - payment was verified
                    }
                } catch (error) {
                    console.error("Settlement error:", error);
                    // Continue anyway - payment was verified
                }
            }

            // Continue to route handler
            next();
        } catch (error) {
            console.error("Middleware error:", error);
            res.status(500).json({
                error: "Internal server error",
            });
        }
    };
}
