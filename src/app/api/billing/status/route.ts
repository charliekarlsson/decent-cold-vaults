import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/tokens";
import { getWalletBillingStatus } from "@/lib/billing/plans";
import { PRO_PRICE_SOL } from "@/lib/billing/config";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { walletAddress } = await verifySessionToken(token);
    const billing = await getWalletBillingStatus(walletAddress);

    return NextResponse.json({
      ...billing,
      proPriceSol: PRO_PRICE_SOL,
      freeQuotaLabel: "10 MB",
      proQuotaLabel: "100 GB",
    });
  } catch (error) {
    console.error("Billing status error:", error);
    return NextResponse.json(
      { error: "Failed to load billing status." },
      { status: 500 }
    );
  }
}
