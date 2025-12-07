import { PaymentScheme } from "./../../services/q402/types.js";
// import { NetworkConfigs } from "../../services/q402/network.js"; // We need network config, I missed porting network.ts. I'll mock it or port it.

// Mocking NetworkConfigs for now since I didn't port network.ts yet.
// In a real app, this should be in services/q402/network.js
const MockNetworkConfigs = {
    "bsc-testnet": {
        chainId: 97,
        name: "BNB Smart Chain Testnet",
    },
    "bsc-mainnet": {
        chainId: 56,
        name: "BNB Smart Chain Mainnet",
    }
};

/**
 * Create 402 Payment Required response
 */
export function create402Response(config, endpoint, req) {
    const networkConfig = MockNetworkConfigs[config.network] || MockNetworkConfigs["bsc-testnet"];

    const paymentDetails = {
        scheme: PaymentScheme.EIP7702_DELEGATED,
        networkId: config.network,
        token: endpoint.token,
        amount: endpoint.amount,
        to: config.recipientAddress,
        implementationContract: config.implementationContract,
        witness: {
            domain: {
                name: "q402",
                version: "1",
                chainId: networkConfig.chainId,
                verifyingContract: config.verifyingContract,
            },
            types: {
                Witness: [
                    { name: "owner", type: "address" },
                    { name: "token", type: "address" },
                    { name: "amount", type: "uint256" },
                    { name: "to", type: "address" },
                    { name: "deadline", type: "uint256" },
                    { name: "paymentId", type: "bytes32" },
                    { name: "nonce", type: "uint256" },
                ],
            },
            primaryType: "Witness",
            message: {
                owner: "0x0000000000000000000000000000000000000000", // Placeholder
                token: endpoint.token,
                amount: BigInt(endpoint.amount).toString(), // Ensure string for JSON
                to: config.recipientAddress,
                deadline: Math.floor(Date.now() / 1000) + 900,
                paymentId: "0x0000000000000000000000000000000000000000000000000000000000000000",
                nonce: 0,
            },
        },
        authorization: {
            chainId: networkConfig.chainId,
            address: config.implementationContract,
            nonce: 0,
        },
    };

    const response = {
        x402Version: 1,
        accepts: [paymentDetails],
    };

    // Convert BigInts to strings for JSON serialization
    return JSON.parse(JSON.stringify(response, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    ));
}

/**
 * Send 402 Payment Required response
 */
export function send402Response(res, config, endpoint, req) {
    const response = create402Response(config, endpoint, req);
    res.status(402).json(response);
}
