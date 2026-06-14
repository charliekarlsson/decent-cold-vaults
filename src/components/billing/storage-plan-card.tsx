"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Crown,
  HardDrive,
  Loader2,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  fetchBillingStatus,
  initiateUpgrade,
  waitForUpgradePayment,
  PRO_PRICE_SOL,
  type BillingStatus,
  type UpgradeChallenge,
} from "@/lib/billing/client";
import { formatBytes } from "@/lib/utils";

interface StoragePlanCardProps {
  authToken: string;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input readOnly value={value} className="font-mono text-xs" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export function StoragePlanCard({ authToken }: StoragePlanCardProps) {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [listening, setListening] = useState(false);
  const [challenge, setChallenge] = useState<UpgradeChallenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollActive = useRef(false);

  const loadBilling = useCallback(async () => {
    try {
      const status = await fetchBillingStatus(authToken);
      setBilling(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan.");
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  async function handleStartUpgrade() {
    setError(null);
    setUpgrading(true);
    try {
      const c = await initiateUpgrade(authToken);
      setChallenge(c);
      pollActive.current = true;
      setListening(true);

      const updated = await waitForUpgradePayment(c.challengeToken, {
        intervalMs: 3000,
        timeoutMs: Math.max(0, new Date(c.expiresAt).getTime() - Date.now()),
        shouldContinue: () => pollActive.current,
      });

      setBilling((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
            }
          : null
      );
      setChallenge(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed.");
    } finally {
      setUpgrading(false);
      setListening(false);
      pollActive.current = false;
    }
  }

  function handleCancelUpgrade() {
    pollActive.current = false;
    setListening(false);
    setChallenge(null);
    setUpgrading(false);
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-white/80 p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading storage plan…
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="rounded-3xl border border-danger-border bg-danger-bg p-4 text-sm text-danger-text">
        {error ?? "Could not load storage plan."}
      </div>
    );
  }

  const usagePercent = Math.min(
    100,
    (billing.storageUsedBytes / billing.storageQuotaBytes) * 100
  );
  const isNearFull = usagePercent >= 90;

  return (
    <div className="rounded-3xl border border-border bg-white/80 p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-light">
            {billing.isProActive ? (
              <Crown className="h-5 w-5 text-brand-dark" />
            ) : (
              <HardDrive className="h-5 w-5 text-brand" />
            )}
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">
              {billing.isProActive ? "Pro storage" : "Free storage"}
            </p>
            <p className="text-xs text-muted-foreground">
              {billing.isProActive
                ? `100 GB · renews ${billing.planExpiresAt ? new Date(billing.planExpiresAt).toLocaleDateString() : "—"}`
                : "10 MB · notes, text, small files"}
            </p>
          </div>
        </div>
        {!billing.isProActive && !challenge && (
          <Button
            onClick={handleStartUpgrade}
            disabled={upgrading}
            className="shrink-0"
          >
            {upgrading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crown className="h-4 w-4" />
            )}
            {PRO_PRICE_SOL} SOL / yr
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {formatBytes(billing.storageUsedBytes)} used
          </span>
          <span className={isNearFull ? "text-brand-dark font-medium" : "text-muted-foreground"}>
            {formatBytes(billing.storageQuotaBytes)} total
          </span>
        </div>
        <Progress value={usagePercent} />
      </div>

      {challenge && listening && (
        <div className="rounded-2xl border border-brand/25 bg-brand-light/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-brand-dark font-medium">
            <Radio className="h-4 w-4 animate-pulse" />
            Send {PRO_PRICE_SOL} SOL to upgrade
          </div>
          <CopyField label="Amount (SOL)" value={String(PRO_PRICE_SOL)} />
          <CopyField label="Recipient" value={challenge.recipientAddress} />
          <p className="text-xs text-muted-foreground">
            From your connected wallet ({challenge.walletAddress.slice(0, 4)}…
            {challenge.walletAddress.slice(-4)}). Listening for payment…
          </p>
          <Button variant="outline" size="sm" onClick={handleCancelUpgrade}>
            Cancel
          </Button>
        </div>
      )}

      {error && (
        <p className="text-xs text-danger-text">{error}</p>
      )}

      {!billing.isProActive && !challenge && (
        <p className="text-xs text-muted-foreground">
          Upgrade to <span className="font-medium text-brand-dark">100 GB</span> for{" "}
          <span className="font-medium">{PRO_PRICE_SOL} SOL</span> per year — large
          files, photos, and archives.
        </p>
      )}
    </div>
  );
}
