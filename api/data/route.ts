import { env } from 'cloudflare:workers';
import { triage } from '../../../lib/triage';
export const dynamic='force-dynamic';
const response=(body:any,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){
 try{
  const db=env.DB!;const url=new URL(req.url);const id=url.searchParams.get('case');
  if(id){const after=Number(url.searchParams.get('after')||0);const rows=await db.prepare('SELECT * FROM events WHERE case_id=? AND seq>? ORDER BY seq ASC LIMIT 500').bind(id,Number.isFinite(after)?after:0).all();return response({events:rows.results.map((r:any)=>({...r,body:JSON.parse(r.body)}))});}
  const rows=await db.prepare('SELECT * FROM cases ORDER BY created DESC LIMIT 100').all();return response({cases:rows.results.map((r:any)=>({...JSON.parse(r.body),id:r.id,status:r.status,created:r.created}))});
 }catch{return response({error:'Could not reach the case database. Your local queue is preserved.'},503);}
}
export async function POST(req:Request){
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return response({error:'Cross-origin writes are not allowed'},403);
 try{
 const raw=await req.text();if(raw.length>750000)return response({error:'Capsule is too large. Please use a smaller attachment.'},413);
 const data=JSON.parse(raw), db=env.DB!;
 if(data.action==='capsule'){
  const c=data.capsule;
  if(!c||typeof c.id!=='string'||c.id.length>80||typeof c.name!=='string'||!c.name.trim()||c.name.length>100||!c.consent||!Array.isArray(c.symptoms)||!c.symptoms.length||c.notes?.length>3000||!Number.isFinite(Number(c.age))||Number(c.age)<0||Number(c.age)>120)return response({error:'Check the patient details, symptoms and consent.'},400);
  const body={...c,triage:triage(c)};
  await db.prepare('INSERT INTO cases (id,body,status,created) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(c.id,JSON.stringify(body),'Waiting',Date.now()).run();return response({ok:true,id:c.id});
 }
 if(data.action==='status'){
  if(!['Waiting','In consultation','Reviewed'].includes(data.status))return response({error:'Invalid status'},400);
  const result=await db.prepare("UPDATE cases SET status=? WHERE id=? AND status!='Reviewed' AND status!=?").bind(data.status,data.caseId,data.status).run();
  const current=await db.prepare('SELECT status FROM cases WHERE id=?').bind(data.caseId).first<{status:string}>();
  if(!current)return response({error:'Consultation not found'},404);
  if(current.status==='Reviewed'&&data.status!=='Reviewed')return response({error:'This consultation is already reviewed and cannot be reopened.'},409);
  return response({ok:true,status:current.status,changed:(result.meta.changes||0)>0});
 }
 if(data.action==='event'){
  if(!['message','note','offer','answer','candidate','hangup'].includes(data.kind)||!['patient','specialist'].includes(data.role)||typeof data.id!=='string'||data.id.length>80||JSON.stringify(data.body).length>60000)return response({error:'Invalid event'},400);
  if(['message','note'].includes(data.kind)&&(typeof data.body.text!=='string'||!data.body.text.trim()||data.body.text.length>3000))return response({error:'Message must contain 1–3000 characters'},400);
  const found=await db.prepare('SELECT id FROM cases WHERE id=?').bind(data.caseId).first();if(!found)return response({error:'Sync the capsule before starting a consultation'},404);
  await db.prepare('INSERT INTO events (id,case_id,kind,role,body,created) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(data.id,data.caseId,data.kind,data.role,JSON.stringify(data.body),Date.now()).run();return response({ok:true});
 }
 return response({error:'Unknown action'},400);
 }catch{return response({error:'Unable to save. Retry when your connection returns.'},503);}
}
