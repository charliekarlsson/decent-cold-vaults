import { normalizeSeedPhrase } from "./seed-phrase";

const MASTER_KEY_INFO = "decent-cold-vault-master-v1";
const FILE_KEY_INFO = "decent-cold-vault-file-v1";

/** Derive the vault master AES-256 key from a BIP39 seed phrase using PBKDF2. */
export async function deriveMasterKey(seedPhrase: string): Promise<CryptoKey> {
  const normalized = normalizeSeedPhrase(seedPhrase);
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(normalized),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("decent-cold-vault-salt"),
      iterations: 600_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/** Derive a unique per-file AES-256 key from the master key via HKDF. */
export async function deriveFileKey(
  masterKey: CryptoKey,
  fileId: string
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.exportKey("raw", masterKey),
    "HKDF",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode(MASTER_KEY_INFO),
      info: encoder.encode(`${FILE_KEY_INFO}:${fileId}`),
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
