export interface VaultFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  storageTxId: string;
  iv: string;
  uploadedAt: string;
}

export interface ColdVault {
  id: string;
  name: string;
  createdAt: string;
  files: VaultFile[];
}

export interface SessionWallet {
  address: string;
  token: string;
  expiresAt: string;
  verifiedAt: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  stage: "encrypting" | "uploading" | "complete" | "error";
  progress: number;
  error?: string;
}
