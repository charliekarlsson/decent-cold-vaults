import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName };
}

export function isR2Configured(): boolean {
  return getR2Config() !== null;
}

export function getR2Client(): S3Client {
  const config = getR2Config();
  if (!config) {
    throw new Error(
      "Storage not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // R2 does not support AWS SDK v3 default checksum headers on Put/Get.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

export function getR2BucketName(): string {
  const config = getR2Config();
  if (!config) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }
  return config.bucketName;
}

export async function uploadToR2(data: ArrayBuffer): Promise<string> {
  const client = getR2Client();
  const bucket = getR2BucketName();
  const objectId = randomUUID();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectId,
      Body: new Uint8Array(data),
      ContentType: "application/octet-stream",
      Metadata: {
        app: "decent-cold-vaults",
        encrypted: "true",
      },
    })
  );

  return objectId;
}

export async function deleteFromR2(objectId: string): Promise<void> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectId,
    })
  );
}

export async function downloadFromR2(objectId: string): Promise<Uint8Array> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: objectId,
    })
  );

  if (!response.Body) {
    throw new Error("Object not found.");
  }

  return response.Body.transformToByteArray();
}
