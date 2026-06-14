import { dbFirst, dbRun, dbTransaction } from "@/lib/db/client";
import {
  FREE_MAX_FILE_BYTES,
  FREE_STORAGE_BYTES,
  PRO_MAX_FILE_BYTES,
  PRO_STORAGE_BYTES,
} from "./config";

export type PlanType = "free" | "pro";

export interface WalletBillingStatus {
  plan: PlanType;
  storageUsedBytes: number;
  storageQuotaBytes: number;
  planExpiresAt: string | null;
  isProActive: boolean;
  maxFileBytes: number;
}

interface WalletRow {
  wallet_address: string;
  plan: PlanType;
  storage_used_bytes: number;
  plan_expires_at: string | null;
}

function isProActive(row: WalletRow): boolean {
  if (row.plan !== "pro" || !row.plan_expires_at) return false;
  return new Date(row.plan_expires_at).getTime() > Date.now();
}

function getQuotaBytes(row: WalletRow): number {
  return isProActive(row) ? PRO_STORAGE_BYTES : FREE_STORAGE_BYTES;
}

function getMaxFileBytes(row: WalletRow): number {
  return isProActive(row) ? PRO_MAX_FILE_BYTES : FREE_MAX_FILE_BYTES;
}

export async function ensureWalletPlan(
  walletAddress: string
): Promise<WalletRow> {
  const existing = await dbFirst<WalletRow>(
    `SELECT * FROM wallet_plans WHERE wallet_address = ?`,
    walletAddress
  );

  if (existing) return existing;

  await dbRun(
    `INSERT INTO wallet_plans (wallet_address, plan, storage_used_bytes) VALUES (?, 'free', 0)`,
    walletAddress
  );

  return (await dbFirst<WalletRow>(
    `SELECT * FROM wallet_plans WHERE wallet_address = ?`,
    walletAddress
  )) as WalletRow;
}

export async function getWalletBillingStatus(
  walletAddress: string
): Promise<WalletBillingStatus> {
  const row = await ensureWalletPlan(walletAddress);
  const proActive = isProActive(row);

  return {
    plan: proActive ? "pro" : "free",
    storageUsedBytes: row.storage_used_bytes,
    storageQuotaBytes: getQuotaBytes(row),
    planExpiresAt: row.plan_expires_at,
    isProActive: proActive,
    maxFileBytes: getMaxFileBytes(row),
  };
}

export class StorageQuotaError extends Error {
  constructor(
    message: string,
    public code: "QUOTA_EXCEEDED" | "FILE_TOO_LARGE" | "PLAN_EXPIRED"
  ) {
    super(message);
    this.name = "StorageQuotaError";
  }
}

export async function assertCanUpload(
  walletAddress: string,
  fileSizeBytes: number
): Promise<WalletBillingStatus> {
  const status = await getWalletBillingStatus(walletAddress);

  if (fileSizeBytes > status.maxFileBytes) {
    throw new StorageQuotaError(
      status.isProActive
        ? `File exceeds ${formatQuota(status.maxFileBytes)} upload limit.`
        : `Free plan files must be under ${formatQuota(FREE_MAX_FILE_BYTES)}. Upgrade for larger uploads.`,
      "FILE_TOO_LARGE"
    );
  }

  if (status.storageUsedBytes + fileSizeBytes > status.storageQuotaBytes) {
    const msg = status.isProActive
      ? "Storage full. You have used your 100 GB Pro allowance."
      : "Free storage full (10 MB). Upgrade to Pro for 100 GB — 1 SOL/year.";
    throw new StorageQuotaError(msg, "QUOTA_EXCEEDED");
  }

  return status;
}

export async function recordUpload(
  walletAddress: string,
  objectId: string,
  sizeBytes: number
): Promise<void> {
  await ensureWalletPlan(walletAddress);
  const createdAt = new Date().toISOString();

  await dbTransaction([
    {
      sql: `INSERT INTO storage_objects (object_id, wallet_address, size_bytes, created_at)
            VALUES (?, ?, ?, ?)`,
      params: [objectId, walletAddress, sizeBytes, createdAt],
    },
    {
      sql: `UPDATE wallet_plans SET storage_used_bytes = storage_used_bytes + ? WHERE wallet_address = ?`,
      params: [sizeBytes, walletAddress],
    },
  ]);
}

export async function objectBelongsToWallet(
  objectId: string,
  walletAddress: string
): Promise<boolean> {
  const row = await dbFirst<{ ok: number }>(
    `SELECT 1 as ok FROM storage_objects WHERE object_id = ? AND wallet_address = ?`,
    objectId,
    walletAddress
  );
  return !!row;
}

export async function isPaymentSignatureUsed(
  signature: string
): Promise<boolean> {
  const row = await dbFirst<{ ok: number }>(
    `SELECT 1 as ok FROM used_payment_signatures WHERE signature = ?`,
    signature
  );
  return !!row;
}

export async function activateProPlan(
  walletAddress: string,
  paymentSignature: string
): Promise<WalletBillingStatus> {
  await ensureWalletPlan(walletAddress);

  const now = Date.now();
  const row = await dbFirst<{ plan_expires_at: string | null }>(
    `SELECT plan_expires_at FROM wallet_plans WHERE wallet_address = ?`,
    walletAddress
  );

  const currentExpiry = row?.plan_expires_at
    ? new Date(row.plan_expires_at).getTime()
    : 0;
  const base = Math.max(now, currentExpiry);
  const newExpiry = new Date(
    base + 365 * 24 * 60 * 60 * 1000
  ).toISOString();
  const upgradedAt = new Date().toISOString();

  await dbTransaction([
    {
      sql: `INSERT INTO used_payment_signatures (signature, wallet_address, payment_type, created_at)
            VALUES (?, ?, 'pro_upgrade', ?)`,
      params: [paymentSignature, walletAddress, upgradedAt],
    },
    {
      sql: `UPDATE wallet_plans
            SET plan = 'pro', plan_expires_at = ?, upgraded_at = ?, last_payment_signature = ?
            WHERE wallet_address = ?`,
      params: [newExpiry, upgradedAt, paymentSignature, walletAddress],
    },
  ]);

  return getWalletBillingStatus(walletAddress);
}

export async function releaseStorage(
  walletAddress: string,
  objectId: string
): Promise<boolean> {
  const object = await dbFirst<{ size_bytes: number }>(
    `SELECT size_bytes FROM storage_objects WHERE object_id = ? AND wallet_address = ?`,
    objectId,
    walletAddress
  );

  if (!object) return false;

  await dbTransaction([
    {
      sql: `DELETE FROM storage_objects WHERE object_id = ?`,
      params: [objectId],
    },
    {
      sql: `UPDATE wallet_plans SET storage_used_bytes = MAX(0, storage_used_bytes - ?) WHERE wallet_address = ?`,
      params: [object.size_bytes, walletAddress],
    },
  ]);

  return true;
}

function formatQuota(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${bytes / 1024 ** 3} GB`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}
