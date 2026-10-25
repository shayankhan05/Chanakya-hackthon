import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {requireUser,errorResponse,readJson,sameOrigin} from '@/lib/api';
import {businessSchema} from '@/lib/profile-schema';
import {ownWorkspace,refreshWorkspace,createWorkspace,AppError} from '@/lib/repository';
import {emptyWorkspace} from '@/lib/workspace';
import {reconcileWorkspace} from '@/lib/engine';
export async function GET(){try{const user=await requireUser();const w=await ownWorkspace(user.id);return NextResponse.json({workspace:w?await refreshWorkspace(user.id,w.id):null});}catch(e){return errorResponse(e)}}
export async function POST(req:Request){try{sameOrigin(req);const user=await requireUser();const parsed=businessSchema.safeParse(await readJson(req));if(!parsed.success)throw new AppError(parsed.error.issues[0].message);const at=new Date().toISOString();const w=reconcileWorkspace(emptyWorkspace(randomUUID(),user.name||'Business owner'),parsed.data,user.name||'Business owner',at,randomUUID());return NextResponse.json({workspace:await createWorkspace(user.id,w)},{status:201});}catch(e){return errorResponse(e)}}

