import {NextResponse} from 'next/server';
import {z} from 'zod';
import {requireUser,errorResponse,readJson,sameOrigin} from '@/lib/api';
import {updateAccount,AppError} from '@/lib/repository';
export async function PATCH(req:Request){try{sameOrigin(req);const u=await requireUser();const d=z.object({name:z.string().trim().min(2).max(100)}).safeParse(await readJson(req));if(!d.success)throw new AppError('Enter a name of 2 to 100 characters.');await updateAccount(u.id,d.data.name);return NextResponse.json({success:true});}catch(e){return errorResponse(e)}}
