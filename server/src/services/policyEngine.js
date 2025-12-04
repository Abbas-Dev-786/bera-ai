/**
 * Simple policy and safety engine.
 * In a real deployment you might persist these settings per user/tenant.
 */

const DEFAULT_POLICY = {
  dailySpendCapUsd: 500,
  perTxLimitUsd: 100,
  allowedTokens: ["BNB", "USDT", "BUSD", "ETH"],
  allowedContracts: [],
  testnetMode: true,
};

let currentPolicy = { ...DEFAULT_POLICY };

export function getPolicy() {
  return currentPolicy;
}

export function updatePolicy(partial) {
  currentPolicy = { ...currentPolicy, ...partial };
  return currentPolicy;
}

/**
 * Basic policy validation before creating a bundle.
 * This is intentionally simple and works off a provided "estimatedUsd" amount.
 */
export function validateActionsAgainstPolicy(actions = []) {
  const policy = getPolicy();

  // Aggregate an estimated USD amount if provided on each action
  const totalUsd = actions.reduce((sum, action) => {
    const amt = Number(action.estimatedUsd || 0);
    return sum + (Number.isFinite(amt) ? amt : 0);
  }, 0);

  if (policy.perTxLimitUsd && totalUsd > policy.perTxLimitUsd) {
    return {
      allowed: false,
      reason: `Per-transaction limit exceeded: ${totalUsd} > ${policy.perTxLimitUsd} USD`,
    };
  }

  // In a real system you'd also:
  // - track daily spend
  // - enforce allow-/deny-lists for tokens/contracts/addresses

  return { allowed: true };
}


