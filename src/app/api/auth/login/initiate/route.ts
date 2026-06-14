import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { createLoginChallenge } from "@/lib/auth/tokens";
import {
  getLoginRecipientAddress,
  LOGIN_AMOUNT_SOL,
} from "@/lib/solana/config";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required." },
        { status: 400 }
      );
    }

    let normalizedAddress: string;
    try {
      normalizedAddress = new PublicKey(walletAddress.trim()).toBase58();
    } catch {
      return NextResponse.json(
        { error: "Invalid Solana wallet address." },
        { status: 400 }
      );
    }

    const { challengeToken, expiresAt, issuedAt } =
      await createLoginChallenge(normalizedAddress);

    return NextResponse.json({
      challengeToken,
      walletAddress: normalizedAddress,
      recipientAddress: getLoginRecipientAddress(),
      amountSol: LOGIN_AMOUNT_SOL,
      expiresAt,
      issuedAt,
    });
  } catch (error) {
    console.error("Login initiate error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to start login.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
