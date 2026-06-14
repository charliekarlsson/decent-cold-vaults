# Decent Cold Vaults

Extremely private, client-side encrypted, permanent decentralized cloud storage.

## Features

- **Secure Wallet Login** — Micro-transaction SOL proof-of-ownership (no token approvals)
- **Cold Key System** — 24-word BIP39 seed generated entirely client-side, shown once
- **AES-256-GCM Encryption** — All files encrypted in-browser via Web Crypto API
- **Decent Eternal Storage** — Permanent storage powered by Arweave (hidden from UI)
- **Session-Only Keys** — Decryption keys live in memory; gone when tab closes

## Tech Stack

- Next.js 15+ (App Router) + TypeScript + Tailwind CSS
- shadcn/ui components + lucide-react icons
- Zustand for state management
- @solana/web3.js for wallet authentication
- arweave-js for permanent storage uploads
- @scure/bip39 for seed phrase generation

## Getting Started

```bash
npm install
cp .env.example .env.local
# Configure your Solana login address and Arweave wallet JWK
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint |
| `NEXT_PUBLIC_LOGIN_RECIPIENT_ADDRESS` | Wallet address for login micro-transactions |
| `ARWEAVE_WALLET_JWK` | Funded Arweave wallet JSON key for uploads |
| `NEXT_PUBLIC_ARWEAVE_GATEWAY` | Gateway for file downloads |

## Security Model

1. **Cold Keys** are generated with `crypto.getRandomValues` via @scure/bip39 — never sent to any server
2. **Master keys** are derived via PBKDF2 (600k iterations) from the seed phrase
3. **File keys** are derived per-file via HKDF from the master key
4. **Encryption** uses AES-256-GCM with random 12-byte IVs
5. **Only encrypted ciphertext** is uploaded to eternal storage
6. **Vault metadata** (names, file manifests) is stored in localStorage — no keys
7. **Session keys** are held in Zustand memory only

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── page.tsx            # Landing + wallet login
│   ├── dashboard/          # Vault dashboard
│   ├── vault/[id]/         # Individual vault view
│   └── api/
│       ├── auth/verify/    # SOL transaction verification
│       └── storage/upload/ # Encrypted blob upload to Arweave
├── components/
│   ├── auth/               # Wallet login
│   ├── vault/              # Vault creation, upload, file list
│   ├── layout/             # Header, navigation
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── crypto/             # AES, seed phrase, key derivation
│   ├── solana/             # Wallet micro-transaction login
│   └── arweave/            # Eternal storage client helpers
├── store/                  # Zustand vault store
└── types/                  # TypeScript interfaces
```

## License

Private — All rights reserved.
