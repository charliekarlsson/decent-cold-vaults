"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  FolderLock,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/vault/file-upload";
import { FileList } from "@/components/vault/file-list";
import { UnlockVaultDialog } from "@/components/vault/unlock-vault-dialog";
import { useVaultStore } from "@/store/vault-store";

export default function VaultPage() {
  const router = useRouter();
  const params = useParams();
  const vaultId = params.id as string;

  const session = useVaultStore((s) => s.session);
  const vaults = useVaultStore((s) => s.vaults);
  const isUnlocked = useVaultStore((s) => s.isVaultUnlocked(vaultId));
  const lockVault = useVaultStore((s) => s.lockVault);

  const [unlockOpen, setUnlockOpen] = useState(false);

  const vault = vaults.find((v) => v.id === vaultId);

  useEffect(() => {
    if (!session) {
      router.replace("/");
    }
  }, [session, router]);

  useEffect(() => {
    if (vault && !isUnlocked) {
      setUnlockOpen(true);
    }
  }, [vault, isUnlocked]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Vault not found</h1>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
            Back to vaults
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All vaults
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light border border-brand/20">
            <FolderLock className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              {vault.name}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
              {isUnlocked ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                  <span className="text-brand-dark font-medium">Unlocked</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Locked
                </>
              )}
            </p>
          </div>
        </div>

        {isUnlocked && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              lockVault(vaultId);
              router.push("/dashboard");
            }}
          >
            <Lock className="h-4 w-4" />
            Lock & exit
          </Button>
        )}
      </div>

      {isUnlocked ? (
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-brand" />
              Upload files
            </h2>
            <FileUpload vaultId={vaultId} />
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-4">
              Stored files ({vault.files.length})
            </h2>
            <FileList vaultId={vaultId} files={vault.files} />
          </section>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-white/60 p-12 text-center">
          <Lock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm mb-4">Vault locked.</p>
          <Button onClick={() => setUnlockOpen(true)} className="rounded-full">
            <Lock className="h-4 w-4" />
            Unlock vault
          </Button>
        </div>
      )}

      <UnlockVaultDialog
        vaultId={vaultId}
        vaultName={vault.name}
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
      />
    </div>
  );
}
