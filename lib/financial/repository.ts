import {usesPostgres} from '../storage-config';
import {DatabaseSync} from 'node:sqlite';
import {resolve} from 'node:path';
import {db} from '../db';
import {AppError,loadWorkspace} from '../repository';
import {decryptFinancial,encryptFinancial} from './crypto';
import {emptyLedger,type FinancialLedger} from './types';
const postgres=usesPostgres;
let local:DatabaseSync|undefined;
function sql(){if(!local){local=new DatabaseSync(resolve(process.env.SQLITE_PATH||'.data/compliance.sqlite'));local.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS financial_ledgers(businessId TEXT PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,revision INTEGER NOT NULL,ciphertext TEXT NOT NULL);');}return local;}
export async function readFinancialLedger(userId:string,businessId:string):Promise<{ledger:FinancialLedger;revision:number}>{
 await loadWorkspace(userId,businessId);
 const row=postgres()?await db.financialLedger.findUnique({where:{businessId}}):sql().prepare('SELECT revision,ciphertext FROM financial_ledgers WHERE businessId=?').get(businessId) as {revision:number;ciphertext:string}|undefined;
 return row?{revision:row.revision,ledger:JSON.parse(decryptFinancial(row.ciphertext,businessId).toString('utf8')) as FinancialLedger}:{revision:0,ledger:emptyLedger()};
}
export async function saveFinancialLedger(userId:string,businessId:string,ledger:FinancialLedger,expected:number){
 await loadWorkspace(userId,businessId);
 const ciphertext=encryptFinancial(Buffer.from(JSON.stringify(ledger)),businessId);
 if(postgres()){if(expected===0){try{await db.financialLedger.create({data:{businessId,ciphertext,revision:1}});}catch{throw new AppError('Financial records changed. Refresh before saving.',409);}}else{const changed=await db.financialLedger.updateMany({where:{businessId,revision:expected},data:{ciphertext,revision:expected+1}});if(!changed.count)throw new AppError('Financial records changed. Refresh before saving.',409);}}
 else {if(expected===0){try{sql().prepare('INSERT INTO financial_ledgers VALUES(?,1,?)').run(businessId,ciphertext);}catch{throw new AppError('Financial records changed. Refresh before saving.',409);}}else{const changed=sql().prepare('UPDATE financial_ledgers SET ciphertext=?,revision=revision+1 WHERE businessId=? AND revision=?').run(ciphertext,businessId,expected);if(!changed.changes)throw new AppError('Financial records changed. Refresh before saving.',409);}}
 return expected+1;
}
export async function deleteFinancialLedger(userId:string,businessId:string,expected:number){await loadWorkspace(userId,businessId);if(postgres()){const result=await db.financialLedger.deleteMany({where:{businessId,revision:expected}});if(expected&&!result.count)throw new AppError('Financial records changed. Refresh before deleting.',409);}else{const result=sql().prepare('DELETE FROM financial_ledgers WHERE businessId=? AND revision=?').run(businessId,expected);if(expected&&!result.changes)throw new AppError('Financial records changed. Refresh before deleting.',409);}}
