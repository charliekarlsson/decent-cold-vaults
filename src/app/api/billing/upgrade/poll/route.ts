import { NextRequest, NextResponse } from "next/server";
import { verifyUpgradeChallenge } from "@/lib/auth/tokens";
import {
  activateProPlan,
  getWalletBillingStatus,
  isPaymentSignatureUsed,
} from "@/lib/billing/plans";
import {
  PRO_AMOUNT_TOLERANCE_LAMPORTS,
  PRO_PRICE_LAMPORTS,
} from "@/lib/billing/config";
import { findTransfer } from "@/lib/solana/transfer-watcher";

export async function POST(request: NextRequest) {
  try {
    const { challengeToken } = await request.json();

    if (!challengeToken || typeof challengeToken !== "string") {
      return NextResponse.json(
        { error: "Challenge token is required." },
        { status: 400 }
      );
    }

    const { walletAddress, issuedAt } =
      await verifyUpgradeChallenge(challengeToken);

    const signature = await findTransfer(
      walletAddress,
      issuedAt,
      PRO_PRICE_LAMPORTS,
      PRO_AMOUNT_TOLERANCE_LAMPORTS
    );

    if (!signature) {
      return NextResponse.json({ status: "pending" });
    }

    if (await isPaymentSignatureUsed(signature)) {
      return NextResponse.json(
        { error: "Payment already processed." },
        { status: 409 }
      );
    }

    const billing = await activateProPlan(walletAddress, signature);

    return NextResponse.json({
      status: "verified",
      signature,
      billing,
    });
  } catch (error) {
    console.error("Upgrade poll error:", error);
    const message =
      error instanceof Error ? error.message : "Upgrade check failed.";
    const status = message.includes("expired") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
