"use client";

import { AlertTriangle, Copy, Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { seedPhraseToWords } from "@/lib/crypto/seed-phrase";

interface SeedPhraseDisplayProps {
  seedPhrase: string;
  onConfirmed: () => void;
}

export function SeedPhraseDisplay({
  seedPhrase,
  onConfirmed,
}: SeedPhraseDisplayProps) {
  const words = seedPhraseToWords(seedPhrase);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [confirmations, setConfirmations] = useState([false, false, false]);

  const allConfirmed = confirmations.every(Boolean);

  async function handleCopy() {
    await navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleConfirmation(index: number) {
    setConfirmations((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-display text-base font-bold text-red-700">
              Shown once — we can&apos;t recover it
            </h3>
            <ul className="text-sm text-red-800/80 space-y-1 list-disc list-inside">
              <li>Write on paper or metal</li>
              <li>Never store digitally</li>
              <li>Never share it</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <Label className="font-display text-brand-dark text-base">
            Your 24-word Cold Key
          </Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {revealed ? "Hide" : "Reveal"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4 rounded-2xl border border-border bg-brand-light/30 font-mono text-sm ${
            !revealed ? "blur-md select-none pointer-events-none" : ""
          }`}
        >
          {words.map((word, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-border/80"
            >
              <span className="text-muted-foreground text-xs w-5">
                {i + 1}.
              </span>
              <span className="text-brand-dark font-medium">{word}</span>
            </div>
          ))}
        </div>

        {!revealed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevealed(true)}
              className="rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
            >
              <Eye className="h-4 w-4" />
              Tap to reveal Cold Key
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 space-y-4">
        <p className="text-sm font-semibold text-red-800">
          Confirm (all three):
        </p>

        {[
          "Written down on paper or metal",
          "I know it won't be shown again",
          "I accept full responsibility",
        ].map((text, index) => (
          <div key={index} className="flex items-start gap-3">
            <Checkbox
              id={`confirm-${index}`}
              checked={confirmations[index]}
              onCheckedChange={() => toggleConfirmation(index)}
              className="mt-0.5"
            />
            <Label
              htmlFor={`confirm-${index}`}
              className="text-sm leading-relaxed cursor-pointer text-red-900/80"
            >
              {text}
            </Label>
          </div>
        ))}
      </div>

      <Button
        onClick={onConfirmed}
        disabled={!allConfirmed || !revealed}
        size="lg"
        className="w-full"
      >
        I&apos;ve secured my Cold Key
      </Button>
    </div>
  );
}
