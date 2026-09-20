import { createClient } from '@libsql/client';
import { createDatabaseAdapter } from './sql-adapter';
let database: D1Database | undefined;
// Vercel/Node runtime. Sites resolves this module to platform-cloudflare.ts.
export function runtime(): Record<string, any> {
  return { ...process.env, get DB() {
    if (!process.env.TURSO_DATABASE_URL) throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before accepting bookings.');
    if (process.env.VERCEL && !/^(libsql|https):\/\//.test(process.env.TURSO_DATABASE_URL)) throw new Error('Vercel requires a persistent remote database.');
    return database ??= createDatabaseAdapter(createClient({url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN}));
  }};
}

export const runtimeKind: string = 'node';
