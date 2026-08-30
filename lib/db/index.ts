import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// Neon's HTTP driver issues each query as a stateless fetch instead of
// holding a persistent Postgres connection open. On Vercel's serverless
// functions, a pooled `pg.Pool` connection stays alive for as long as the
// function instance stays warm, which keeps Neon's compute from ever
// autosuspending - burning CU-hours around the clock even with light
// traffic. This driver lets the compute actually scale to zero between
// requests.
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
