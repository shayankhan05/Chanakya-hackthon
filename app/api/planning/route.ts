import {NextResponse} from 'next/server';
import {z} from 'zod';
import {authorizedWorkspace,errorResponse,readJson,sameOrigin} from '@/lib/api';
import {AppError,rateLimit,saveWorkspace} from '@/lib/repository';
import {optimizePlan} from '@/lib/planning/solver';
import {authorizePlanInput,planningBasis} from '@/lib/planning/workspace';
export const runtime='nodejs';
export async function POST(req:Request){try{sameOrigin(req);const d=z.object({businessId:z.string().min(1),input:z.unknown(),save:z.boolean().default(false)}).parse(await readJson(req));const {user,workspace}=await authorizedWorkspace(d.businessId);await rateLimit('optimizer:'+user.id,20);const input=authorizePlanInput(workspace,d.input),result=optimizePlan(input);if(!d.save)return NextResponse.json({input,result,nonDestructive:true});const analysis={input,result,at:new Date().toISOString(),basis:planningBasis(workspace)};const updated=await saveWorkspace(user.id,{...workspace,planningAnalysis:analysis},workspace.revision,'planning-analysis-saved');return NextResponse.json({input,result,workspace:updated});}catch(e){return errorResponse(e instanceof z.ZodError?new AppError(e.issues[0].message):e instanceof AppError?e:new AppError(e instanceof Error?e.message:'Invalid planning input.'));}}
