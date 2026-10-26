import {randomUUID} from 'node:crypto';
import {validDate} from '../deadlines';
import {encryptFinancial} from './crypto';
import {correctionKey,digest} from './parser';
import type {Category,FinancialLedger,FinancialTransaction} from './types';
export function importStatement(ledger:FinancialLedger,rows:Omit<FinancialTransaction,'importIds'>[],input:{businessId:string;bytes:Uint8Array;filename:string;mime:string;account:string;from:string;to:string;asOf:string;columnMapping?:Record<string,string>}){
 if(!validDate(input.from)||!validDate(input.to)||input.from>input.to||input.to>input.asOf)throw Error('Choose a valid statement period ending no later than today.');
 if(rows.some(t=>t.date<input.from||t.date>input.to))throw Error('Transaction dates fall outside the declared statement period.');
 const hash=digest(input.bytes),existing=ledger.imports.find(i=>i.hash===hash);if(existing)return {ledger,importId:existing.id,duplicate:true,added:0};
 if(ledger.imports.length>=15||ledger.transactions.length+rows.length>5000||ledger.imports.reduce((n,i)=>n+i.file.length,0)+Math.ceil(input.bytes.length*4/3)>10000000)throw Error('Import limit reached. Delete unneeded imports before continuing (15 files, 5,000 rows, 10 MB encrypted storage).');
 const next=structuredClone(ledger),id=randomUUID(),resolvedIds:string[]=[],used=new Set<string>();let added=0;
 for(const row of rows){let old=next.transactions.find(t=>t.id===row.id&&!used.has(t.id));if(!old){const candidates=next.transactions.filter(t=>!used.has(t.id)&&t.account===row.account&&t.date===row.date&&t.credit===row.credit&&t.debit===row.debit&&((t.reference&&row.reference&&t.reference===row.reference)||((!t.reference||!row.reference)&&t.description.toLowerCase().replace(/\s+/g,' ')===row.description.toLowerCase().replace(/\s+/g,' ')))).filter(t=>t.balance===null||row.balance===null||t.balance===row.balance);if(candidates.length>1)throw Error('Ambiguous overlapping transactions without a unique reference/balance. Use an export with transaction references; no rows were guessed.');old=candidates[0];}if(old){old.importIds.push(id);resolvedIds.push(old.id);used.add(old.id);continue;}const correction=next.corrections[correctionKey(row)];next.transactions.push({...row,category:correction||row.category,reviewed:false,reason:correction?'Suggested from your previous correction; review again for this statement.':row.reason,importIds:[id]});resolvedIds.push(row.id);used.add(row.id);added++;}
 // Original bytes are encrypted before becoming part of a ledger. The repository
 // separately encrypts the complete ledger, including descriptions and corrections.
 next.imports.push({id,hash,filename:input.filename.replace(/[^\w. -]/g,'_').slice(0,100),mime:input.mime,account:input.account,from:input.from,to:input.to,coverageConfirmed:false,confirmed:false,at:new Date().toISOString(),file:encryptFinancial(input.bytes,input.businessId,'statement:'+id),columnMapping:input.columnMapping,transactionIds:resolvedIds});
 next.audit.push({at:new Date().toISOString(),action:`Statement imported: ${added} new rows; ${rows.length-added} overlaps reused. No business turnover changed.`});return {ledger:next,importId:id,duplicate:false,added};
}
export {reviewTransactions,deleteImport,deleteTransaction} from './reviews';
