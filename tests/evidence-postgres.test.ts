import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {db} from '../lib/db';
import {emptyWorkspace} from '../lib/workspace';
import {storeEvidence,readEvidence,discardEvidence} from '../lib/evidence-storage';
test('PostgreSQL evidence adapter contract: encrypted persistence, scoped reads and rollback',async()=>{
 // Test doubles verify adapter behavior; this is not a live PostgreSQL connectivity test.
 process.env.STORAGE_DRIVER='postgres';process.env.DATABASE_URL='postgresql://unused.invalid/test';process.env.VERCEL='1';process.env.NEXTAUTH_SECRET='isolated-pg-evidence-test-secret-1234567890';
 const businessId=randomUUID(),id=randomUUID(),workspace=emptyWorkspace(businessId,'Fixture'),bytes=Buffer.from('Fictional private proof');
 const rows=new Map<string,{businessId:string;id:string;ciphertext:string}>();
 db.businessMember.findUnique= (async(args:unknown)=>{const where=(args as {where:{businessId_userId:{businessId:string;userId:string}}}).where.businessId_userId;return where.userId==='owner'&&where.businessId===businessId?{business:{payload:workspace}}:null;}) as typeof db.businessMember.findUnique;
 db.evidenceFile.create= (async(args:unknown)=>{const data=(args as {data:{businessId:string;id:string;ciphertext:string}}).data;rows.set(data.businessId+':'+data.id,data);return data;}) as typeof db.evidenceFile.create;
 db.evidenceFile.findUnique= (async(args:unknown)=>{const scope=(args as {where:{businessId_id:{businessId:string;id:string}}}).where.businessId_id;return rows.get(scope.businessId+':'+scope.id)||null;}) as typeof db.evidenceFile.findUnique;
 db.evidenceFile.deleteMany= (async(args:unknown)=>{const scope=(args as {where:{businessId:string;id:string}}).where;return {count:Number(rows.delete(scope.businessId+':'+scope.id))};}) as typeof db.evidenceFile.deleteMany;
 await assert.rejects(storeEvidence('stranger',businessId,id,bytes),/denied/);
 await storeEvidence('owner',businessId,id,bytes);assert.notEqual(rows.get(businessId+':'+id)!.ciphertext,bytes.toString());
 workspace.documents.push({id,taskId:'fixture',name:'fixture.txt',mime:'text/plain',size:bytes.length,uploadedAt:new Date().toISOString()});
 assert.deepEqual(await readEvidence('owner',businessId,id),bytes);
 await assert.rejects(readEvidence('stranger',businessId,id),/denied/);
 await assert.rejects(discardEvidence('owner',businessId,id),/Referenced/);
 const row=rows.get(businessId+':'+id)!;rows.set(businessId+':'+id,{...row,ciphertext:row.ciphertext.slice(0,-4)+'AAAA'});
 await assert.rejects(readEvidence('owner',businessId,id),/decrypted/);
 const orphan=randomUUID();await storeEvidence('owner',businessId,orphan,bytes);await discardEvidence('owner',businessId,orphan);assert.equal(rows.has(businessId+':'+orphan),false);
 rows.delete(businessId+':'+id);await assert.rejects(readEvidence('owner',businessId,id),/unavailable/);
});
