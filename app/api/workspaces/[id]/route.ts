import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {authorizedWorkspace,errorResponse,readJson,sameOrigin} from '@/lib/api';
import {saveWorkspace,AppError} from '@/lib/repository';
import {applyMutation,mutationSchema} from '@/lib/mutations';
import {monitor} from '@/lib/engine';
type Context={params:Promise<{id:string}>};
export async function GET(_req:Request,ctx:Context){try{const {id}=await ctx.params;const {user,workspace}=await authorizedWorkspace(id);const next=monitor(workspace,new Date().toISOString());const changed=JSON.stringify(next)!==JSON.stringify(workspace);return NextResponse.json({workspace:changed?await saveWorkspace(user.id,next,workspace.revision,'monitor'):workspace});}catch(e){return errorResponse(e)}}
export async function PATCH(req:Request,ctx:Context){try{sameOrigin(req);const {id}=await ctx.params;const {user,workspace}=await authorizedWorkspace(id);const raw=await readJson(req);if(raw.revision!==workspace.revision)throw new AppError('The workspace changed. Refresh and retry.',409);const parsed=mutationSchema.safeParse(raw.mutation);if(!parsed.success)throw new AppError(parsed.error.issues[0].message);let next;try{next=applyMutation(workspace,parsed.data,user.name||'Business owner',new Date().toISOString(),randomUUID());}catch(e){throw new AppError(e instanceof Error?e.message:'Invalid change.');}return NextResponse.json({workspace:await saveWorkspace(user.id,next,workspace.revision,parsed.data.type)});}catch(e){return errorResponse(e)}}
