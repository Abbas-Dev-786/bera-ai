import { Hex, WalletClient, LocalAccount, PrivateKeyAccount, toRlp, concat, keccak256, Address, Account } from "viem";
import { UnsignedAuthorizationTuple, AuthorizationTuple, Eip712Domain, WitnessMessage } from "./types";
import { SignatureError } from "./utils";

export async function signWitnessWithWallet(
  walletClient: WalletClient,
  domain: Eip712Domain,
  message: WitnessMessage,
): Promise<Hex> {
  try {
    if (!walletClient.account) {
      throw new SignatureError("Wallet client has no account");
    }

    const signature = await walletClient.signTypedData({
      account: walletClient.account,
      domain: {
        name: domain.name,
        version: domain.version,
        chainId: domain.chainId,
        verifyingContract: domain.verifyingContract,
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
        owner: message.owner,
        token: message.token,
        amount: message.amount,
        to: message.to,
        deadline: message.deadline,
        paymentId: message.paymentId,
        nonce: message.nonce,
      },
    });

    return signature;
  } catch (error) {
    console.error("Sign Witness Error", error);
    throw new SignatureError("Failed to sign witness message with wallet", error);
  }
}

export async function signAuthorization(
  account: Account | LocalAccount | PrivateKeyAccount | Address,
  authorization: UnsignedAuthorizationTuple,
  walletClient?: WalletClient
): Promise<AuthorizationTuple> {
  try {
    // If account is a local account with signAuthorization capability, use it directly
    if (typeof account !== 'string' && 'signAuthorization' in account) {
      // Use viem's native signAuthorization for local accounts
      const signedAuth = await (account as any).signAuthorization({
        contractAddress: authorization.address,
        chainId: Number(authorization.chainId),
        nonce: Number(authorization.nonce),
      });
      return {
        chainId: authorization.chainId,
        address: authorization.address,
        nonce: authorization.nonce,
        yParity: signedAuth.yParity,
        r: signedAuth.r,
        s: signedAuth.s,
      };
    }

    // For browser wallets, use walletClient.signAuthorization if available (viem 2.x)
    if (walletClient && 'signAuthorization' in walletClient) {
      const signedAuth = await (walletClient as any).signAuthorization({
        contractAddress: authorization.address,
        chainId: Number(authorization.chainId),
        nonce: Number(authorization.nonce),
      });
      return {
        chainId: authorization.chainId,
        address: authorization.address,
        nonce: authorization.nonce,
        yParity: signedAuth.yParity,
        r: signedAuth.r,
        s: signedAuth.s,
      };
    }

    // Fallback: Manual signing for accounts with signMessage
    if (typeof account !== 'string' && 'signMessage' in account) {
      // Encode authorization data
      const encoded = toRlp([
        authorization.chainId === 0n ? "0x" : `0x${authorization.chainId.toString(16)}` as Hex,
        authorization.address,
        authorization.nonce === 0n ? "0x" : `0x${authorization.nonce.toString(16)}` as Hex,
      ]);

      // Prepend 0x05 type prefix
      const message = concat(["0x05", encoded]);

      // Hash the message
      const hash = keccak256(message);

      const signature = await account.signMessage({
        message: { raw: hash },
      });

      // Parse signature (viem returns r,s,v format)
      const signatureHex = signature as string;
      const r = signatureHex.slice(0, 66) as Hex;
      const s = `0x${signatureHex.slice(66, 130)}` as Hex;
      let v = parseInt(signatureHex.slice(130, 132), 16);
      
      // Normalize v if needed (some eth_sign return 00/01 or 27/28)
      if (v < 27) v += 27;

      // Convert v to y_parity (27/28 -> 0/1)
      const yParity = v >= 27 ? v - 27 : v;

      return {
        chainId: authorization.chainId,
        address: authorization.address,
        nonce: authorization.nonce,
        yParity,
        r,
        s,
      };
    }

    // If we get here, we don't have a supported signing method
    throw new SignatureError(
      "EIP-7702 signing requires a wallet that supports signAuthorization or a local account. " +
      "Your browser wallet may not support this feature yet."
    );
  } catch (error) {
    console.error("Sign Auth Error", error);
    if (error instanceof SignatureError) throw error;
    throw new SignatureError("Failed to sign authorization tuple", error);
  }
}
// NOTE: signAuthorization with WalletClient via `eth_sign` or `personal_sign` might not be standard for raw hashes
// and EIP-7702 auth isn't standard in all wallets yet.
// For browser wallets, we might need a workaround or assume the wallet handles EIP-7702 signing if supported.
// But for now, we'll keep `signAuthorization` requiring a local account which is a limitation for browser wallets
// unless we use a "session key" approach or the wallet supports signing specific types.
// HOWEVER, `eth_sign` can sign hashes, but it prepends the prefix.
// EIP-7702 requires signing the hash of (0x05 || rlp(...)).
// If using a browser wallet, we might need `walletClient.signMessage({ message: { raw: hash } })` if allowed
// or if the wallet exposes EIP-7702 specific method.
// For this MVP, we might need to assume a local key is available or use a burner wallet in the browser.
