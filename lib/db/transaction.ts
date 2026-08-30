import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import ws from "ws";

import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

type Tx = Parameters<Parameters<NeonDatabase<typeof schema>["transaction"]>[0]>[0];

/**
 * The default `db` export (./index.ts) uses Neon's HTTP driver, which is
 * stateless and can't run multi-statement transactions. For the rare call
 * site that needs a real transaction, this opens a short-lived pooled
 * connection just for the callback's duration and closes it immediately
 * after - so it doesn't sit around holding Neon's compute awake between
 * requests the way a long-lived pool would.
 */
export async function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  try {
    const txDb = drizzle(pool, { schema });
    return await txDb.transaction(fn);
  } finally {
    await pool.end();
  }
}
