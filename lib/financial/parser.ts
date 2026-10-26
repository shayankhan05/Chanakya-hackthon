import {suggest} from './classification';
export {correctionKey,suggest} from './classification';
import {createHash} from 'node:crypto';
import {validDate} from '../deadlines';
import {paise,rupees} from './money';
import type {Category,FinancialTransaction} from './types';
export const digest=(s:string|Uint8Array)=>createHash('sha256').update(s).digest('hex');
export function csvRows(text:string){
 if(text.length>500000||text.includes('\0'))throw Error('CSV is too large or contains unsupported binary data.');
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted||!cell)quoted=!quoted;else throw Error('Unsupported CSV quoting.');}else if(!quoted&&(c===','||c==='\n'||c==='\r')){row.push(cell.trim());cell='';if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(Boolean))rows.push(row);row=[];}}else cell+=c;if(rows.length>2001||cell.length>2000)throw Error('Statement exceeds row or field limits.');}
 if(quoted)throw Error('Unclosed CSV quote.');row.push(cell.trim());if(row.some(Boolean))rows.push(row);return rows;
}
const headers:Record<string,string[]>={date:['date','transactiondate','txndate','valuedate','postingdate','transactionpostingdate'],description:['description','narration','particulars','transactiondetails','details','remarks'],credit:['credit','creditamount','deposit','deposits','depositamount','depositamt','creditamt','creditcr','depositcr'],debit:['debit','debitamount','withdrawal','withdrawals','withdrawalamount','withdrawalamt','debitamt','debitdr','withdrawaldr'],balance:['balance','runningbalance','closingbalance','balanceamount','balanceamt'],reference:['reference','ref','transactionid','transactionreference','utr','chequeno','chqrefno','chequerefno','chequereferenceno','refno','refnochequeno','chqno'],amount:['amount','transactionamount','txnamount'],direction:['type','direction','drcr','crdr','transactiontype','debitcredit','creditdebit']};
export function statementDate(raw:string){
 let s=raw.trim();const numeric=s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/),named=s.match(/^(\d{1,2})[- /]([a-z]{3})[- /](\d{4})$/i);
 if(numeric)s=`${numeric[3]}-${numeric[2].padStart(2,'0')}-${numeric[1].padStart(2,'0')}`;
 if(named){const month=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(named[2].toLowerCase())+1;s=`${named[3]}-${String(month).padStart(2,'0')}-${named[1].padStart(2,'0')}`;}
 if(!validDate(s))throw Error('Unsupported date. Use YYYY-MM-DD, DD/MM/YYYY or DD-MMM-YYYY (for example 01-Apr-2026).');return s;
}
export function parseStatement(text:string,account:string,format:'csv'|'pdf'='csv'):Omit<FinancialTransaction,'importIds'>[]{return parseStatementWithMapping(text,account,format).transactions;}
export function parseStatementWithMapping(text:string,account:string,format:'csv'|'pdf'='csv'){
 const rows=format==='csv'?csvRows(text.replace(/^\uFEFF/,'')):text.split(/\r?\n/).map(l=>l.split('|').map(s=>s.trim())).filter(r=>r.some(Boolean));
 if(rows.length<2||rows.length>2001)throw Error('No supported transaction table found. Scanned PDFs and unsupported layouts cannot be imported.');
 const columns=rows[0].map(s=>s.toLowerCase().replace(/\b(?:inr|rs)\b/g,'').replace(/[^a-z]/g,'')), index:Record<string,number>={};
 for(const [field,names] of Object.entries(headers)){let matches=columns.flatMap((c,i)=>names.includes(c)?[i]:[]);if(field==='date'&&matches.length>1){const primary=matches.filter(i=>columns[i]!=='valuedate');if(primary.length===1)matches=primary;}if(matches.length>1)throw Error(`Ambiguous ${field} columns. Use the supported template.`);index[field]=matches[0]??-1;}
 if(index.date<0||index.description<0||!((index.credit>=0&&index.debit>=0)||(index.amount>=0&&index.direction>=0)))throw Error('Unsupported layout. Include Date, Description, Debit and Credit, or Date, Description, Amount and Type (CR/DR). For PDF use the documented pipe-separated table.');
 const occurrences=new Map<string,number>();const ids=new Set<string>();
 const transactions=rows.slice(1).map((r,n)=>{
  if(r.length!==columns.length)throw Error(`Row ${n+2} has an inconsistent number of columns. Quote amounts containing commas.`);
  const get=(k:string)=>index[k]>=0?r[index[k]]:'';const date=statementDate(get('date')),description=get('description').trim();if(description.length<2||description.length>500)throw Error(`Row ${n+2} needs a supported description.`);
  let credit=0n,debit=0n;
  const amount=(s:string)=>!s||s==='-'?0n:paise(s);
  if(index.credit>=0&&index.debit>=0){credit=amount(get('credit'));debit=amount(get('debit'));}else {const direction=get('direction').toLowerCase();if(!['cr','credit','dr','debit'].includes(direction))throw Error(`Row ${n+2} needs CR or DR.`);if(['cr','credit'].includes(direction))credit=amount(get('amount'));else debit=amount(get('amount'));}
  if((credit===0n)===(debit===0n))throw Error(`Row ${n+2} must contain exactly one nonzero credit or debit.`);
  const reference=get('reference');if(reference.length>100)throw Error('Transaction reference is too long.');
  const balanceRaw=get('balance'),negative=balanceRaw.startsWith('-');const balance=balanceRaw&&balanceRaw!=='-'?rupees(paise(negative?balanceRaw.slice(1):balanceRaw)*(negative?-1n:1n)):null;
  const base=[account,date,description.toLowerCase().replace(/\s+/g,' '),credit.toString(),debit.toString(),reference.toLowerCase()].join('|');const occurrence=occurrences.get(base)||0;occurrences.set(base,occurrence+1);
  const id=digest(base+'|'+occurrence);if(ids.has(id))throw Error('Ambiguous repeated transaction.');ids.add(id);const suggestion=suggest(description,credit>0n);
  return {id,account,date,description,reference,credit:rupees(credit),debit:rupees(debit),balance,category:suggestion.category,suggestion:suggestion.category,reason:suggestion.reason,reviewed:false};
 });
 return {transactions,mapping:Object.fromEntries(Object.entries(index).filter(([,i])=>i>=0).map(([field,i])=>[field,rows[0][i]]))};
}
