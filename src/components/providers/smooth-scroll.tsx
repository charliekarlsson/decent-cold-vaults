"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Lenis fights native touch scrolling — use it on desktop pointer devices only. */
function shouldUseLenis(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return false;
  return true;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;

    const markScrolling = () => {
      root.dataset.scrolling = "true";
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        delete root.dataset.scrolling;
      }, 100);
    };

    if (!shouldUseLenis()) {
      // Native scroll on touch / reduced-motion — still pause decorative anims while scrolling
      const onNativeScroll = () => markScrolling();
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onNativeScroll);
        clearTimeout(scrollEndTimer);
        delete root.dataset.scrolling;
      };
    }

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      anchors: true,
    });

    lenisRef.current = lenis;
    lenis.on("scroll", markScrolling);

    return () => {
      clearTimeout(scrollEndTimer);
      delete root.dataset.scrolling;
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return children;
}
