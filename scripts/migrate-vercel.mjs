import { createClient } from '@libsql/client';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
export async function migrate(client) {
  await client.execute('CREATE TABLE IF NOT EXISTS _vandlovu_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL)');
  const folder=new URL('../drizzle/',import.meta.url);
  for(const name of (await readdir(folder)).filter(n=>n.endsWith('.sql')).sort()) {
    const source=await readFile(new URL(name,folder),'utf8');
    const checksum=createHash('sha256').update(source).digest('hex');
    const applied=await client.execute({sql:'SELECT checksum FROM _vandlovu_migrations WHERE name=?',args:[name]});
    if(applied.rows.length) {if(applied.rows[0].checksum!==checksum)throw Error(`Applied migration changed: ${name}`);continue;}
    const statements=source.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean);
    await client.batch([...statements,{sql:'INSERT INTO _vandlovu_migrations(name,checksum,applied_at) VALUES(?,?,?)',args:[name,checksum,new Date().toISOString()]}],'write');
    console.log(`Applied ${name}`);
  }
}
if(process.argv[1] && import.meta.url === new URL('file:'+process.argv[1]).href){
  if(!process.env.TURSO_DATABASE_URL)throw Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.');
  const client=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
  try{await migrate(client);console.log('Database schema is ready. Configure testing dates in Admin → Settings.');}finally{client.close();}
}
