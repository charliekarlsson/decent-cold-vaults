import { LOGIN_AMOUNT_SOL } from "@/lib/solana/config";

export { LOGIN_AMOUNT_SOL };

export interface LoginChallenge {
  challengeToken: string;
  walletAddress: string;
  recipientAddress: string;
  amountSol: number;
  expiresAt: string;
  issuedAt: number;
}

export interface LoginInitiateResponse extends LoginChallenge {}

export interface LoginPollResponse {
  status: "pending" | "verified";
  token?: string;
  walletAddress?: string;
  expiresAt?: string;
  signature?: string;
  error?: string;
}

export async function initiateLogin(
  walletAddress: string
): Promise<LoginInitiateResponse> {
  const response = await fetch("/api/auth/login/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to start login.");
  }

  return data as LoginInitiateResponse;
}

export async function pollLogin(
  challengeToken: string
): Promise<LoginPollResponse> {
  const response = await fetch("/api/auth/login/poll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeToken }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Login check failed.");
  }

  return data as LoginPollResponse;
}

export async function verifySession(token: string): Promise<boolean> {
  const response = await fetch("/api/auth/session", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return false;
  const data = await response.json();
  return data.valid === true;
}

/** Poll until payment is detected or timeout. */
export async function waitForLoginPayment(
  challengeToken: string,
  options?: {
    intervalMs?: number;
    timeoutMs?: number;
    shouldContinue?: () => boolean;
  }
): Promise<LoginPollResponse> {
  const intervalMs = options?.intervalMs ?? 3000;
  const timeoutMs = options?.timeoutMs ?? 10 * 60 * 1000;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    if (options?.shouldContinue && !options.shouldContinue()) {
      throw new Error("Login cancelled.");
    }

    const result = await pollLogin(challengeToken);

    if (result.status === "verified" && result.token) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Login timed out. Send the payment and try again.");
}
