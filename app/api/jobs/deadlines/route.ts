import {timingSafeEqual} from 'node:crypto';
import {refreshWorkspace,workspaceReferences} from '@/lib/repository';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(req:Request){const secret=process.env.DEADLINE_JOB_SECRET;if(!secret||secret.length<32)return Response.json({error:'Scheduled monitoring is not configured.'},{status:503});const token=req.headers.get('authorization')||'',expected='Bearer '+secret;if(Buffer.byteLength(token)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(token),Buffer.from(expected)))return Response.json({error:'Unauthorized.'},{status:401});let checked=0,failed=0;for(const row of await workspaceReferences()){try{await refreshWorkspace(row.ownerId,row.id);checked++;}catch{failed++;}}return Response.json({checked,failed,monitoring:'Run triggered by configured scheduler; no email delivery'},{status:failed?207:200,headers:{'Cache-Control':'no-store'}});}
