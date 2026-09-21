import {db,runtime} from './server';
import {prettyDate} from './booking';
export function emailReady(){const e=runtime();return !!(e.RESEND_API_KEY&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(e.RESEND_FROM||''));}
export function emailText(b:any,kind:string){const status=kind==='receipt'?'Request received — pending approval':b.status==='Approved'?'Booking confirmed':'Booking rejected';const explanation=kind==='receipt'?'Your request is pending approval. This is not a confirmed booking.':b.status==='Approved'?'Your booking has been approved and is confirmed.':'Your booking has been rejected and is not confirmed.';return {booking:b,kind,subject:`Vandlovu Group | ${status} | ${b.reference}`,text:`Hello ${b.contact},\n\n${explanation}\n\nReference: ${b.reference}\nTest: ${b.test_name}\nVehicle category: ${b.category}\nVehicle / fleet: ${b.vehicle}\nRequested date: ${prettyDate(b.date)}\nTime: ${b.time} (South African Standard Time, UTC+02:00)\nLocation: ${b.location}\n${kind==='decision'&&b.status==='Rejected'?'\nReason: '+b.reason+'\n':''}\nVandlovu Group Bookings`};}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
type EmailContent = {subject:string;text:string;booking?:any;kind?:string};
export function emailHtml(content:EmailContent){
 const b=content.booking;
 const esc=(value:unknown)=>escapeHtml(String(value??''));
 const pending=content.kind==='receipt', approved=b?.status==='Approved';
 const title=pending?'Request received':approved?'Your booking is confirmed':'Booking request declined';
 const badge=pending?'PENDING APPROVAL':approved?'CONFIRMED':'NOT CONFIRMED';
 const message=pending?'Thank you for your request. Our team will review it and email you with a decision. Your booking is not confirmed yet.':approved?'Your test booking has been approved. Please see your confirmed details below.':'We’re unable to approve this request. Your booking is not confirmed. Please see the reason below.';
 const rows=b?[
  ['Test',b.test_name],['Requested date',prettyDate(b.date)],['Session time',b.time],
  ['Location',b.location],['Vehicle category',b.category],['Registration / fleet',b.vehicle]
 ].map(([label,value])=>`<tr><th scope="row" align="left" valign="top" style="width:36%;padding:14px 12px 14px 0;border-bottom:1px solid #e5e7eb;font-size:13px;line-height:20px;color:#62626b;font-weight:normal">${esc(label)}</th><td valign="top" style="padding:14px 0;border-bottom:1px solid #e5e7eb;font-size:15px;line-height:21px;font-weight:bold;color:#18181b;word-break:break-word">${esc(value)}</td></tr>`).join(''):'';
 const body=b?`
 <p style="margin:0 0 18px;font-size:15px;line-height:24px">Hello ${esc(b.contact)},</p>
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#f7f7f8;border-left:4px solid #dc2626;padding:20px">
 <p style="margin:0 0 10px;color:#b91c1c;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.4px">${badge}</p>
 <h1 style="margin:0 0 12px;font-size:26px;line-height:32px;font-weight:bold;color:#18181b">${title}</h1>
 <p style="margin:0;font-size:15px;line-height:24px;color:#45454d">${message}</p>
 </td></tr></table>
 <p style="margin:26px 0 6px;font-size:11px;line-height:17px;color:#62626b;letter-spacing:1px;font-weight:bold">BOOKING REFERENCE</p>
 <p style="margin:0 0 12px;font-size:18px;line-height:26px;font-weight:bold;color:#18181b">${esc(b.reference)}</p>
 <table aria-label="Booking details" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed">${rows}</table>
 <p style="margin:12px 0 0;font-size:12px;line-height:19px;color:#62626b">All times are South African Standard Time (UTC+02:00).</p>
 ${!pending&&!approved?`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px"><tr><td style="padding:18px;background:#fff1f2;border:1px solid #fecdd3"><p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#991b1b">Reason for declining</p><p style="margin:0;font-size:14px;line-height:23px;color:#45454d">${esc(b.reason).replace(/\r?\n/g,'<br>')}</p></td></tr></table>`:''}
 <p style="margin:26px 0 0;font-size:14px;line-height:23px;color:#45454d">Have a question? Reply to this email and our team will help.</p>`:
 content.text.split(/\n\n/).map(p=>`<p style="margin:0 0 18px;font-size:15px;line-height:24px">${esc(p).replace(/\n/g,'<br>')}</p>`).join('');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(content.subject)}</title></head><body style="margin:0;padding:0;background:#f1f2f4;color:#18181b;font-family:Arial,Helvetica,sans-serif">
 <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(b?title+' · '+b.reference:content.subject)}</div>
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f2f4"><tr><td align="center" style="padding:24px 12px">
 <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-top:5px solid #dc2626">
 <tr><td style="padding:28px 24px;border-bottom:1px solid #eeeeef"><p style="margin:0;font-size:23px;line-height:29px;font-weight:bold;letter-spacing:-0.5px;color:#dc2626">VANDLOVU <span style="color:#18181b">GROUP</span></p><p style="margin:6px 0 0;font-size:11px;line-height:16px;letter-spacing:2px;color:#62626b">VEHICLE TEST BOOKINGS</p></td></tr>
 <tr><td style="padding:28px 24px">${body}</td></tr>
 <tr><td style="padding:20px 24px;background:#18181b"><p style="margin:0;font-size:13px;line-height:20px;font-weight:bold;color:#ffffff">Vandlovu Group Bookings</p><p style="margin:5px 0 0;font-size:12px;line-height:19px;color:#d4d4d8">${b?'Keep this email for your booking reference.':'Vehicle testing made simple.'}</p></td></tr>
 </table><!--[if mso]></td></tr></table><![endif]-->
 </td></tr></table></body></html>`;
}
export async function sendResend(id:string,to:string,content:EmailContent,e:Record<string,any>){
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${e.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`booking-${id}`},body:JSON.stringify({from:`Vandlovu Group Bookings <${e.RESEND_FROM}>`,to:[to],reply_to:e.RESEND_REPLY_TO?e.RESEND_REPLY_TO.split(',').map((address:string)=>address.trim()).filter(Boolean):undefined,subject:content.subject,text:content.text,html:emailHtml(content)}),signal:AbortSignal.timeout(15000)});
 const result=await response.json().catch(()=>null) as {id?:string}|null;
 if(!response.ok||!result?.id)throw Error(`Resend did not accept this email (HTTP ${response.status}). Check the verified sender and API key, then retry.`);
 return result.id;
}
export async function sendOutbox(id:string){if(!emailReady())return false;const database=db(),now=Date.now();const claim=await database.prepare("UPDATE outbox SET status='sending', lease_until=?, attempts=attempts+1 WHERE id=? AND (status IN ('queued','failed') OR (status='sending' AND lease_until<?)) AND (kind='receipt' OR EXISTS(SELECT 1 FROM outbox o WHERE o.booking_id=outbox.booking_id AND o.kind='receipt' AND o.status='sent')) RETURNING booking_id,kind").bind(now+120000,id,now).first<{booking_id:string;kind:string}>();if(!claim)return !!await database.prepare("SELECT id FROM outbox WHERE id=? AND status='sent'").bind(id).first();
 try{const b:any=await database.prepare('SELECT * FROM bookings WHERE id=?').bind(claim.booking_id).first();const {TESTS}=await import('./booking');b.test_name=TESTS.find(t=>t.id===b.test)?.name||b.test;const content=emailText(b,claim.kind);const e=runtime();await sendResend(id,b.email,content,e);await database.prepare("UPDATE outbox SET status='sent',sent_at=?,error='',lease_until=0 WHERE id=?").bind(new Date().toISOString(),id).run();return true;
 }catch(e){await database.prepare("UPDATE outbox SET status='failed',error=?,lease_until=0 WHERE id=?").bind(e instanceof Error?e.message:'Delivery failed',id).run();return false;}}
export async function deliverBooking(id:string){const messages=await db().prepare("SELECT id FROM outbox WHERE booking_id=? AND status!='sent' ORDER BY CASE kind WHEN 'receipt' THEN 0 ELSE 1 END").bind(id).all<{id:string}>();for(const m of messages.results)await sendOutbox(m.id);}
