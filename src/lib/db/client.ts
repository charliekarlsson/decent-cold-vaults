type D1Database = {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
  };
  batch(statements: unknown[]): Promise<unknown>;
};

async function getD1(): Promise<D1Database> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as { DB?: D1Database }).DB;
  if (!db) {
    throw new Error(
      "D1 database binding (DB) is not available. Run with Wrangler or initOpenNextCloudflareForDev()."
    );
  }
  return db;
}

export async function dbFirst<T>(
  sql: string,
  ...params: unknown[]
): Promise<T | undefined> {
  const d1 = await getD1();
  const row = await d1.prepare(sql).bind(...params).first<T>();
  return row ?? undefined;
}

export async function dbRun(sql: string, ...params: unknown[]): Promise<void> {
  const d1 = await getD1();
  await d1.prepare(sql).bind(...params).run();
}

export async function dbTransaction(
  ops: Array<{ sql: string; params: unknown[] }>
): Promise<void> {
  const d1 = await getD1();
  await d1.batch(
    ops.map(({ sql, params }) => d1.prepare(sql).bind(...params))
  );
}
