import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  verifyLoginChallenge,
} from "@/lib/auth/tokens";
import { findLoginTransfer } from "@/lib/solana/transfer-watcher";

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
      await verifyLoginChallenge(challengeToken);

    const signature = await findLoginTransfer(walletAddress, issuedAt);

    if (!signature) {
      return NextResponse.json({ status: "pending" });
    }

    const { token, expiresAt } = await createSessionToken(walletAddress);

    return NextResponse.json({
      status: "verified",
      token,
      walletAddress,
      expiresAt,
      signature,
    });
  } catch (error) {
    console.error("Login poll error:", error);
    const message =
      error instanceof Error ? error.message : "Login check failed.";
    const status = message.includes("expired") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
