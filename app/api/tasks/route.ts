import {requireUser,errorResponse} from '@/lib/api';
import {AppError} from '@/lib/repository';
export async function PATCH(){try{await requireUser();throw new AppError('Use the versioned workspace API for task updates.',410);}catch(e){return errorResponse(e)}}
