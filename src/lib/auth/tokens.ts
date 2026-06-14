import { SignJWT, jwtVerify } from "jose";
import {
  CHALLENGE_TTL_SECONDS,
  SESSION_TTL_SECONDS,
} from "@/lib/solana/config";
import { UPGRADE_CHALLENGE_TTL_SECONDS } from "@/lib/billing/config";

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set (min 32 characters).");
  }
  return new TextEncoder().encode(secret);
}

export interface LoginChallengePayload {
  walletAddress: string;
  issuedAt: number;
}

export interface SessionPayload {
  walletAddress: string;
}

export async function createLoginChallenge(
  walletAddress: string
): Promise<{ challengeToken: string; expiresAt: string; issuedAt: number }> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = new Date((issuedAt + CHALLENGE_TTL_SECONDS) * 1000).toISOString();

  const challengeToken = await new SignJWT({
    type: "login_challenge",
    walletAddress,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(walletAddress)
    .setIssuedAt(issuedAt)
    .setExpirationTime(`${CHALLENGE_TTL_SECONDS}s`)
    .sign(getAuthSecret());

  return { challengeToken, expiresAt, issuedAt };
}

export async function verifyLoginChallenge(
  challengeToken: string
): Promise<LoginChallengePayload> {
  const { payload } = await jwtVerify(challengeToken, getAuthSecret());

  if (payload.type !== "login_challenge" || typeof payload.sub !== "string") {
    throw new Error("Invalid challenge token.");
  }

  return {
    walletAddress: payload.sub,
    issuedAt: payload.iat ?? Math.floor(Date.now() / 1000),
  };
}

export async function createSessionToken(
  walletAddress: string
): Promise<{ token: string; expiresAt: string }> {
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_SECONDS * 1000
  ).toISOString();

  const token = await new SignJWT({
    type: "session",
    walletAddress,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(walletAddress)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getAuthSecret());

  return { token, expiresAt };
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getAuthSecret());

  if (payload.type !== "session" || typeof payload.sub !== "string") {
    throw new Error("Invalid session token.");
  }

  return { walletAddress: payload.sub };
}

export async function createUpgradeChallenge(
  walletAddress: string
): Promise<{ challengeToken: string; expiresAt: string; issuedAt: number }> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = new Date(
    (issuedAt + UPGRADE_CHALLENGE_TTL_SECONDS) * 1000
  ).toISOString();

  const challengeToken = await new SignJWT({
    type: "plan_upgrade",
    walletAddress,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(walletAddress)
    .setIssuedAt(issuedAt)
    .setExpirationTime(`${UPGRADE_CHALLENGE_TTL_SECONDS}s`)
    .sign(getAuthSecret());

  return { challengeToken, expiresAt, issuedAt };
}

export async function verifyUpgradeChallenge(
  challengeToken: string
): Promise<LoginChallengePayload> {
  const { payload } = await jwtVerify(challengeToken, getAuthSecret());

  if (payload.type !== "plan_upgrade" || typeof payload.sub !== "string") {
    throw new Error("Invalid upgrade challenge.");
  }

  return {
    walletAddress: payload.sub,
    issuedAt: payload.iat ?? Math.floor(Date.now() / 1000),
  };
}
