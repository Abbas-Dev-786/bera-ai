import { ErrorReason } from "./types.js";

/**
 * Core payment verification function
 * @param {Object} payload - The signed payment payload
 * @returns {Promise<Object>} Verification result
 */
export async function verifyPayment(payload) {
    try {
        const { witnessSignature, authorization, paymentDetails } = payload;

        // 1. Basic payload validation
        if (!witnessSignature || !authorization || !paymentDetails) {
            return {
                isValid: false,
                invalidReason: ErrorReason.INVALID_SIGNATURE,
            };
        }

        // 2. Check deadline (from witness message)
        const now = Math.floor(Date.now() / 1000);
        const witness = paymentDetails.witness;
        if (witness?.message?.deadline && now > Number(witness.message.deadline)) {
            return {
                isValid: false,
                invalidReason: ErrorReason.PAYMENT_EXPIRED,
            };
        }

        // 3. Verify basic signature format
        const witnessValid = isValidSignature(witnessSignature);
        const authorizationValid = isValidAuthorization(authorization);

        if (!witnessValid) {
            return {
                isValid: false,
                invalidReason: ErrorReason.INVALID_SIGNATURE,
            };
        }

        if (!authorizationValid) {
            return {
                isValid: false,
                invalidReason: ErrorReason.INVALID_AUTHORIZATION,
            };
        }

        // 4. Verify amounts and recipients
        const amountValid = 'amount' in paymentDetails ? isValidAmount(paymentDetails.amount) : true;
        const recipientValid = isValidRecipient(paymentDetails.to);

        if (!amountValid) {
            return {
                isValid: false,
                invalidReason: ErrorReason.INVALID_AMOUNT,
            };
        }

        if (!recipientValid) {
            return {
                isValid: false,
                invalidReason: ErrorReason.INVALID_RECIPIENT,
            };
        }

        // All validations passed
        return {
            isValid: true,
            payer: authorization.address,
            details: {
                witnessValid,
                authorizationValid,
                amountValid,
                deadlineValid: true,
                recipientValid,
            },
        };

    } catch (error) {
        console.error("Payment verification error:", error);
        return {
            isValid: false,
            invalidReason: ErrorReason.UNEXPECTED_ERROR,
        };
    }
}

/**
 * Settle a verified payment by executing EIP-7702 transaction on-chain
 */
export async function settlePayment(walletClient, payload) {
    try {
        // For now, return a successful mock settlement
        // In production, this would execute the EIP-7702 transaction
        const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        // Simulate transaction execution delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            txHash: mockTxHash,
            blockNumber: BigInt(12345678),
        };

    } catch (error) {
        console.error("Settlement error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown settlement error",
        };
    }
}

/**
 * Validate signature format
 */
function isValidSignature(signature) {
    return (
        typeof signature === 'string' &&
        signature.startsWith('0x') &&
        signature.length === 132 // 65 bytes = 130 hex chars + 0x prefix
    );
}

/**
 * Validate EIP-7702 authorization format
 */
function isValidAuthorization(authorization) {
    const { chainId, address, nonce, yParity, r, s } = authorization;

    return !!(
        typeof chainId === 'number' && chainId > 0 &&
        typeof address === 'string' && address.startsWith('0x') && address.length === 42 &&
        typeof nonce === 'number' && nonce >= 0 &&
        typeof yParity === 'number' && (yParity === 0 || yParity === 1) &&
        typeof r === 'string' && r.startsWith('0x') && r.length === 66 &&
        typeof s === 'string' && s.startsWith('0x') && s.length === 66
    );
}

/**
 * Validate payment amount
 */
function isValidAmount(amount) {
    try {
        const amountBigInt = BigInt(amount);
        return amountBigInt > 0n;
    } catch {
        return false;
    }
}

/**
 * Validate recipient address
 */
function isValidRecipient(recipient) {
    return (
        typeof recipient === 'string' &&
        recipient.startsWith('0x') &&
        recipient.length === 42
    );
}
