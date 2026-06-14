"use client";

import { Cloud, Globe, Server, Shield } from "lucide-react";
import { SectionHeading } from "./section-heading";

export function CloudStorageVisualSection() {
  return (
    <section className="relative py-16 sm:py-24 landing-section">
      <SectionHeading
        eyebrow="Eternal Storage"
        title="Encrypted blobs on Cloudflare R2"
        description="After local encryption, files are stored as opaque objects in Cloudflare R2 — durable, S3-compatible storage with no plaintext ever touching our servers."
      />

      <div className="rounded-[2rem] border border-border bg-white/70 overflow-hidden landing-fade-in">
        <div className="grid lg:grid-cols-5 gap-0">
          {/* Browser side */}
          <div className="lg:col-span-2 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-border bg-gradient-to-br from-brand-light/40 to-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark mb-4">
              Your browser
            </p>
            <div className="rounded-2xl border border-border bg-white p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-brand" />
                <div className="h-2 w-2 rounded-full bg-brand/40" />
                <div className="h-2 w-2 rounded-full bg-brand/40" />
                <span className="text-[10px] text-muted-foreground ml-auto">
                  decent.app
                </span>
              </div>
              <div className="rounded-xl bg-brand-light/50 p-3 text-center">
                <p className="font-mono text-[10px] text-brand-dark break-all">
                  enc:a3f9c2e1…8b4d91ff
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-brand shrink-0" />
                Session JWT after wallet login
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-brand shrink-0" />
                Ciphertext sent over HTTPS
              </li>
            </ul>
          </div>

          {/* Animated pipeline */}
          <div className="lg:col-span-1 relative flex items-center justify-center py-8 lg:py-0 bg-brand-light/20 min-h-[120px]">
            <svg
              className="absolute inset-0 w-full h-full landing-pipeline-svg"
              viewBox="0 0 120 200"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M60 20 L60 180"
                className="landing-pipeline-path"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </svg>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="landing-data-packet" />
              <span className="text-[10px] font-medium text-brand-dark uppercase tracking-wider">
                Upload
              </span>
            </div>
          </div>

          {/* Cloudflare R2 side */}
          <div className="lg:col-span-2 p-6 sm:p-8 bg-gradient-to-bl from-[#fff8f3] to-white">
            <div className="flex items-center gap-2 mb-4">
              <CloudflareMark />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#f6821d]">
                Cloudflare R2
              </p>
            </div>

            <div className="rounded-2xl border border-[#f6821d]/20 bg-white p-4 mb-4 landing-cloud-panel">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4eb]">
                  <Server className="h-5 w-5 text-[#f6821d]" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm">Object storage</p>
                  <p className="text-[10px] text-muted-foreground">
                    S3-compatible · encrypted at rest
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["obj-7f2a", "obj-9c1b", "obj-4e8d"].map((id, i) => (
                  <div
                    key={id}
                    className="rounded-lg border border-border bg-brand-light/30 px-2 py-2 text-center landing-storage-node"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    <Globe className="h-3 w-3 text-brand mx-auto mb-1" />
                    <p className="font-mono text-[8px] text-muted-foreground">{id}</p>
                  </div>
                ))}
              </div>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Cloud className="h-3.5 w-3.5 text-[#f6821d] shrink-0" />
                Durable global object storage
              </li>
              <li className="flex items-center gap-2">
                <Cloud className="h-3.5 w-3.5 text-[#f6821d] shrink-0" />
                We store blobs — not filenames or keys
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6 max-w-xl mx-auto">
        Download reverses the flow: fetch ciphertext from R2, decrypt locally with
        your Cold Key. Cloudflare never sees your plaintext.
      </p>
    </section>
  );
}

function CloudflareMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <path
        fill="#F6821D"
        d="M24.2 14.1c-.3-2.1-2-3.7-4.2-3.7h-.5c-.3-2.5-2.4-4.4-5-4.4-2.2 0-4.1 1.4-4.8 3.4-.2.6-.3 1.2-.3 1.9 0 .2 0 .4.1.6-2.5.3-4.4 2.4-4.4 5 0 2.8 2.2 5 5 5h13.5c2.5 0 4.5-2 4.5-4.5 0-2.1-1.5-3.9-3.5-4.3z"
      />
    </svg>
  );
}
