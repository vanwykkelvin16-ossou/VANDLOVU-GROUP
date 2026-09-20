import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {randomBytes,pbkdf2Sync,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {createClient} from '@libsql/client';
import {migrate} from '../scripts/migrate-vercel.mjs';
const directory=mkdtempSync(join(tmpdir(),'vandlovu-qa-'));
const url='file:'+join(directory,'test.db');
const client=createClient({url});
await migrate(client);await migrate(client);
const password=randomBytes(24).toString('hex'),salt=randomBytes(16).toString('hex'),hash=pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3198'],{cwd:resolve('.'),env:{...process.env,TURSO_DATABASE_URL:url,TURSO_AUTH_TOKEN:'',ADMIN_EMAIL:'qa@example.test',ADMIN_PASSWORD_HASH:`pbkdf2:100000:${salt}:${hash}`,SESSION_SECRET:randomBytes(32).toString('hex'),GMAIL_CLIENT_ID:'',GMAIL_CLIENT_SECRET:'',GMAIL_REFRESH_TOKEN:'',GMAIL_SENDER:''},stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',d=>{logs+=d;process.stdout.write(d);});server.stderr.on('data',d=>{logs+=d;process.stderr.write(d);});
let cookie='';const base='http://127.0.0.1:3198';
async function call(path,method='GET',data,auth=false,origin=base){const headers={Origin:origin,'Content-Type':'application/json'};if(auth)headers.Cookie=cookie;const response=await fetch(base+path,{method,headers,body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(15000)});const text=await response.text();let result;try{result=JSON.parse(text);}catch{throw Error(`Non-JSON response: ${response.status} ${text.slice(0,400)}`);}return {status:response.status,data:result,headers:response.headers};}
try{
 for(let i=0;i<100;i++){try{const r=await fetch(base+'/privacy',{signal:AbortSignal.timeout(1000)});if(r.ok)break;}catch{}if(i===99)throw Error(logs);await new Promise(r=>setTimeout(r,100));}
 for(const [path,title] of [['/','Book a test'],['/privacy','Privacy Policy'],['/terms','Terms of Service']]){const r=await fetch(base+path,{signal:AbortSignal.timeout(15000)});assert.equal(r.status,200);const html=await r.text();assert.ok(html.includes(title));assert.ok(html.includes('href=\"/privacy\"'));assert.ok(html.includes('href=\"/terms\"'));}

 let r=await call('/api/admin/login','POST',{email:'qa@example.test',password});assert.equal(r.status,200,JSON.stringify(r.data));cookie=r.headers.get('Set-Cookie').split(';')[0];assert.match(r.headers.get('Set-Cookie'),/HttpOnly/);assert.match(r.headers.get('Set-Cookie'),/SameSite=Strict/);
 assert.equal((await call('/api/admin/bookings')).status,401);assert.equal((await call('/api/admin/settings','PUT',{mode:'mwf'},true,'https://evil.example')).status,403);assert.equal((await call('/api/admin/login','POST',{email:'qa@example.test',password:'wrong'})).status,401);
 const d=new Date();d.setUTCDate(d.getUTCDate()+30);while(d.getUTCDay()!==1)d.setUTCDate(d.getUTCDate()+1);const date=d.toISOString().slice(0,10);
 const payload=n=>({requestId:randomUUID(),test:['ldv-brake','ldv-lux','hmv-brake','hmv-lux'][n%4],date,contact:'QA Integration',company:'QA Integration',email:'qa@example.test',phone:'0821234567',vehicle:'QA-'+n,website:''});
 assert.equal((await call('/api/bookings','POST',payload(0))).status,409);assert.equal((await call('/api/admin/settings','PUT',{mode:'mwf'},true)).status,200);assert.equal((await call('/api/admin/emails','POST',{},true)).status,409);
 const inputs=Array.from({length:10},(_,i)=>payload(i));const outcomes=await Promise.all(inputs.map(p=>call('/api/bookings','POST',p)));const codes=outcomes.map(r=>r.status);assert.equal(codes.filter(x=>x===201).length,5,JSON.stringify(outcomes.map(r=>({status:r.status,data:r.data}))));assert.equal(codes.filter(x=>x===409).length,5);assert.ok(outcomes.filter(r=>r.status===201).every(r=>r.data.emailSent===false));
 const first=outcomes.findIndex(r=>r.status===201);assert.equal((await call('/api/bookings','POST',inputs[first])).data.reference,outcomes[first].data.reference);
 let avail=(await call('/api/availability?month='+date.slice(0,7)+'&test=hmv-lux')).data;assert.equal(avail.days.find(d=>d.date===date).state,'full');assert.ok(!JSON.stringify(avail).includes('qa@example.test'));
 const rows=(await call('/api/admin/bookings','GET',undefined,true)).data.bookings;assert.equal(rows.length,5);assert.equal((await call('/api/admin/bookings','PATCH',{id:rows[0].id,status:'Rejected',reason:''},true)).status,400);assert.equal((await call('/api/admin/bookings','PATCH',{id:rows[0].id,status:'Rejected',reason:'QA rejection'},true)).status,200);assert.equal((await call('/api/bookings','POST',payload(88))).status,201);
 assert.equal((await call('/api/admin/bookings','PATCH',{id:rows[1].id,status:'Approved'},true)).status,200);assert.equal((await call('/api/admin/bookings','PATCH',{id:rows[1].id,status:'Rejected',reason:'Too late'},true)).status,409);
 assert.equal((await call('/api/admin/blocks','POST',{date,reason:'QA'},true)).status,200);assert.equal((await call('/api/bookings','POST',payload(89))).status,409);avail=(await call('/api/availability?month='+date.slice(0,7)+'&test=ldv-brake')).data;assert.equal(avail.days.find(d=>d.date===date).state,'unavailable');assert.equal((await call('/api/admin/blocks','DELETE',{date},true)).status,200);
 d.setUTCDate(d.getUTCDate()+5);assert.equal((await call('/api/bookings','POST',{...payload(90),date:d.toISOString().slice(0,10)})).status,409);
 const saved=cookie;cookie=cookie.slice(0,-1)+(cookie.endsWith('1')?'2':'1');assert.equal((await call('/api/admin/bookings','GET',undefined,true)).status,401);cookie=saved;
 assert.equal((await call('/api/admin/logout','POST',{},true)).status,200);
 const counts=await client.execute("SELECT status,count(*) n FROM outbox GROUP BY status");assert.deepEqual(counts.rows.map(r=>({status:r.status,n:r.n})),[{status:'queued',n:8}]);
 console.log('PASS: production Next.js + real libSQL; public pages; repeat-safe migrations; 10 concurrent submissions -> 5 accepted, 5 rejected; shared test capacity; idempotency; reject releases capacity; approve; final decision conflict; block/unblock; weekend rejection; private data; auth; cookie tampering; CSRF; Gmail queue.');
}catch(e){console.error(logs);throw e;}finally{server.kill();if(server.exitCode===null)await new Promise(r=>{server.once('exit',r);setTimeout(()=>{server.kill('SIGKILL');r();},3000).unref();});client.close();rmSync(directory,{recursive:true,force:true});}
