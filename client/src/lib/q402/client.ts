import { WalletClient, LocalAccount, PrivateKeyAccount, Address, Hex, Account } from "viem";
import { PaymentDetails, SignedPaymentPayload, Eip712Domain, UnsignedAuthorizationTuple, PaymentRequiredResponse, PaymentScheme } from "./types";
import { signWitnessWithWallet } from "./signing";
import { encodeBase64, generateNonce, generatePaymentId, generateAuthNonce, validateAddress, validateAmount, PaymentValidationError } from "./utils";

/**
 * Create a Q402 payment header using EIP-712 signing (browser wallet compatible).
 * Note: This simplified version uses EIP-712 witness signing only.
 * EIP-7702 authorization is mocked for demo purposes since most wallets don't support it yet.
 */
export async function createPaymentHeaderWithWallet(
  walletClient: WalletClient,
  account: Account | LocalAccount | PrivateKeyAccount | Address, 
  paymentDetails: PaymentDetails,
): Promise<string> {
  const ownerAddress = typeof account === 'string' ? account : account.address;

  // Prepare witness message
  const witnessMessage = {
    owner: ownerAddress,
    token: paymentDetails.token,
    amount: BigInt(paymentDetails.amount),
    to: paymentDetails.to,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 900),
    paymentId: generatePaymentId(),
    nonce: generateNonce(),
  };

  // Create domain
  const domain: Eip712Domain = {
    name: "q402",
    version: "1",
    chainId: paymentDetails.authorization.chainId,
    verifyingContract: paymentDetails.authorization.address,
  };

  // Sign witness using EIP-712 typed data (works with all browser wallets)
  const witnessSignature = await signWitnessWithWallet(walletClient, domain, witnessMessage);

  // Create a mock authorization for demo purposes
  // In production with EIP-7702 support, this would be a real signed authorization
  const mockAuthorization = {
    chainId: BigInt(paymentDetails.authorization.chainId),
    address: ownerAddress as Address,
    nonce: BigInt(paymentDetails.authorization.nonce || 0),
    yParity: 0,
    r: witnessSignature.slice(0, 66) as Hex, // Reuse witness signature components
    s: `0x${witnessSignature.slice(66, 130)}` as Hex,
  };

  // Create signed payload
  const payload: SignedPaymentPayload = {
    witnessSignature,
    authorization: mockAuthorization,
    paymentDetails,
  };

  return encodeBase64(payload);
}

export function selectPaymentDetails(
  response: PaymentRequiredResponse,
  options?: { network?: string; scheme?: string; maxAmount?: bigint }
): PaymentDetails | null {
  if (!response.accepts || response.accepts.length === 0) {
    return null;
  }

  const { network, scheme, maxAmount } = options ?? {};

  let candidates = response.accepts;

  if (network) {
    const filtered = candidates.filter((details) => details.networkId === network);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  if (scheme) {
    const filtered = candidates.filter((details) => details.scheme === scheme);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  if (maxAmount !== undefined) {
    const filtered = candidates.filter((details) => BigInt(details.amount) <= maxAmount);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  return candidates[0] ?? null;
}
