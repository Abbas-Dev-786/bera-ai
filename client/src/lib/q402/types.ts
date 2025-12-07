import { Address, Hex } from "viem";

export const PaymentScheme = {
  EIP7702_DELEGATED: "evm/eip7702-delegated-payment",
  EIP7702_DELEGATED_BATCH: "evm/eip7702-delegated-batch",
} as const;

export type PaymentSchemeType = (typeof PaymentScheme)[keyof typeof PaymentScheme];

export interface PaymentDetails {
  scheme: PaymentSchemeType;
  networkId: string;
  token: Address;
  amount: string;
  to: Address;
  implementationContract: Address;
  witness: WitnessTypedData;
  authorization: {
    chainId: number;
    address: Address;
    nonce: number;
  };
}

export interface SignedPaymentPayload {
  witnessSignature: Hex;
  authorization: AuthorizationTuple;
  paymentDetails: PaymentDetails;
}

export interface AuthorizationTuple {
  chainId: bigint;
  address: Address;
  nonce: bigint;
  yParity: number;
  r: Hex;
  s: Hex;
}

export interface UnsignedAuthorizationTuple {
  chainId: bigint;
  address: Address;
  nonce: bigint;
}

export interface WitnessTypedData {
  domain: Eip712Domain;
  types: {
    Witness: Array<{ name: string; type: string }>;
  };
  primaryType: "Witness";
  message: WitnessMessage;
}

export interface Eip712Domain {
  name: string;
  version?: string;
  chainId: number;
  verifyingContract: Address;
}

export interface WitnessMessage {
  owner: Address;
  token: Address;
  amount: bigint;
  to: Address;
  deadline: bigint;
  paymentId: Hex;
  nonce: bigint;
}

export interface PaymentRequiredResponse {
  x402Version: number;
  accepts: PaymentDetails[];
  error?: string;
}
