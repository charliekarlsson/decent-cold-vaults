import { PRO_PRICE_SOL } from "@/lib/billing/config";

export { PRO_PRICE_SOL };

export interface BillingStatus {
  plan: "free" | "pro";
  storageUsedBytes: number;
  storageQuotaBytes: number;
  planExpiresAt: string | null;
  isProActive: boolean;
  maxFileBytes: number;
  proPriceSol: number;
  freeQuotaLabel: string;
  proQuotaLabel: string;
}

export interface UpgradeChallenge {
  challengeToken: string;
  walletAddress: string;
  recipientAddress: string;
  amountSol: number;
  expiresAt: string;
  issuedAt: number;
  planLabel: string;
}

export async function fetchBillingStatus(
  authToken: string
): Promise<BillingStatus> {
  const response = await fetch("/api/billing/status", {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load billing.");
  }

  return data as BillingStatus;
}

export async function initiateUpgrade(
  authToken: string
): Promise<UpgradeChallenge> {
  const response = await fetch("/api/billing/upgrade/initiate", {
    method: "POST",
    headers: { Authorization: `Bearer ${authToken}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to start upgrade.");
  }

  return data as UpgradeChallenge;
}

export async function pollUpgrade(
  challengeToken: string
): Promise<{ status: string; billing?: BillingStatus }> {
  const response = await fetch("/api/billing/upgrade/poll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeToken }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Upgrade check failed.");
  }

  return data;
}

export async function waitForUpgradePayment(
  challengeToken: string,
  options?: {
    intervalMs?: number;
    timeoutMs?: number;
    shouldContinue?: () => boolean;
  }
): Promise<BillingStatus> {
  const intervalMs = options?.intervalMs ?? 3000;
  const timeoutMs = options?.timeoutMs ?? 30 * 60 * 1000;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    if (options?.shouldContinue && !options.shouldContinue()) {
      throw new Error("Upgrade cancelled.");
    }

    const result = await pollUpgrade(challengeToken);

    if (result.status === "verified" && result.billing) {
      return result.billing;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Upgrade timed out. Send 1 SOL and try again.");
}

export async function deleteStoredObject(
  objectId: string,
  authToken: string
): Promise<void> {
  const response = await fetch(`/api/storage/delete/${objectId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "Delete failed.");
  }
}
