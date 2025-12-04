const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "code" | "transaction" | "audit" | "error";
  metadata?: {
    contractAddress?: string;
    txHash?: string;
    auditScore?: number;
    riskLevel?: "low" | "medium" | "high";
    findings?: AuditFinding[];
  };
}

export interface AuditFinding {
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  line?: number;
}

export interface Transaction {
  id: string;
  type: "swap" | "transfer" | "stake" | "deploy" | "interact";
  status: "pending" | "success" | "failed";
  hash?: string;
  from: string;
  to?: string;
  amount?: string;
  token?: string;
  timestamp: Date;
  gasUsed?: string;
}

export interface PolicySettings {
  dailySpendCap: number;
  perTxLimit: number;
  allowedTokens: string[];
  allowedContracts: string[];
  testnetMode: boolean;
  requireConfirmation: boolean;
}

export interface ActionData {
  id: string;
  type: "swap" | "transfer" | "stake" | "deploy" | "interact";
  status:
    | "pending"
    | "signing"
    | "executing"
    | "completed"
    | "failed"
    | "rejected";
  title: string;
  description: string;
  details: Record<string, string>;
  riskLevel: "low" | "medium" | "high";
  estimatedGas?: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: Message;
  suggestedActions?: string[];
  action?: ActionData;
}

export interface GeneratedContract {
  artifactId: string;
  contract: string;
  abi: unknown | null;
  bytecode: string | null;
  createdAt: string;
}

export interface ContractAudit {
  auditId: string;
  summary: string;
  score: number | null;
  report: unknown;
  createdAt: string;
}

// Dummy responses for different query types
const DUMMY_RESPONSES: Record<string, string> = {
  explain: `I'll explain this for you:

**Token Overview:**
This is a standard ERC-20 token with the following characteristics:
- Total Supply: 1,000,000,000 tokens
- Decimals: 18
- Transfer tax: 0%

**Key Functions:**
- \`transfer()\` - Standard token transfer
- \`approve()\` - Allow spending by another address
- \`transferFrom()\` - Transfer on behalf of another address

The contract follows OpenZeppelin's standard implementation and appears to be safe for interaction.`,

  audit: `## Smart Contract Audit Report

**Contract:** 0x742d35Cc6634C0532925a3b844Bc9e7595f4E2e5
**Audit Score:** 87/100 ✅

### Findings Summary:

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Medium | 2 |
| Low | 3 |

### High Severity Issues:

**H-01: Reentrancy Risk in withdraw()**
- Line 156: External call before state update
- Recommendation: Use ReentrancyGuard or checks-effects-interactions pattern

### Medium Severity Issues:

**M-01: Missing zero address check**
- Line 45: Constructor doesn't validate owner address
- Recommendation: Add \`require(owner != address(0))\`

**M-02: Centralization risk**
- Owner can pause all transfers
- Recommendation: Consider timelock or multisig

The contract is generally well-written but has some areas for improvement.`,

  generate: `Here's your generated smart contract:

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18;
    
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
\`\`\`

**Features:**
- Standard ERC-20 implementation
- Fixed supply of 1,000,000 tokens
- Burn functionality
- Owner controls

Would you like me to deploy this contract to BNB testnet?`,

  swap: `I've prepared a swap transaction for you. Please review the details below and approve to proceed.

**Security Checks:** ✅ Passed
- Token verified on BscScan
- Sufficient liquidity available
- Within your daily spending limit`,

  transfer: `I've prepared a transfer transaction for you. Please review the details and sign to proceed.

**Security Checks:** ✅ Passed
- Recipient address verified
- Amount within daily limit
- Address not flagged`,

  stake: `I've prepared a staking transaction for you. Review the details below and approve to start earning.

**Security Checks:** ✅ Passed
- Protocol verified and audited
- APY verified on-chain
- Within policy limits`,

  default: `I'm your Web3 Super Agent, ready to help you with:

🔍 **Research & Explain** - Ask about any token, protocol, or DeFi strategy
📝 **Smart Contracts** - Generate or audit Solidity code
💱 **Execute Actions** - Swaps, transfers, staking on BNB Chain
🛡️ **Security** - Risk analysis and policy controls

What would you like to explore?`,
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Determine response type based on message content
function getResponseType(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("audit") || lower.includes("security check"))
    return "audit";
  if (lower.includes("generate") || lower.includes("create contract"))
    return "generate";
  if (lower.includes("swap") || lower.includes("exchange")) return "swap";
  if (lower.includes("transfer") || lower.includes("send")) return "transfer";
  if (lower.includes("stake") || lower.includes("staking")) return "stake";
  if (
    lower.includes("explain") ||
    lower.includes("what is") ||
    lower.includes("how does")
  )
    return "explain";
  return "default";
}

