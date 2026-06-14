"use client";

import Link from "next/link";
import {
  FolderLock,
  Lock,
  Unlock,
  FileText,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatBytes } from "@/lib/utils";
import { useVaultStore } from "@/store/vault-store";
import { UnlockVaultDialog } from "./unlock-vault-dialog";
import type { ColdVault } from "@/types";

interface VaultCardProps {
  vault: ColdVault;
}

export function VaultCard({ vault }: VaultCardProps) {
  const [unlockOpen, setUnlockOpen] = useState(false);
  const isUnlocked = useVaultStore((s) => s.isVaultUnlocked(vault.id));
  const lockVault = useVaultStore((s) => s.lockVault);
  const removeVault = useVaultStore((s) => s.removeVault);

  const totalSize = vault.files.reduce((sum, f) => sum + f.size, 0);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (
      confirm(
        `Delete "${vault.name}"? File metadata will be removed locally. Encrypted files remain on eternal storage.`
      )
    ) {
      removeVault(vault.id);
    }
  }

  const inner = (
    <Card
      className={`group transition-all rounded-3xl hover:shadow-md hover:shadow-brand/10 ${
        isUnlocked ? "border-brand/30 bg-brand-light/20" : "bg-white"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                isUnlocked
                  ? "bg-brand-light border border-brand/20"
                  : "bg-peach border border-border"
              }`}
            >
              <FolderLock
                className={`h-5 w-5 ${isUnlocked ? "text-brand" : "text-muted-foreground"}`}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{vault.name}</CardTitle>
              <CardDescription className="text-xs">
                Created {formatDate(vault.createdAt)}
              </CardDescription>
            </div>
          </div>
          {isUnlocked ? (
            <span className="flex items-center gap-1 text-xs text-brand-dark bg-brand-light px-2.5 py-1 rounded-full font-medium">
              <Unlock className="h-3 w-3" />
              Open
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-white px-2.5 py-1 rounded-full border border-border">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {vault.files.length} file{vault.files.length !== 1 ? "s" : ""}
            </span>
            <span>{formatBytes(totalSize)}</span>
          </div>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand" />
        </div>

        <div className="flex gap-2 mt-4">
          {!isUnlocked && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUnlockOpen(true);
              }}
            >
              <Lock className="h-3 w-3" />
              Unlock
            </Button>
          )}
          {isUnlocked && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                lockVault(vault.id);
              }}
            >
              <Lock className="h-3 w-3" />
              Lock
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-text hover:bg-danger-bg rounded-full"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {isUnlocked ? (
        <Link href={`/vault/${vault.id}`} className="block">
          {inner}
        </Link>
      ) : (
        <div
          className="cursor-pointer"
          onClick={() => setUnlockOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setUnlockOpen(true)}
        >
          {inner}
        </div>
      )}

      <UnlockVaultDialog
        vaultId={vault.id}
        vaultName={vault.name}
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
      />
    </>
  );
}
