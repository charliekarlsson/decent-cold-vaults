import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/tokens";
import {
  getWalletBillingStatus,
  StorageQuotaError,
  assertCanUpload,
  recordUpload,
} from "@/lib/billing/plans";
import { isR2Configured, uploadToR2 } from "@/lib/storage/r2";

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

    if (!isR2Configured()) {
      return NextResponse.json(
        {
          error:
            "Storage service not configured. Set Cloudflare R2 environment variables.",
        },
        { status: 503 }
      );
    }

    const encryptedData = await request.arrayBuffer();

    if (!encryptedData || encryptedData.byteLength === 0) {
      return NextResponse.json(
        { error: "No data provided for upload." },
        { status: 400 }
      );
    }

    await assertCanUpload(walletAddress, encryptedData.byteLength);

    const objectId = await uploadToR2(encryptedData);
    await recordUpload(walletAddress, objectId, encryptedData.byteLength);

    const billing = await getWalletBillingStatus(walletAddress);

    return NextResponse.json({
      txId: objectId,
      billing: {
        storageUsedBytes: billing.storageUsedBytes,
        storageQuotaBytes: billing.storageQuotaBytes,
        plan: billing.plan,
      },
    });
  } catch (error) {
    if (error instanceof StorageQuotaError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 402 }
      );
    }
    console.error("Storage upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

export const maxDuration = 60;
