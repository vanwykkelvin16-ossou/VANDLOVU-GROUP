import {runtime,runtimeKind} from 'booking-platform';
export {runtime};
export function db():D1Database {const d=runtime().DB;if(!d)throw Error('Database unavailable');return d;}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export async function body(req:Request){const text=await req.text();if(text.length>14000)throw Error('Request too large');return JSON.parse(text);}
export function sameOrigin(req:Request){
 const origin=req.headers.get('origin');if(!origin)return false;
 try{const supplied=new URL(origin),url=new URL(req.url);const host=runtimeKind==='cloudflare'?url.host:(req.headers.get('host')||url.host);const protocol=process.env.VERCEL?'https:':url.protocol;return supplied.host===host&&supplied.protocol===protocol;}catch{return false;}
}
export async function getSettings(){return await db().prepare('SELECT mode,anchor FROM settings WHERE id=1').first<{mode:'unconfigured'|'mwf'|'alternating';anchor:string}>()??{mode:'unconfigured' as const,anchor:''};}
const enc=new TextEncoder();
export async function rateLimit(req:Request,scope:string,limit:number,seconds:number){const now=Math.floor(Date.now()/1000),bucket=Math.floor(now/seconds);const ip=process.env.VERCEL ? (req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||'unknown') : (req.headers.get('cf-connecting-ip')||'unknown');const digest=await crypto.subtle.digest('SHA-256',enc.encode(scope+':'+ip));const key=scope+':'+bucket+':'+Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');const row=await db().prepare('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,(bucket+1)*seconds).first<{count:number}>();await db().prepare('DELETE FROM rate_limits WHERE expires < ?').bind(now-86400).run();return (row?.count??limit+1)<=limit;}
export function safeFailure(error:unknown){console.error('Booking operation failed',error instanceof Error?error.message:'unknown');return json({error:'We couldn’t complete that request. Please try again.'},503);}
