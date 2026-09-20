import {sessionCookie} from '@/lib/auth';import {json,sameOrigin} from '@/lib/server';
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'Invalid request origin.'},403);const r=json({ok:true});r.headers.set('Set-Cookie',sessionCookie(req,'',true));return r;}
