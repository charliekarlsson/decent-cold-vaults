"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  KeyRound,
  Cloud,
  ShieldCheck,
  Wallet,
  Timer,
} from "lucide-react";
import { DecentLogo } from "@/components/brand/decent-logo";
import { WalletLogin } from "@/components/auth/wallet-login";
import { CloudStorageVisualSection } from "@/components/landing/cloud-storage-visual";
import { EncryptionVisualSection } from "@/components/landing/encryption-visual";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { useVaultStore } from "@/store/vault-store";

const uniqueFeatures = [
  {
    icon: Wallet,
    title: "Secure Wallet Login",
    description: "Sign in with a SOL micro-transaction. No passwords. No approvals.",
  },
  {
    icon: KeyRound,
    title: "Cold Storage Encryption",
    description: "24-word Cold Key in your browser. Files encrypted before upload.",
  },
];

const supportingFeatures = [
  {
    icon: Cloud,
    title: "Eternal Storage",
    description: "Permanent encrypted storage on Cloudflare R2. Upload once.",
  },
  {
    icon: ShieldCheck,
    title: "Zero knowledge",
    description: "We can't read your files. Ever.",
  },
  {
    icon: Lock,
    title: "Encrypt first",
    description: "Ciphertext only leaves your device.",
  },
  {
    icon: Timer,
    title: "Session keys",
    description: "Close the tab, vaults lock.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const session = useVaultStore((s) => s.session);

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 blob bg-brand-soft/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-16 h-48 w-48 blob bg-peach/70"
      />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-12 sm:pt-20 pb-8 sm:pb-12 landing-section">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-light border border-border px-4 py-1.5 text-xs font-medium text-brand-dark mb-6">
              Secure Wallet Login · Cold Storage Encryption · Cloudflare R2
            </p>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] tracking-tight text-foreground mb-4">
              <span className="block">
                <span className="text-brand">decent</span>
                <span>ralized</span>
              </span>
              <span className="block">private cloud storage.</span>
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed max-w-md mb-6">
              Wallet login. Client-side encryption. Encrypted blobs stored on
              Cloudflare R2. Your Cold Key never leaves your browser.
            </p>
          </div>

          <div className="flex flex-col items-center lg:items-end animate-fade-up">
            <DecentLogo size={160} className="mb-8 lg:mb-0 sm:scale-110" />
            <div className="w-full max-w-md mt-8 lg:mt-10">
              <WalletLogin onSuccess={() => router.push("/dashboard")} />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <HowItWorksSection />
      </div>

      {/* Encryption */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 border-t border-border/60">
        <EncryptionVisualSection />
      </div>

      {/* Cloudflare R2 */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 border-t border-border/60">
        <CloudStorageVisualSection />
      </div>

      {/* Features */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-20 border-t border-border/60 landing-section">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-center mb-6">
          What makes us different
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {uniqueFeatures.map((feature, i) => (
            <div
              key={feature.title}
              className="rounded-3xl border-2 border-brand/25 bg-gradient-to-br from-white to-brand-light/40 p-6 shadow-md shadow-brand/5 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white mb-3">
                <feature.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="font-display text-lg font-bold mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {supportingFeatures.map((feature, i) => (
            <div
              key={feature.title}
              className="card-soft rounded-2xl p-4 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <feature.icon className="h-4 w-4 text-brand mb-2" strokeWidth={2} />
              <h3 className="font-display font-semibold text-sm mb-0.5">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 bg-white/50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DecentLogo size={24} />
            <span className="font-display font-medium text-sm">decent cold vaults</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Wallet login. Cold Key encryption. Cloudflare R2 storage. Lost keys
            can&apos;t be recovered.
          </p>
        </div>
      </footer>
    </div>
  );
}
