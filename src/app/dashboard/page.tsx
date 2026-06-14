"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VaultCard } from "@/components/vault/vault-card";
import { CreateVaultFlow } from "@/components/vault/create-vault-flow";
import { StoragePlanCard } from "@/components/billing/storage-plan-card";
import { useVaultStore } from "@/store/vault-store";

export default function DashboardPage() {
  const router = useRouter();
  const session = useVaultStore((s) => s.session);
  const vaults = useVaultStore((s) => s.vaults);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace("/");
    }
  }, [session, router]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Your vaults
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Unlock with your Cold Key to manage files.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="lg">
          <Plus className="h-4 w-4" />
          New Cold Vault
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-6 rounded-full bg-brand-light/50 border border-border inline-block px-3 py-1.5">
        Keys live in memory only — closing this tab locks all vaults.
      </p>

      <div className="mb-8">
        <StoragePlanCard authToken={session.token} />
      </div>

      {vaults.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-white/60 p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-light">
            <FolderLock className="h-7 w-7 text-brand" />
          </div>
          <h2 className="font-display text-lg font-semibold mb-1">No vaults yet</h2>
          <p className="text-muted-foreground text-sm mb-5">
            Create one to get a Cold Key and start encrypting files.
          </p>
          <Button onClick={() => setCreateOpen(true)} size="lg">
            <Plus className="h-4 w-4" />
            New Cold Vault
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaults.map((vault) => (
            <VaultCard key={vault.id} vault={vault} />
          ))}
        </div>
      )}

      <CreateVaultFlow open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
