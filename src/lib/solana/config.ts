import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const LOGIN_AMOUNT_SOL = 0.0001;
export const LOGIN_LAMPORTS = Math.round(LOGIN_AMOUNT_SOL * LAMPORTS_PER_SOL);
/** ±10% of login amount */
export const LOGIN_AMOUNT_TOLERANCE_LAMPORTS = Math.round(
  LOGIN_AMOUNT_SOL * LAMPORTS_PER_SOL * 0.1
);
export const CHALLENGE_TTL_SECONDS = 10 * 60;
export const SESSION_TTL_SECONDS = 24 * 60 * 60;

export function getSolanaRpcUrl(): string {
  return (
    process.env.SOLANA_RPC_URL ??
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    "https://api.mainnet-beta.solana.com"
  );
}

export function getLoginRecipientAddress(): string {
  const address = process.env.LOGIN_RECIPIENT_ADDRESS ??
    process.env.NEXT_PUBLIC_LOGIN_RECIPIENT_ADDRESS;

  if (!address) {
    throw new Error("LOGIN_RECIPIENT_ADDRESS is not configured.");
  }

  return address;
}
