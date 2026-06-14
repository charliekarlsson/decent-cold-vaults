"use client";

import { FileText, KeyRound, ShieldCheck } from "lucide-react";
import { SectionHeading } from "./section-heading";

const ciphertextBlocks = [
  "a3f9…c2e1",
  "8b4d…91ff",
  "e7c0…4a2b",
  "1d6e…f803",
  "5c2a…b719",
  "9f01…d4e6",
];

export function EncryptionVisualSection() {
  return (
    <section className="relative py-16 sm:py-24 landing-section">
      <SectionHeading
        eyebrow="Cold storage encryption"
        title="Your files never leave as plaintext"
        description="Encryption runs entirely in your browser before upload. We only ever handle scrambled ciphertext — even we can't open your vault."
      />

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="space-y-5 order-2 lg:order-1">
          <div className="rounded-2xl border border-border bg-white/80 p-5 landing-fade-in">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display font-semibold mb-1">Cold Key in memory</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A 24-word seed generates your vault master key via PBKDF2 (600k
                  iterations). Close the tab and it&apos;s gone.
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl border border-border bg-white/80 p-5 landing-fade-in"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display font-semibold mb-1">AES-256-GCM per file</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every file gets its own key via HKDF. A random IV is stored
                  alongside metadata — never the raw key.
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl border border-border bg-white/80 p-5 landing-fade-in"
            style={{ animationDelay: "240ms" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark mb-2">
              Zero knowledge
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lost Cold Key = lost files. That&apos;s the tradeoff for true privacy.
              We don&apos;t hold a backup copy.
            </p>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="rounded-[2rem] border border-brand/20 bg-gradient-to-br from-white via-brand-light/30 to-peach/40 p-6 sm:p-8 landing-encrypt-panel">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-center">
              {/* Plaintext file */}
              <div className="rounded-2xl border border-border bg-white p-4 landing-float-slow">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-brand" />
                  <span className="text-xs font-medium text-foreground">
                    photo.jpg
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-brand/20 w-full landing-plain-line" />
                  <div className="h-2 rounded-full bg-brand/15 w-4/5 landing-plain-line" style={{ animationDelay: "0.2s" }} />
                  <div className="h-2 rounded-full bg-brand/10 w-3/5 landing-plain-line" style={{ animationDelay: "0.4s" }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">Readable</p>
              </div>

              {/* Lock / transform */}
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white landing-lock-pulse">
                  <LockIcon />
                </div>
                <div className="hidden sm:block w-8 h-px bg-brand/30 landing-dash-flow" />
              </div>

              {/* Ciphertext */}
              <div className="rounded-2xl border border-brand/30 bg-brand-dark/5 p-4 landing-float-slow" style={{ animationDelay: "1s" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark mb-3">
                  Ciphertext
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ciphertextBlocks.map((block, i) => (
                    <span
                      key={block}
                      className="font-mono text-[9px] sm:text-[10px] text-brand-dark/80 bg-white/80 rounded-md px-1.5 py-1 landing-cipher-block"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      {block}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">Opaque blob</p>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Encrypt locally → upload ciphertext only
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
