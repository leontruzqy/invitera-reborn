import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { fileURLToPath } from 'node:url';
import * as schema from './schema';

function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv) return fromEnv;
  // Default: SQLite file at packages/db/dev.db, independent of process cwd.
  return `file:${fileURLToPath(new URL('../dev.db', import.meta.url))}`;
}

export const client = createClient({
  url: resolveDatabaseUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
