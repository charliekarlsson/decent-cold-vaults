const IV_LENGTH = 12;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Encrypt data with AES-256-GCM. Returns ciphertext and IV as base64 strings. */
export async function encryptData(
  key: CryptoKey,
  data: ArrayBuffer
): Promise<{ ciphertext: ArrayBuffer; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return { ciphertext, iv: bufferToBase64(iv.buffer) };
}

/** Decrypt AES-256-GCM ciphertext using the provided IV (base64). */
export async function decryptData(
  key: CryptoKey,
  ciphertext: ArrayBuffer,
  ivBase64: string
): Promise<ArrayBuffer> {
  const iv = new Uint8Array(base64ToBuffer(ivBase64));
  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
}

export { bufferToBase64, base64ToBuffer };
