import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/tokens";
import { objectBelongsToWallet } from "@/lib/billing/plans";
import { downloadFromR2, isR2Configured } from "@/lib/storage/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ objectId: string }> }
) {
  try {
    const { objectId } = await params;

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { walletAddress } = await verifySessionToken(token);

    if (!(await isR2Configured())) {
      return NextResponse.json(
        { error: "Storage service not configured." },
        { status: 503 }
      );
    }

    if (!objectId) {
      return NextResponse.json({ error: "Object ID required." }, { status: 400 });
    }

    if (!(await objectBelongsToWallet(objectId, walletAddress))) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const data = await downloadFromR2(objectId);

    return new NextResponse(Buffer.from(data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Storage download error:", error);
    return NextResponse.json(
      { error: "Download failed. Please try again." },
      { status: 500 }
    );
  }
}
