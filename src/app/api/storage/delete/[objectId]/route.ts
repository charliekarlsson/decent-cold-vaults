import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/tokens";
import {
  objectBelongsToWallet,
  releaseStorage,
} from "@/lib/billing/plans";
import { deleteFromR2, isR2Configured } from "@/lib/storage/r2";

export async function DELETE(
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

    if (!objectId || !(await objectBelongsToWallet(objectId, walletAddress))) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    if (isR2Configured()) {
      try {
        await deleteFromR2(objectId);
      } catch {
        // Still release quota if R2 delete fails (orphan blob)
      }
    }

    await releaseStorage(walletAddress, objectId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Storage delete error:", error);
    return NextResponse.json(
      { error: "Delete failed. Please try again." },
      { status: 500 }
    );
  }
}
