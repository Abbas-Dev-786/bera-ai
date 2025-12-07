/**
 * Error reasons for payment validation
 */
export const ErrorReason = {
    INSUFFICIENT_FUNDS: "insufficient_funds",
    INVALID_SIGNATURE: "invalid_signature",
    INVALID_AUTHORIZATION: "invalid_authorization",
    INVALID_AMOUNT: "invalid_amount",
    INVALID_RECIPIENT: "invalid_recipient",
    PAYMENT_EXPIRED: "payment_expired",
    NONCE_REUSED: "nonce_reused",
    INVALID_IMPLEMENTATION: "invalid_implementation",
    INVALID_NETWORK: "invalid_network",
    INVALID_SCHEME: "invalid_scheme",
    UNEXPECTED_ERROR: "unexpected_error",
};

/**
 * Payment scheme identifier
 */
export const PaymentScheme = {
    EIP7702_DELEGATED: "evm/eip7702-delegated-payment",
    EIP7702_DELEGATED_BATCH: "evm/eip7702-delegated-batch",
};