// Generate action data for transaction types
function generateAction(type: string): ActionData | undefined {
  if (type === "swap") {
    return {
      id: crypto.randomUUID(),
      type: "swap",
      status: "pending",
      title: "Swap 100 USDT for BNB",
      description: "PancakeSwap V3 • Best rate found",
      details: {
        From: "100 USDT",
        "To (estimated)": "~0.041 BNB",
        "Exchange Rate": "1 BNB = 2,439.02 USDT",
        "Slippage Tolerance": "1%",
        Route: "USDT → WBNB → BNB",
      },
      riskLevel: "low",
      estimatedGas: "~0.0003 BNB",
      timestamp: new Date(),
    };
  }
  if (type === "transfer") {
    return {
      id: crypto.randomUUID(),
      type: "transfer",
      status: "pending",
      title: "Transfer 50 USDT",
      description: "Send to 0x742d...2e5",
      details: {
        Amount: "50 USDT",
        Recipient: "0x742d35Cc...2e5",
        Network: "BNB Chain",
      },
      riskLevel: "low",
      estimatedGas: "~0.0001 BNB",
      timestamp: new Date(),
    };
  }
  if (type === "stake") {
    return {
      id: crypto.randomUUID(),
      type: "stake",
      status: "pending",
      title: "Stake 100 BNB",
      description: "Venus Protocol • 4.2% APY",
      details: {
        Amount: "100 BNB",
        Protocol: "Venus Finance",
        APY: "4.2%",
        "Lock Period": "Flexible",
      },
      riskLevel: "medium",
      estimatedGas: "~0.0005 BNB",
      timestamp: new Date(),
    };
  }
  return undefined;
}

export async function sendChatMessage(
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/api/agent/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: message, conversationId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Chat request failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  const finalOutput: string =
    json?.data?.finalOutput || json?.data?.message || "";

  const response: Message = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: finalOutput,
    timestamp: new Date(),
    type: "text",
  };

  return {
    message: response,
  };
}

/**
 * Generate a Solidity contract from a natural-language spec.
 * POST /api/contracts/generate
 */
export async function generateContract(
  spec: string,
  name?: string
): Promise<GeneratedContract> {
  const res = await fetch(`${API_BASE_URL}/api/contracts/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spec, name }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Generate contract failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  return json.data as GeneratedContract;
}

/**
 * Run an AI audit on a Solidity contract.
 * POST /api/contracts/audit
 */
export async function runContractAudit(params: {
  source: string;
  artifactId?: string;
}): Promise<ContractAudit> {
  const res = await fetch(`${API_BASE_URL}/api/contracts/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Contract audit failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  return json.data as ContractAudit;
}

function getSuggestedActions(type: string): string[] {
  switch (type) {
    case "audit":
      return [
        "View full report",
        "Generate fix suggestions",
        "Check similar contracts",
      ];
    case "generate":
      return ["Deploy to testnet", "Run audit", "Modify contract"];
    case "swap":
      return ["Confirm swap", "Adjust slippage", "Check other DEXs"];
    case "transfer":
      return ["Confirm transfer", "Edit amount", "Add to allowlist"];
    default:
      return ["Explain a token", "Generate contract", "Swap tokens"];
  }
}

export async function executeTransaction(
  type: Transaction["type"],
  params: Record<string, unknown>
): Promise<Transaction> {
  const res = await fetch(`${API_BASE_URL}/api/tx/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...params }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Execute transaction failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  const data = json.data;

  return {
    id: data?.bundleId || crypto.randomUUID(),
    type,
    status: "success",
    hash: data?.txHash,
    from: (params.from as string) || "",
    to: (params.to as string) || undefined,
    amount: (params.amount as string) || undefined,
    token: (params.token as string) || undefined,
    timestamp: new Date(),
    gasUsed: undefined,
  };
}

export async function getTransactionHistory(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE_URL}/api/logs`);

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Get logs failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  const items: any[] = json?.data?.items || [];

  // Map audit/transaction logs into a flat transaction-like history for UI
  return items
    .filter((item) => item.type === "transaction")
    .map((item) => ({
      id: item.id,
      type: "interact" as const,
      status:
        item.status === "failed" ? ("failed" as const) : ("success" as const),
      hash: item.txHash,
      from: "",
      to: undefined,
      amount: undefined,
      token: undefined,
      timestamp: new Date(item.createdAt),
      gasUsed: undefined,
    }));
}

export async function getPolicySettings(): Promise<PolicySettings> {
  const res = await fetch(`${API_BASE_URL}/api/tx/policy`);

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Get policy failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  const data = json?.data;

  return {
    dailySpendCap: data?.dailySpendCapUsd ?? 500,
    perTxLimit: data?.perTxLimitUsd ?? 100,
    allowedTokens: data?.allowedTokens ?? ["BNB", "USDT", "BUSD", "ETH"],
    allowedContracts: data?.allowedContracts ?? [],
    testnetMode: data?.testnetMode ?? true,
    requireConfirmation: true,
  };
}

export async function updatePolicySettings(
  settings: Partial<PolicySettings>
): Promise<PolicySettings> {
  // Currently policy is only configurable on the backend; just merge client-side
  const current = await getPolicySettings();
  return {
    ...current,
    ...settings,
  };
}

export async function analyzeRisk(address: string): Promise<{
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  warnings: string[];
}> {
  return {
    riskScore: 50,
    riskLevel: "medium",
    warnings: [
      `Risk analysis for ${address} is not implemented yet. Treat this as a placeholder and double-check before using real funds.`,
    ],
  };
}
