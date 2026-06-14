import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/tokens";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const { walletAddress } = await verifySessionToken(token);

    return NextResponse.json({
      valid: true,
      walletAddress,
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
