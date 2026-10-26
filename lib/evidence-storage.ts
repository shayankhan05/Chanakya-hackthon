import {mkdir,readFile,writeFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {db} from './db';
import {AppError,loadWorkspace} from './repository';
import {usesPostgres} from './storage-config';
import {encryptFinancial,decryptFinancial} from './financial/crypto';

function filePath(id:string){
 if(!/^[a-f0-9-]{36}$/.test(id))throw new AppError('Evidence not found.',404);
 return resolve(process.env.UPLOAD_PATH||'.data/uploads',id);
}
export async function storeEvidence(userId:string,businessId:string,id:string,bytes:Buffer){
 await loadWorkspace(userId,businessId);
 filePath(id);
 if(usesPostgres()){
  await db.evidenceFile.create({data:{id,businessId,ciphertext:encryptFinancial(bytes,businessId,'evidence:'+id)}});
 }else{
  const path=filePath(id);
  await mkdir(resolve(process.env.UPLOAD_PATH||'.data/uploads'),{recursive:true});
  await writeFile(path,bytes,{flag:'wx',mode:0o600});
 }
}
export async function readEvidence(userId:string,businessId:string,id:string){
 const workspace=await loadWorkspace(userId,businessId);
 if(!workspace.documents.some(d=>d.id===id))throw new AppError('Evidence not found.',404);
 filePath(id);
 if(usesPostgres()){
  const row=await db.evidenceFile.findUnique({where:{businessId_id:{businessId,id}}});
  if(!row)throw new AppError('Evidence file is unavailable. Contact the workspace owner; records have not been changed.',404);
  return decryptFinancial(row.ciphertext,businessId,'evidence:'+id);
 }
 try{return await readFile(filePath(id));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')throw new AppError('Evidence file not found.',404);throw e;}
}
/** Roll back only a newly created file if saving its workspace metadata failed. */
export async function discardEvidence(userId:string,businessId:string,id:string){
 const workspace=await loadWorkspace(userId,businessId);
 if(workspace.documents.some(d=>d.id===id))throw new AppError('Referenced evidence cannot be discarded.',409);
 if(usesPostgres())await db.evidenceFile.deleteMany({where:{businessId,id}});
 else await unlink(filePath(id));
}
