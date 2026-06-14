"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Loader2,
  Trash2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { decryptData } from "@/lib/crypto/aes";
import { deriveFileKey } from "@/lib/crypto/key-derivation";
import { downloadEncryptedBlob } from "@/lib/storage/eternal-storage";
import { deleteStoredObject } from "@/lib/billing/client";
import { formatBytes, formatDate } from "@/lib/utils";
import { useVaultStore } from "@/store/vault-store";
import type { VaultFile } from "@/types";

interface FileListProps {
  vaultId: string;
  files: VaultFile[];
}

export function FileList({ vaultId, files }: FileListProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const getMasterKey = useVaultStore((s) => s.getMasterKey);
  const updateVault = useVaultStore((s) => s.updateVault);
  const vaults = useVaultStore((s) => s.vaults);
  const session = useVaultStore((s) => s.session);

  async function handleDownload(file: VaultFile) {
    const masterKey = getMasterKey(vaultId);
    if (!masterKey || !session?.token) return;

    setDownloading(file.id);
    try {
      const encrypted = await downloadEncryptedBlob(
        file.storageTxId,
        session.token
      );
      const fileKey = await deriveFileKey(masterKey, file.id);
      const decrypted = await decryptData(fileKey, encrypted, file.iv);

      const blob = new Blob([decrypted], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Decryption failed. Verify your Cold Key is correct.");
    } finally {
      setDownloading(null);
    }
  }

  async function handleDelete(file: VaultFile) {
    const vault = vaults.find((v) => v.id === vaultId);
    if (!vault || !session?.token) return;
    if (!confirm("Remove this file from the vault? This frees storage quota.")) return;

    try {
      if (file.storageTxId) {
        await deleteStoredObject(file.storageTxId, session.token);
      }
      updateVault(vaultId, {
        files: vault.files.filter((f) => f.id !== file.id),
      });
    } catch {
      alert("Could not delete file from storage.");
    }
  }

  if (files.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white/50 p-12 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">No files yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Upload files to encrypt and store them permanently
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 hover:border-brand/20 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light shrink-0">
            <FileText className="h-5 w-5 text-brand" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.size)} · {formatDate(file.uploadedAt)}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => handleDownload(file)}
              disabled={downloading === file.id}
            >
              {downloading === file.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger-text hover:bg-danger-bg rounded-full"
              onClick={() => handleDelete(file)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
