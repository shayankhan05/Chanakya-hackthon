import {NextResponse} from 'next/server';
import {z} from 'zod';
import {authorizedWorkspace,errorResponse,readJson,sameOrigin} from '@/lib/api';
import {AppError,rateLimit} from '@/lib/repository';
import {calculate} from '@/lib/calculators';
import {knowledgeReferences} from '@/lib/legal-knowledge';
export const runtime='nodejs';
export async function POST(req:Request){try{sameOrigin(req);const body=z.object({businessId:z.string().max(100).optional(),demo:z.boolean().optional(),input:z.unknown()}).parse(await readJson(req));if(body.businessId){const {user}=await authorizedWorkspace(body.businessId);await rateLimit('calculations:'+user.id,90);}else if(!body.demo)throw new AppError('Choose an authorized business or a clearly labeled demonstration.',401);const result=calculate(body.input);return NextResponse.json({result,sources:knowledgeReferences(result.sourceIds)},{headers:{'Cache-Control':'no-store'}});}catch(e){if(e instanceof z.ZodError)return NextResponse.json({error:e.issues.map(i=>`${i.path.join('.')}: ${i.message}`).slice(0,5).join('; ')},{status:400});return errorResponse(e);}}
