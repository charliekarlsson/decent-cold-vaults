CREATE TABLE IF NOT EXISTS wallet_plans (
  wallet_address TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  storage_used_bytes INTEGER NOT NULL DEFAULT 0,
  plan_expires_at TEXT,
  upgraded_at TEXT,
  last_payment_signature TEXT
);

CREATE TABLE IF NOT EXISTS storage_objects (
  object_id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (wallet_address) REFERENCES wallet_plans(wallet_address)
);

CREATE TABLE IF NOT EXISTS used_payment_signatures (
  signature TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_storage_objects_wallet ON storage_objects(wallet_address);
