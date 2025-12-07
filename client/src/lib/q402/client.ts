import { WalletClient, LocalAccount, PrivateKeyAccount, Address, Hex, Account } from "viem";
import { PaymentDetails, SignedPaymentPayload, Eip712Domain, UnsignedAuthorizationTuple, PaymentRequiredResponse, PaymentScheme } from "./types";
import { signWitnessWithWallet, signAuthorization } from "./signing";
import { encodeBase64, generateNonce, generatePaymentId, generateAuthNonce, validateAddress, validateAmount, PaymentValidationError } from "./utils";

export async function createPaymentHeaderWithWallet(
  walletClient: WalletClient,
  account: Account | LocalAccount | PrivateKeyAccount | Address, 
  paymentDetails: PaymentDetails,
): Promise<string> {
  // If account is just address, check if it matches walletClient?
  // We assume caller handles consistency.

  // Prepare witness message
  const witnessMessage = {
    owner: typeof account === 'string' ? account : account.address,
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

  // Sign witness
  const witnessSignature = await signWitnessWithWallet(walletClient, domain, witnessMessage);

  const unsignedAuth: UnsignedAuthorizationTuple = {
    chainId: BigInt(paymentDetails.authorization.chainId),
    address: paymentDetails.implementationContract,
    nonce: BigInt(paymentDetails.authorization.nonce || generateAuthNonce()),
  };

  // Sign authorization
  const signedAuth = await signAuthorization(
    account,
    unsignedAuth,
    walletClient 
  );

  // Create signed payload
  const payload: SignedPaymentPayload = {
    witnessSignature,
    authorization: signedAuth,
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
