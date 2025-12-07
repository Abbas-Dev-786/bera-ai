const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
  artifactId?: string;
  summary: string;
  score: number | null;
  report: unknown;
  createdAt: string;
}


export async function sendChatMessage(
  message: string,
  conversationId?: string,
  tone?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/api/agent/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: message, conversationId, tone }),
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
 * Compile a contract (generate ABI/Bytecode) if missing.
 * POST /api/contracts/compile
 */
export async function compileContract(artifactId: string): Promise<GeneratedContract> {
  const res = await fetch(`${API_BASE_URL}/api/contracts/compile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artifactId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Compile contract failed: ${res.status} ${res.statusText} ${errorText}`
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

/**
 * Fetch all contract artifacts.
 * GET /api/contracts
 */
export async function getContracts(params?: {
  limit?: number;
  skip?: number;
  search?: string;
}): Promise<{
  contracts: GeneratedContract[];
  total: number;
  limit: number;
  skip: number;
}> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.skip) queryParams.append("skip", params.skip.toString());
  if (params?.search) queryParams.append("search", params.search);

  const res = await fetch(
    `${API_BASE_URL}/api/contracts?${queryParams.toString()}`
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Get contracts failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch audit results.
 * GET /api/contracts/audits
 */
export async function getAudits(params?: {
  limit?: number;
  skip?: number;
  artifactId?: string;
}): Promise<{
  audits: ContractAudit[];
  total: number;
  limit: number;
  skip: number;
}> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.skip) queryParams.append("skip", params.skip.toString());
  if (params?.artifactId) queryParams.append("artifactId", params.artifactId);

  const res = await fetch(
    `${API_BASE_URL}/api/contracts/audits?${queryParams.toString()}`
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Get audits failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  return json.data;
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

/**
 * Create a transaction bundle (preview) before signing.
 * POST /api/tx/preview
 */
export async function createTransactionBundle(
  type: Transaction["type"],
  params: Record<string, unknown>
): Promise<{ bundleId: string; status: string; txHash: string | null }> {
  const res = await fetch(`${API_BASE_URL}/api/tx/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...params }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Create transaction bundle failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  return json.data;
}

/**
 * Submit a signed bundle for execution.
 * POST /api/tx/submit
 */
export async function submitSignedBundle(
  bundleId: string,
  signature: string
): Promise<{ bundleId: string; txHash: string; status: string }> {
  const res = await fetch(`${API_BASE_URL}/api/tx/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bundleId, signature }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Submit signed bundle failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  return json.data;
}

/**
 * Execute a transaction (creates bundle, returns bundleId for signing).
 * This is a convenience function that creates the bundle.
 * The actual execution requires signing and calling submitSignedBundle.
 */
export async function executeTransaction(
  type: Transaction["type"],
  params: Record<string, unknown>
): Promise<Transaction> {
  const bundle = await createTransactionBundle(type, params);

  return {
    id: bundle.bundleId,
    type,
    status: "pending",
    hash: bundle.txHash || undefined,
    from: (params.from as string) || "",
    to: (params.to as string) || undefined,
    amount: (params.amount as string) || undefined,
    token: (params.token as string) || undefined,
    timestamp: new Date(),
    gasUsed: undefined,
  };
}



/**
 * Create a deployment transaction bundle.
 */
export async function deployContractTx(
  contract: GeneratedContract,
  args: any[] = []
): Promise<Transaction> {
  const bundle = await createTransactionBundle("deploy", {
    bytecode: contract.bytecode,
    abi: contract.abi,
    args: args,
  });

  return {
    id: bundle.bundleId,
    type: "deploy",
    status: "pending",
    hash: bundle.txHash || undefined,
    from: "", // Will be filled by context or ignored in preview
    to: undefined,
    amount: "0",
    token: "BNB",
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
  const res = await fetch(`${API_BASE_URL}/api/tx/policy`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dailySpendCapUsd: settings.dailySpendCap,
      perTxLimitUsd: settings.perTxLimit,
      allowedTokens: settings.allowedTokens,
      allowedContracts: settings.allowedContracts,
      testnetMode: settings.testnetMode,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Update policy failed: ${res.status} ${res.statusText} ${errorText}`
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
// ... existing exports ...

/**
 * Execute a transaction/action.
 * Falls back to Q402 payment if required.
 * POST /api/premium (Mock for now, will replace with specific endpoints later)
 */
export async function executeAction(
  _actionId: string,
  paymentHeader?: string
): Promise<{ success: boolean; data: any; paymentRequired?: PaymentRequiredResponse }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (paymentHeader) {
    headers["x-payment"] = paymentHeader;
  }

  // Using /api/premium as the demo endpoint for "executing" an action
  // In a real app, this would be /api/swap/execute or similar
  const res = await fetch(`${API_BASE_URL}/api/premium`, {
    method: "GET", // Changing to GET as per server implementation for now. ideally POST for actions.
    headers,
  });

  if (res.status === 402) {
    const json = await res.json();
    return { success: false, data: null, paymentRequired: json };
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Execute action failed: ${res.status} ${res.statusText} ${errorText}`
    );
  }

  const json = await res.json();
  return { success: true, data: json };
}

// Re-export types needed for Q402
export interface PaymentRequiredResponse {
  x402Version: number;
  accepts: any[];
  error?: string;
}
