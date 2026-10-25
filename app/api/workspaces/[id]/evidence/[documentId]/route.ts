import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {authorizedWorkspace,errorResponse} from '@/lib/api';
import {AppError} from '@/lib/repository';
export async function GET(_req:Request,ctx:{params:Promise<{id:string;documentId:string}>}){try{const {id,documentId}=await ctx.params;const {workspace}=await authorizedWorkspace(id);const document=workspace.documents.find(d=>d.id===documentId);if(!document||!/^[a-f0-9-]{36}$/.test(documentId))throw new AppError('Evidence not found.',404);const buffer=await readFile(resolve(process.env.UPLOAD_PATH||'.data/uploads',documentId));return new Response(buffer,{headers:{'Content-Type':document.mime,'Content-Disposition':`attachment; filename="${document.name}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}catch(e){return errorResponse(e)}}
