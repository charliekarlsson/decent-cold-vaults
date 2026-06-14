"use client";

import { create } from "zustand";
import type { ColdVault, SessionWallet, UploadProgress } from "@/types";
import { verifySession } from "@/lib/solana/wallet-login";

const VAULTS_STORAGE_KEY = "decent-cold-vaults";
const SESSION_STORAGE_KEY = "decent-session-wallet";

interface VaultState {
  /** Master keys live only in memory — never persisted. */
  unlockedKeys: Map<string, CryptoKey>;
  vaults: ColdVault[];
  session: SessionWallet | null;
  uploadProgress: UploadProgress[];

  hydrate: () => void;
  setSession: (session: SessionWallet) => void;
  clearSession: () => void;

  addVault: (vault: ColdVault) => void;
  updateVault: (vaultId: string, updates: Partial<ColdVault>) => void;
  removeVault: (vaultId: string) => void;

  unlockVault: (vaultId: string, masterKey: CryptoKey) => void;
  lockVault: (vaultId: string) => void;
  lockAllVaults: () => void;
  isVaultUnlocked: (vaultId: string) => boolean;
  getMasterKey: (vaultId: string) => CryptoKey | undefined;

  setUploadProgress: (progress: UploadProgress[]) => void;
  updateFileProgress: (
    fileId: string,
    updates: Partial<UploadProgress>
  ) => void;
}

function loadVaults(): ColdVault[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VAULTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ColdVault[]) : [];
  } catch {
    return [];
  }
}

function saveVaults(vaults: ColdVault[]) {
  localStorage.setItem(VAULTS_STORAGE_KEY, JSON.stringify(vaults));
}

function loadSession(): SessionWallet | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionWallet) : null;
  } catch {
    return null;
  }
}

export const useVaultStore = create<VaultState>((set, get) => ({
  unlockedKeys: new Map(),
  vaults: [],
  session: null,
  uploadProgress: [],

  hydrate: () => {
    const session = loadSession();
    set({
      vaults: loadVaults(),
      session,
    });

    if (session?.token) {
      verifySession(session.token).then((valid) => {
        if (!valid) get().clearSession();
      });
    }
  },

  setSession: (session) => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    set({ session });
  },

  clearSession: () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    get().lockAllVaults();
    set({ session: null });
  },

  addVault: (vault) => {
    const vaults = [...get().vaults, vault];
    saveVaults(vaults);
    set({ vaults });
  },

  updateVault: (vaultId, updates) => {
    const vaults = get().vaults.map((v) =>
      v.id === vaultId ? { ...v, ...updates } : v
    );
    saveVaults(vaults);
    set({ vaults });
  },

  removeVault: (vaultId) => {
    const vaults = get().vaults.filter((v) => v.id !== vaultId);
    saveVaults(vaults);
    get().lockVault(vaultId);
    set({ vaults });
  },

  unlockVault: (vaultId, masterKey) => {
    const keys = new Map(get().unlockedKeys);
    keys.set(vaultId, masterKey);
    set({ unlockedKeys: keys });
  },

  lockVault: (vaultId) => {
    const keys = new Map(get().unlockedKeys);
    keys.delete(vaultId);
    set({ unlockedKeys: keys });
  },

  lockAllVaults: () => {
    set({ unlockedKeys: new Map() });
  },

  isVaultUnlocked: (vaultId) => get().unlockedKeys.has(vaultId),

  getMasterKey: (vaultId) => get().unlockedKeys.get(vaultId),

  setUploadProgress: (uploadProgress) => set({ uploadProgress }),

  updateFileProgress: (fileId, updates) => {
    set({
      uploadProgress: get().uploadProgress.map((p) =>
        p.fileId === fileId ? { ...p, ...updates } : p
      ),
    });
  },
}));
