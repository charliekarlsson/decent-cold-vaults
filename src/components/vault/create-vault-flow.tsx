"use client";

import { useState } from "react";
import { FolderLock, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DecentLogo } from "@/components/brand/decent-logo";
import { generateSeedPhrase } from "@/lib/crypto/seed-phrase";
import { deriveMasterKey } from "@/lib/crypto/key-derivation";
import { generateId } from "@/lib/utils";
import { useVaultStore } from "@/store/vault-store";
import { SeedPhraseDisplay } from "./seed-phrase-display";
import type { ColdVault } from "@/types";

type Step = "name" | "generate" | "confirm" | "done";

interface CreateVaultFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVaultFlow({ open, onOpenChange }: CreateVaultFlowProps) {
  const [step, setStep] = useState<Step>("name");
  const [vaultName, setVaultName] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const addVault = useVaultStore((s) => s.addVault);
  const unlockVault = useVaultStore((s) => s.unlockVault);

  function reset() {
    setStep("name");
    setVaultName("");
    setSeedPhrase("");
  }

  function handleClose(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  function handleGenerate() {
    if (!vaultName.trim()) return;
    const phrase = generateSeedPhrase();
    setSeedPhrase(phrase);
    setStep("confirm");
  }

  async function handleConfirmed() {
    const vaultId = generateId();
    const vault: ColdVault = {
      id: vaultId,
      name: vaultName.trim(),
      createdAt: new Date().toISOString(),
      files: [],
    };

    const masterKey = await deriveMasterKey(seedPhrase);
    addVault(vault);
    unlockVault(vaultId, masterKey);

    setSeedPhrase("");
    setStep("done");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-brand-dark">
            <FolderLock className="h-5 w-5 text-brand" />
            Create Cold Vault
          </DialogTitle>
          <DialogDescription>
            {step === "name" && "Name your vault. Generate a Cold Key next."}
            {step === "confirm" && "Write it down — shown once only."}
            {step === "done" && "Ready to upload."}
          </DialogDescription>
        </DialogHeader>

        {step === "name" && (
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Label htmlFor="vault-name">Vault name</Label>
              <Input
                id="vault-name"
                placeholder="e.g. Personal documents"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
                maxLength={64}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              24-word key · browser-only · encrypted uploads
            </p>

            <Button
              onClick={() => setStep("generate")}
              disabled={!vaultName.trim()}
              className="w-full"
              size="lg"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === "generate" && (
          <div className="space-y-6 py-2 text-center">
            <DecentLogo size={64} className="mx-auto" />
            <div className="p-2">
              <p className="font-display text-lg font-semibold mb-4">
                Generate your Cold Key
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setStep("name")} className="rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleGenerate} size="lg">
                  Generate Cold Key
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "confirm" && seedPhrase && (
          <SeedPhraseDisplay
            seedPhrase={seedPhrase}
            onConfirmed={handleConfirmed}
          />
        )}

        {step === "done" && (
          <div className="space-y-6 py-2 text-center">
            <DecentLogo size={72} className="mx-auto" />
            <div className="p-2">
              <h3 className="font-display text-xl font-semibold text-brand-dark mb-2">
                Vault created
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                &ldquo;{vaultName}&rdquo; is unlocked. Start uploading.
              </p>
              <Button
                onClick={() => handleClose(false)}
                size="lg"
                className="w-full"
              >
                Go to vault
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
