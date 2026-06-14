import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, createUpgradeChallenge } from "@/lib/auth/tokens";
import { getLoginRecipientAddress } from "@/lib/solana/config";
import { PRO_PRICE_SOL } from "@/lib/billing/config";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { walletAddress } = await verifySessionToken(token);
    const { challengeToken, expiresAt, issuedAt } =
      await createUpgradeChallenge(walletAddress);

    return NextResponse.json({
      challengeToken,
      walletAddress,
      recipientAddress: getLoginRecipientAddress(),
      amountSol: PRO_PRICE_SOL,
      expiresAt,
      issuedAt,
      planLabel: "100 GB / year",
    });
  } catch (error) {
    console.error("Upgrade initiate error:", error);
    return NextResponse.json(
      { error: "Failed to start upgrade." },
      { status: 500 }
    );
  }
}
