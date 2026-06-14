"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LayoutGrid } from "lucide-react";
import { DecentLogo } from "@/components/brand/decent-logo";
import { Button } from "@/components/ui/button";
import { useVaultStore } from "@/store/vault-store";

/** Replace with pump.fun URL when live. */
const DCNT_TOKEN_URL = "#";

const socialLinkClass =
  "inline-flex items-center text-brand-dark hover:text-brand transition-colors";

export function Header() {
  const router = useRouter();
  const session = useVaultStore((s) => s.session);
  const clearSession = useVaultStore((s) => s.clearSession);

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  const truncatedAddress = session?.address
    ? `${session.address.slice(0, 4)}...${session.address.slice(-4)}`
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-[#fffaf8]/95 supports-[backdrop-filter]:bg-[#fffaf8]/90">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href={session ? "/dashboard" : "/"}
          className="flex items-center gap-3 group"
        >
          <DecentLogo size={48} className="transition-transform group-hover:scale-105" />
          <div className="leading-tight">
            <span className="font-display font-semibold text-[22px] text-foreground">
              decent
            </span>
            <span className="hidden sm:block text-[14px] text-muted-foreground tracking-wide">
              <span className="text-brand">decent</span>ralized storage
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <div className="flex items-center gap-4">
            <a
              href={DCNT_TOKEN_URL}
              className={`${socialLinkClass} text-[15px] font-semibold tracking-wide`}
              aria-label="$DCNT token (pump.fun link coming soon)"
            >
              $DCNT
            </a>
            <a
              href="https://x.com/DecentClouds"
              target="_blank"
              rel="noopener noreferrer"
              className={socialLinkClass}
              aria-label="Decent on X"
            >
              <XIcon />
            </a>
          </div>

          {session && (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="h-11 px-5 text-sm [&_svg]:size-5">
                  <LayoutGrid className="h-5 w-5" />
                  <span className="hidden sm:inline">Vaults</span>
                </Button>
              </Link>
              <span className="hidden sm:inline text-sm text-muted-foreground bg-brand-light px-4 py-2 rounded-full border border-border">
                {truncatedAddress}
              </span>
              <Button variant="outline" className="h-11 px-5 text-sm [&_svg]:size-5" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
