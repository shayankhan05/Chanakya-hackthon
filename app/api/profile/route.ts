import {NextResponse} from 'next/server';
import {requireUser,errorResponse} from '@/lib/api';
import {ownWorkspace,AppError} from '@/lib/repository';
export async function GET(){try{const u=await requireUser();return NextResponse.json({workspace:await ownWorkspace(u.id)});}catch(e){return errorResponse(e)}}
export async function POST(){try{await requireUser();throw new AppError('Use the versioned workspace API so profile changes are evaluated atomically.',410);}catch(e){return errorResponse(e)}}
