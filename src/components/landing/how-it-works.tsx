"use client";

import { KeyRound, Lock, Upload, Wallet } from "lucide-react";
import { SectionHeading } from "./section-heading";

const steps = [
  {
    icon: Wallet,
    title: "Wallet login",
    description:
      "Enter your Solana address and send a tiny SOL transfer. No passwords, no browser extensions.",
    detail: "0.0001 SOL · ~3s poll",
  },
  {
    icon: KeyRound,
    title: "Create a Cold Vault",
    description:
      "Generate a 24-word Cold Key in your browser. It never leaves your device or our servers.",
    detail: "BIP39 seed · memory only",
  },
  {
    icon: Lock,
    title: "Encrypt every file",
    description:
      "Each upload gets a unique AES-256-GCM key derived from your Cold Key. Plaintext stays local.",
    detail: "PBKDF2 + HKDF · per file",
  },
  {
    icon: Upload,
    title: "Store on Cloudflare R2",
    description:
      "Only ciphertext is uploaded to Eternal Storage. Download and decrypt whenever you need it.",
    detail: "R2 · 10 MB free · 100 GB / 1 SOL yr",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-16 sm:py-24 landing-section">
      <SectionHeading
        eyebrow="How it works"
        title="Four steps. Zero trust."
        description="Decent never sees your files or your Cold Key. You authenticate with your wallet, encrypt locally, and we store opaque blobs."
      />

      <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div
          aria-hidden
          className="hidden lg:block absolute top-[2.75rem] left-[12%] right-[12%] h-px landing-flow-line"
        />

        {steps.map((step, i) => (
          <article
            key={step.title}
            className="relative rounded-3xl border border-border bg-white/80 p-5 sm:p-6 landing-step-card"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-white landing-step-icon">
                <step.icon className="h-5 w-5" strokeWidth={2} />
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-dark text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-brand-dark/80">
                Step {i + 1}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {step.description}
            </p>
            <p className="text-xs font-medium text-brand-dark/70 rounded-full bg-brand-light inline-block px-3 py-1">
              {step.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
