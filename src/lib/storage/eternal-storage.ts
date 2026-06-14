/** Client-side helpers for Decent Eternal Storage (Cloudflare R2 backend, hidden from UI). */

export async function uploadEncryptedBlob(
  encryptedData: ArrayBuffer,
  authToken: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  onProgress?.(10);

  const response = await fetch("/api/storage/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      Authorization: `Bearer ${authToken}`,
    },
    body: encryptedData,
  });

  onProgress?.(80);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.error ?? "Upload to eternal storage failed.") as Error & {
      code?: string;
    };
    err.code = data.code;
    throw err;
  }

  const { txId } = (await response.json()) as { txId: string };
  onProgress?.(100);
  return txId;
}

export async function downloadEncryptedBlob(
  objectId: string,
  authToken: string
): Promise<ArrayBuffer> {
  const response = await fetch(`/api/storage/download/${objectId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve file from eternal storage.");
  }

  return response.arrayBuffer();
}
