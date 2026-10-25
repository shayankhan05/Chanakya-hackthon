import {NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from './auth';
import {AppError,refreshWorkspace} from './repository';
export async function requireUser(){const session=await getServerSession(authOptions);if(!session?.user?.id)throw new AppError('Please sign in to continue.',401);return session.user;}
export async function authorizedWorkspace(id:string){const user=await requireUser();const workspace=await refreshWorkspace(user.id,id);return {user,workspace};}
export function errorResponse(e:unknown){return NextResponse.json({error:e instanceof AppError?e.message:'The request could not be completed. Please try again.'},{status:e instanceof AppError?e.status:500});}
export async function readJson(req:Request){const length=Number(req.headers.get('content-length')||0);if(length>200000)throw new AppError('Request too large.',413);const text=await req.text();if(text.length>200000)throw new AppError('Request too large.',413);try{return JSON.parse(text)}catch{throw new AppError('Invalid JSON.',400)}}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin&&origin!==process.env.NEXTAUTH_URL)throw new AppError('Cross-site request rejected.',403);}
