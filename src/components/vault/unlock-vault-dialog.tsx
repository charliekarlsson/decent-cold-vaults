"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isValidSeedPhrase, normalizeSeedPhrase } from "@/lib/crypto/seed-phrase";
import { deriveMasterKey } from "@/lib/crypto/key-derivation";
import { useVaultStore } from "@/store/vault-store";

interface UnlockVaultDialogProps {
  vaultId: string;
  vaultName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlocked?: () => void;
}

export function UnlockVaultDialog({
  vaultId,
  vaultName,
  open,
  onOpenChange,
  onUnlocked,
}: UnlockVaultDialogProps) {
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const unlockVault = useVaultStore((s) => s.unlockVault);

  async function handleUnlock() {
    setError(null);

    if (!isValidSeedPhrase(phrase)) {
      setError("Invalid Cold Key. Enter all 24 words correctly.");
      return;
    }

    setLoading(true);
    try {
      const masterKey = await deriveMasterKey(normalizeSeedPhrase(phrase));
      unlockVault(vaultId, masterKey);
      setPhrase("");
      onOpenChange(false);
      onUnlocked?.();
    } catch {
      setError("Failed to unlock vault. Check your Cold Key and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-brand" />
            Unlock &ldquo;{vaultName}&rdquo;
          </DialogTitle>
          <DialogDescription>
            Enter your 24-word Cold Key. Memory only — gone when tab closes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cold-key">Cold Key (24 words)</Label>
            <textarea
              id="cold-key"
              className="flex min-h-[120px] w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 font-mono resize-none"
              placeholder="word1 word2 word3 ..."
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-danger-border bg-danger-bg p-3 text-sm text-danger-text">
              {error}
            </div>
          )}

          <Button
            onClick={handleUnlock}
            disabled={loading || !phrase.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Deriving key...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Unlock vault
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
