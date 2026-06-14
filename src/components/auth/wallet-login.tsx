"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  Check,
  Loader2,
  Wallet,
  ArrowLeft,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  initiateLogin,
  waitForLoginPayment,
  LOGIN_AMOUNT_SOL,
  type LoginChallenge,
} from "@/lib/solana/wallet-login";
import { useVaultStore } from "@/store/vault-store";

type Step = "address" | "payment";

interface WalletLoginProps {
  onSuccess?: () => void;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input
          readOnly
          value={value}
          className="font-mono text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export function WalletLogin({ onSuccess }: WalletLoginProps) {
  const [step, setStep] = useState<Step>("address");
  const [walletAddress, setWalletAddress] = useState("");
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollActive = useRef(false);
  const setSession = useVaultStore((s) => s.setSession);

  const startListening = useCallback(
    async (activeChallenge: LoginChallenge) => {
      if (pollActive.current) return;
      pollActive.current = true;
      setListening(true);
      setError(null);

      try {
        const result = await waitForLoginPayment(activeChallenge.challengeToken, {
          intervalMs: 3000,
          timeoutMs: Math.max(
            0,
            new Date(activeChallenge.expiresAt).getTime() - Date.now()
          ),
          shouldContinue: () => pollActive.current,
        });

        if (!result.token || !result.walletAddress) {
          throw new Error("Login verification failed.");
        }

        setSession({
          address: result.walletAddress,
          token: result.token,
          expiresAt: result.expiresAt ?? activeChallenge.expiresAt,
          verifiedAt: new Date().toISOString(),
        });

        onSuccess?.();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Login failed. Try again."
        );
        setListening(false);
        pollActive.current = false;
      }
    },
    [onSuccess, setSession]
  );

  useEffect(() => {
    return () => {
      pollActive.current = false;
    };
  }, []);

  async function handleStartLogin() {
    setLoading(true);
    setError(null);

    try {
      const nextChallenge = await initiateLogin(walletAddress.trim());
      setChallenge(nextChallenge);
      setStep("payment");
      setLoading(false);
      startListening(nextChallenge);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start login."
      );
      setLoading(false);
    }
  }

  function handleBack() {
    pollActive.current = false;
    setListening(false);
    setChallenge(null);
    setStep("address");
    setError(null);
  }

  return (
    <Card className="w-full card-soft rounded-3xl border-brand/20 border-2">
      <CardHeader className="text-center pb-2">
        <CardTitle className="font-display text-2xl">Secure Wallet Login</CardTitle>
        <CardDescription>
          {step === "address"
            ? "Enter your wallet address, then send a micro-payment."
            : `Send exactly ${LOGIN_AMOUNT_SOL} SOL from your wallet.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === "address" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet address</Label>
              <Input
                id="wallet-address"
                placeholder="Your Solana address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <Button
              onClick={handleStartLogin}
              disabled={loading || !walletAddress.trim()}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Wallet />
                  Secure Wallet Login
                </>
              )}
            </Button>
          </>
        )}

        {step === "payment" && challenge && (
          <>
            <CopyField label="Send from" value={challenge.walletAddress} />
            <CopyField label="Send to" value={challenge.recipientAddress} />
            <CopyField
              label="Amount (SOL)"
              value={String(challenge.amountSol)}
            />

            <div className="rounded-2xl border border-brand/20 bg-brand-light/40 p-3 flex items-center gap-3">
              {listening ? (
                <>
                  <Radio className="h-4 w-4 text-brand animate-pulse shrink-0" />
                  <p className="text-sm text-brand-dark">
                    Listening for your payment...
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Payment window expired or stopped.
                </p>
              )}
            </div>

            {!listening && (
              <Button
                onClick={() => startListening(challenge)}
                variant="outline"
                className="w-full"
              >
                Listen again
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={handleBack}
              className="w-full"
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Use a different address
            </Button>
          </>
        )}

        {error && (
          <div className="rounded-2xl border border-danger-border bg-danger-bg p-3 text-sm text-danger-text">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
