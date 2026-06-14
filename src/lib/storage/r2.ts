import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

type R2Bucket = {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | string | ReadableStream | Blob | null,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    }
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
};

type R2ObjectBody = {
  arrayBuffer(): Promise<ArrayBuffer>;
};

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

async function getNativeR2Bucket(): Promise<R2Bucket | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as { R2_BUCKET?: R2Bucket }).R2_BUCKET ?? null;
  } catch {
    return null;
  }
}

export async function isR2Configured(): Promise<boolean> {
  if (await getNativeR2Bucket()) return true;
  return getR2Config() !== null;
}

function getS3Client(): S3Client {
  const config = getR2Config();
  if (!config) {
    throw new Error(
      "Storage not configured. Bind R2_BUCKET in Wrangler or set R2_* environment variables."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

function getS3BucketName(): string {
  const config = getR2Config();
  if (!config) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }
  return config.bucketName;
}

export async function uploadToR2(data: ArrayBuffer): Promise<string> {
  const objectId = crypto.randomUUID();
  const body = new Uint8Array(data);

  const bucket = await getNativeR2Bucket();
  if (bucket) {
    await bucket.put(objectId, body, {
      httpMetadata: { contentType: "application/octet-stream" },
      customMetadata: {
        app: "decent-cold-vaults",
        encrypted: "true",
      },
    });
    return objectId;
  }

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getS3BucketName(),
      Key: objectId,
      Body: body,
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
  const bucket = await getNativeR2Bucket();
  if (bucket) {
    await bucket.delete(objectId);
    return;
  }

  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getS3BucketName(),
      Key: objectId,
    })
  );
}

export async function downloadFromR2(objectId: string): Promise<Uint8Array> {
  const bucket = await getNativeR2Bucket();
  if (bucket) {
    const object = await bucket.get(objectId);
    if (!object) {
      throw new Error("Object not found.");
    }
    return new Uint8Array(await object.arrayBuffer());
  }

  const client = getS3Client();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: getS3BucketName(),
      Key: objectId,
    })
  );

  if (!response.Body) {
    throw new Error("Object not found.");
  }

  return response.Body.transformToByteArray();
}
