import {isAdmin,authReady} from '@/lib/auth';import {json,safeFailure} from '@/lib/server';
export async function GET(req:Request){try{return json({authenticated:await isAdmin(req),configured:authReady()});}catch(e){return safeFailure(e);}}
