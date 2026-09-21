// Production builds apply the versioned schema before accepting traffic.
// Preview builds must never migrate the production database.
if (process.env.VERCEL_ENV === 'production') {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error('Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to Vercel Production before deploying.');
  }
  const {createClient}=await import('@libsql/client');
  const {migrate}=await import('./migrate-vercel.mjs');
  const client=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
  try {await migrate(client); console.log('Vandlovu production database schema is ready.');}
  finally {client.close();}
}
