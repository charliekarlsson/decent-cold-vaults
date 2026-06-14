export const FREE_STORAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const PRO_STORAGE_BYTES = 100 * 1024 * 1024 * 1024; // 100 GB
export const PRO_PRICE_SOL = 1;
export const PRO_DURATION_SECONDS = 365 * 24 * 60 * 60;
export const UPGRADE_CHALLENGE_TTL_SECONDS = 30 * 60;

/** Max single upload on free tier */
export const FREE_MAX_FILE_BYTES = 10 * 1024 * 1024;
/** Max single upload on pro tier */
export const PRO_MAX_FILE_BYTES = 500 * 1024 * 1024;

export const PRO_PRICE_LAMPORTS = Math.round(PRO_PRICE_SOL * 1e9);
export const PRO_AMOUNT_TOLERANCE_LAMPORTS = Math.round(PRO_PRICE_LAMPORTS * 0.01);
