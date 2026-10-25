import {NextResponse} from 'next/server';
import {authorizedWorkspace,errorResponse,readJson,sameOrigin} from '@/lib/api';
import {businessSchema} from '@/lib/profile-schema';
import {AppError} from '@/lib/repository';
import {simulate} from '@/lib/engine';
export async function POST(req:Request,ctx:{params:Promise<{id:string}>}){try{sameOrigin(req);const {id}=await ctx.params;const {workspace}=await authorizedWorkspace(id);const parsed=businessSchema.safeParse(await readJson(req));if(!parsed.success)throw new AppError(parsed.error.issues[0].message);return NextResponse.json(simulate(workspace,parsed.data));}catch(e){return errorResponse(e)}}
