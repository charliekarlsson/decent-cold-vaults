"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Loader2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { encryptData } from "@/lib/crypto/aes";
import { deriveFileKey } from "@/lib/crypto/key-derivation";
import { uploadEncryptedBlob } from "@/lib/storage/eternal-storage";
import { generateId } from "@/lib/utils";
import { useVaultStore } from "@/store/vault-store";
import type { VaultFile, UploadProgress } from "@/types";

interface FileUploadProps {
  vaultId: string;
}

export function FileUpload({ vaultId }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const getMasterKey = useVaultStore((s) => s.getMasterKey);
  const updateVault = useVaultStore((s) => s.updateVault);
  const vaults = useVaultStore((s) => s.vaults);
  const session = useVaultStore((s) => s.session);
  const uploadProgress = useVaultStore((s) => s.uploadProgress);
  const setUploadProgress = useVaultStore((s) => s.setUploadProgress);
  const updateFileProgress = useVaultStore((s) => s.updateFileProgress);

  const vault = vaults.find((v) => v.id === vaultId);
  const activeUploads = uploadProgress.filter(
    (p) => p.stage !== "complete" && p.stage !== "error"
  );

  const processFile = useCallback(
    async (file: File) => {
      const masterKey = getMasterKey(vaultId);
      if (!masterKey || !vault || !session?.token) return;

      const fileId = generateId();
      const progress: UploadProgress = {
        fileId,
        fileName: file.name,
        stage: "encrypting",
        progress: 0,
      };

      setUploadProgress([...uploadProgress, progress]);

      try {
        updateFileProgress(fileId, { stage: "encrypting", progress: 20 });
        const fileKey = await deriveFileKey(masterKey, fileId);
        const fileBuffer = await file.arrayBuffer();
        const { ciphertext, iv } = await encryptData(fileKey, fileBuffer);

        updateFileProgress(fileId, { stage: "uploading", progress: 40 });

        const txId = await uploadEncryptedBlob(
          ciphertext,
          session.token,
          (p) => {
            updateFileProgress(fileId, {
              progress: 40 + Math.round(p * 0.55),
            });
          }
        );

        const vaultFile: VaultFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          storageTxId: txId,
          iv,
          uploadedAt: new Date().toISOString(),
        };

        updateVault(vaultId, {
          files: [...vault.files, vaultFile],
        });

        updateFileProgress(fileId, { stage: "complete", progress: 100 });

        setTimeout(() => {
          setUploadProgress(
            useVaultStore.getState().uploadProgress.filter((p) => p.fileId !== fileId)
          );
        }, 3000);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed.";
        const code =
          err instanceof Error && "code" in err
            ? (err as Error & { code?: string }).code
            : undefined;
        updateFileProgress(fileId, {
          stage: "error",
          progress: 0,
          error:
            code === "QUOTA_EXCEEDED" || code === "FILE_TOO_LARGE"
              ? `${message} Upgrade on your dashboard for 100 GB.`
              : message,
        });
      }
    },
    [
      getMasterKey,
      vaultId,
      vault,
      session,
      uploadProgress,
      setUploadProgress,
      updateFileProgress,
      updateVault,
    ]
  );

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(processFile);
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative rounded-3xl border-2 border-dashed transition-colors p-8 sm:p-10 text-center bg-white/60 ${
          dragging
            ? "border-brand bg-brand-light/50"
            : "border-border hover:border-brand/40"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light">
          <FileUp className="h-7 w-7 text-brand" />
        </div>
        <p className="font-display font-medium text-base mb-1">
          Drop files here
        </p>
        <p className="text-xs text-muted-foreground mb-5">
          Encrypted locally, then stored permanently.
        </p>
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={activeUploads.length > 0}
          className="rounded-full"
        >
          <Upload className="h-4 w-4" />
          Choose files
        </Button>
      </div>

      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          {uploadProgress.map((item) => (
            <div
              key={item.fileId}
              className="rounded-2xl border border-border bg-white p-4 space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{item.fileName}</span>
                <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                  {item.stage === "encrypting" && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Encrypting
                    </>
                  )}
                  {item.stage === "uploading" && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Uploading
                    </>
                  )}
                  {item.stage === "complete" && (
                    <span className="text-brand-dark font-medium">Done</span>
                  )}
                  {item.stage === "error" && (
                    <span className="text-danger-text">Failed</span>
                  )}
                </span>
              </div>
              <Progress value={item.progress} />
              {item.error && (
                <p className="text-xs text-danger-text">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
