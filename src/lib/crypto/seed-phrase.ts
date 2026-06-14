import { generateMnemonic, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

/** Generate a cryptographically secure 24-word BIP39 mnemonic entirely client-side. */
export function generateSeedPhrase(): string {
  return generateMnemonic(wordlist, 256);
}

/** Validate that a user-entered phrase is a valid 24-word BIP39 mnemonic. */
export function isValidSeedPhrase(phrase: string): boolean {
  const normalized = phrase.trim().toLowerCase().replace(/\s+/g, " ");
  return validateMnemonic(normalized, wordlist);
}

export function normalizeSeedPhrase(phrase: string): string {
  return phrase.trim().toLowerCase().replace(/\s+/g, " ");
}

export function seedPhraseToWords(phrase: string): string[] {
  return normalizeSeedPhrase(phrase).split(" ");
}
