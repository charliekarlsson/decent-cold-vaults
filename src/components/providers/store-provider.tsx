"use client";

import { useEffect } from "react";
import { useVaultStore } from "@/store/vault-store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useVaultStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
