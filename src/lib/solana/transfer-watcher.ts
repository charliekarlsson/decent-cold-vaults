import {
  Connection,
  PublicKey,
  type ParsedTransactionWithMeta,
} from "@solana/web3.js";
import {
  getLoginRecipientAddress,
  getSolanaRpcUrl,
  LOGIN_AMOUNT_TOLERANCE_LAMPORTS,
  LOGIN_LAMPORTS,
} from "./config";

function isValidTransferFromSender(
  tx: ParsedTransactionWithMeta,
  sender: PublicKey,
  recipient: PublicKey,
  expectedLamports: number,
  toleranceLamports: number
): boolean {
  if (tx.meta?.err) return false;

  for (const instruction of tx.transaction.message.instructions) {
    if (!("parsed" in instruction)) continue;
    const parsed = instruction.parsed;
    if (parsed?.type !== "transfer") continue;

    const info = parsed.info as {
      source: string;
      destination: string;
      lamports: number;
    };

    if (
      info.source === sender.toBase58() &&
      info.destination === recipient.toBase58() &&
      Math.abs(info.lamports - expectedLamports) <= toleranceLamports
    ) {
      return true;
    }
  }

  return false;
}

/** Scan recent inbound transfers to the login address from a specific wallet. */
export async function findLoginTransfer(
  walletAddress: string,
  notBeforeUnix: number
): Promise<string | null> {
  return findTransfer(
    walletAddress,
    notBeforeUnix,
    LOGIN_LAMPORTS,
    LOGIN_AMOUNT_TOLERANCE_LAMPORTS
  );
}

/** Scan for a SOL transfer of a specific amount to the billing recipient. */
export async function findTransfer(
  walletAddress: string,
  notBeforeUnix: number,
  expectedLamports: number,
  toleranceLamports: number
): Promise<string | null> {
  const connection = new Connection(getSolanaRpcUrl(), "confirmed");
  const sender = new PublicKey(walletAddress);
  const recipient = new PublicKey(getLoginRecipientAddress());

  const signatures = await connection.getSignaturesForAddress(recipient, {
    limit: 100,
  });

  for (const entry of signatures) {
    if (entry.blockTime && entry.blockTime < notBeforeUnix - 30) {
      continue;
    }

    const tx = await connection.getParsedTransaction(entry.signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) continue;

    if (
      isValidTransferFromSender(
        tx,
        sender,
        recipient,
        expectedLamports,
        toleranceLamports
      )
    ) {
      return entry.signature;
    }
  }

  return null;
}
