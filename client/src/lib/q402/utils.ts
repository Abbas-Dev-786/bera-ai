import { Utils } from "viem";
import { Address, Hex } from "viem";

export function encodeBase64(data: any): string {
  return btoa(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export function generateNonce(): bigint {
  return BigInt(Math.floor(Math.random() * 1000000000));
}

export function generateAuthNonce(): bigint {
  return BigInt(Math.floor(Math.random() * 1000000000));
}

export function generatePaymentId(): Hex {
  const random = new Uint8Array(32);
  crypto.getRandomValues(random);
  return `0x${Array.from(random).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

export function validateAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateAmount(amount: bigint): boolean {
  return amount > 0n;
}

export class PaymentValidationError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = "PaymentValidationError";
  }
}

export class SignatureError extends Error {
  constructor(public message: string, public cause?: unknown) {
    super(message);
    this.name = "SignatureError";
  }
}
