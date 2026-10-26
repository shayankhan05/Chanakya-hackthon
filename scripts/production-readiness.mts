/** Read-only. Supply production environment privately; never loads local SQLite or changes schemas. */
import {PrismaClient} from '@prisma/client';
import {usesPostgres} from '../lib/storage-config';
import {encryptFinancial,decryptFinancial} from '../lib/financial/crypto';
const checks:{check:string;passed:boolean}[]=[];
const check=(name:string,passed:boolean)=>{checks.push({check:name,passed});};
let db:PrismaClient|undefined;
try{
 check('Explicit persistent PostgreSQL configuration',usesPostgres({...process.env,VERCEL:'1'}));
 check('Production authentication URL',process.env.NEXTAUTH_URL==='https://compliancecopilot-shayan.vercel.app');
 check('Development password recovery disabled',process.env.AUTH_DEV_RESET!=='true');
 check('Stable non-placeholder authentication secret',!!process.env.NEXTAUTH_SECRET&&process.env.NEXTAUTH_SECRET.length>=32&&!/replace|placeholder/i.test(process.env.NEXTAUTH_SECRET));
 const probe=Buffer.from('readiness-encryption-probe');
 check('Financial and evidence encryption configured',decryptFinancial(encryptFinancial(probe,'readiness','probe'),'readiness','probe').equals(probe));
 db=new PrismaClient();
 // An interactive read-only transaction checks connectivity, schema and ORM mapping without reading private payloads.
 await db.$transaction(async tx=>{
  await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
  await tx.$queryRawUnsafe('SELECT "id", "authVersion" FROM "AppAccount" LIMIT 0');
  await tx.$queryRawUnsafe('SELECT "id", "revision", "payload" FROM "BusinessWorkspace" LIMIT 0');
  await tx.$queryRawUnsafe('SELECT "businessId", "userId", "role" FROM "BusinessMember" LIMIT 0');
  await tx.$queryRawUnsafe('SELECT "businessId", "revision", "ciphertext", "updatedAt" FROM "FinancialLedger" LIMIT 0');
  await tx.$queryRawUnsafe('SELECT "businessId", "id", "ciphertext", "createdAt" FROM "EvidenceFile" LIMIT 0');
  await tx.$queryRawUnsafe('SELECT "hash", "expiresAt" FROM "PasswordReset" LIMIT 0');
  await tx.$queryRawUnsafe('SELECT "key", "count", "expiresAt" FROM "RateBucket" LIMIT 0');
  await tx.$queryRawUnsafe('SELECT "id", "businessId", "actor", "action", "at" FROM "AuditEntry" LIMIT 0');
  check('Live database connectivity and required schema',true);
 });
}catch(e){
 check('Readiness verification completed',false);
 const code=typeof e==='object'&&e&&'code' in e?String(e.code):'CONFIGURATION_OR_CONNECTION';
 console.error('Production readiness blocked: '+code+'. No credentials or database contents logged.');
}finally{await db?.$disconnect();}
console.log(JSON.stringify({ready:checks.length>=6&&checks.every(c=>c.passed),checks},null,2));
if(checks.some(c=>!c.passed))process.exitCode=1;
