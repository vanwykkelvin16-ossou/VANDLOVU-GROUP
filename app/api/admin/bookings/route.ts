import {isAdmin} from '@/lib/auth';import {body,db,json,sameOrigin,safeFailure} from '@/lib/server';import {deliverBooking} from '@/lib/email';
export async function GET(req:Request){if(!await isAdmin(req))return json({error:'Please sign in.'},401);try{const bookings=await db().prepare("SELECT b.*, (SELECT status FROM outbox WHERE booking_id=b.id AND kind='receipt') receipt_email,(SELECT status FROM outbox WHERE booking_id=b.id AND kind='decision') decision_email FROM bookings b ORDER BY created_at DESC").all();return json({bookings:bookings.results});}catch(e){return safeFailure(e);}}
export async function PATCH(req:Request){if(!sameOrigin(req)||!await isAdmin(req))return json({error:'Please sign in.'},403);try{const v=await body(req);if(!['Approved','Rejected'].includes(v.status)||typeof v.id!=='string')return json({error:'Invalid booking decision.'},400);const reason=typeof v.reason==='string'?v.reason.trim().slice(0,1000):'';if(v.status==='Rejected'&&!reason)return json({error:'Please add a rejection reason.'},400);const decisionId=crypto.randomUUID(),now=new Date().toISOString();const results=await db().batch([db().prepare("UPDATE bookings SET status=?,reason=?,updated_at=? WHERE id=? AND status='Pending'").bind(v.status,reason,now,v.id),db().prepare("INSERT INTO outbox(id,booking_id,kind,status,created_at) SELECT ?,id,'decision','queued',? FROM bookings WHERE id=? AND status=? ON CONFLICT(booking_id,kind) DO NOTHING").bind(decisionId,now,v.id,v.status)]);if(!results[0].meta.changes)return json({error:'This request has already been reviewed. Refresh to see its current status.'},409);await deliverBooking(v.id);return json({ok:true});}catch(e){return safeFailure(e);}}

export async function DELETE(req:Request){
 if(!sameOrigin(req)||!await isAdmin(req))return json({error:'Please sign in.'},403);
 try{
  const v=await body(req);
  if(typeof v.id!=='string'||!v.id.trim()||v.id.length>100)return json({error:'Choose a valid booking.'},400);
  const database=db();
  // Both statements run in one transaction; an in-flight email prevents removal.
  const results=await database.batch([
   database.prepare("DELETE FROM outbox WHERE booking_id=? AND NOT EXISTS(SELECT 1 FROM outbox sending WHERE sending.booking_id=? AND sending.status='sending')").bind(v.id,v.id),
   database.prepare("DELETE FROM bookings WHERE id=? AND NOT EXISTS(SELECT 1 FROM outbox WHERE booking_id=?)").bind(v.id,v.id)
  ]);
  if(!results[1].meta.changes){
   const existing=await database.prepare('SELECT id FROM bookings WHERE id=?').bind(v.id).first();
   if(existing)return json({error:'An email is being processed for this booking. Please retry shortly. If it remains stuck, retry queued emails in Settings first.'},409);
   return json({error:'This booking has already been deleted. Refresh the list.'},404);
  }
  return json({ok:true});
 }catch(e){return safeFailure(e);}
}
