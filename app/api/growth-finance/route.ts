import {NextResponse} from 'next/server';
import {z} from 'zod';
import {authorizedWorkspace,errorResponse,readJson,sameOrigin} from '@/lib/api';
import {AppError,rateLimit} from '@/lib/repository';
import {growthFinance} from '@/lib/growth-finance';
export const runtime='nodejs';
export async function POST(req:Request){try{sameOrigin(req);const d=z.object({businessId:z.string().min(1),input:z.unknown()}).parse(await readJson(req));const {user,workspace}=await authorizedWorkspace(d.businessId);await rateLimit('growth-finance:'+user.id,30);return NextResponse.json(growthFinance(workspace,d.input));}catch(e){return errorResponse(e instanceof AppError?e:new AppError(e instanceof Error?e.message:'Invalid financial inputs.'));}}
