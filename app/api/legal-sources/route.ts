import {NextResponse} from 'next/server';
import {authorizedWorkspace,errorResponse} from '@/lib/api';
import {AppError} from '@/lib/repository';
import {searchIndexedKnowledge} from '@/lib/legal-index';
export const runtime='nodejs';
export async function GET(req:Request){try{const q=new URL(req.url).searchParams,id=q.get('businessId');if(id)await authorizedWorkspace(id);else if(q.get('demo')!=='true')throw new AppError('Choose an authorized business or demo source search.',401);const query=q.get('q')||'';if(query.length>500)throw new AppError('Search is limited to 500 characters.');return NextResponse.json({records:searchIndexedKnowledge(query),scope:'Curated public legal material; not exhaustive legal coverage'},{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e)}}
