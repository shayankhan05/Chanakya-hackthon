import {NextResponse} from 'next/server';
import {signupSchema} from '@/lib/auth-schema';
import {hashPassword} from '@/lib/passwords';
import {createAccount,rateLimit,AppError} from '@/lib/repository';
import {errorResponse,readJson,sameOrigin} from '@/lib/api';
export async function POST(req:Request){try{sameOrigin(req);await rateLimit('signup-global',100);const d=signupSchema.safeParse(await readJson(req));if(!d.success)throw new AppError(d.error.issues[0].message);await rateLimit('signup:'+d.data.email,5);await createAccount(d.data.email,d.data.name,await hashPassword(d.data.password));return NextResponse.json({success:true},{status:201});}catch(e){return errorResponse(e)}}
