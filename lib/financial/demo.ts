import type {FinancialLedger} from './types';
import {suggest} from './classification';
export const DEMO_STATEMENT_PERIOD={from:'2026-04-01',to:'2026-09-30'};
export function fictionalFinancialLedger():FinancialLedger{
 const ledger:FinancialLedger={version:1,imports:[],transactions:[],corrections:{},audit:[]},importId='00000000-0000-4000-8000-000000000026';let n=0;
 for(let month=4;month<=9;month++){
  const m=String(month).padStart(2,'0');
  const rows:[number,string,string,string][]=[[3,'Customer invoice payment Fictional Acme','200000.00','0.00'],[4,'Customer sales receipt Fictional Beta','150000.00','0.00'],[9,'Supplier business expense Fictional Supplies','0.00','45000.00'],[15,'Office rent Fictional Landlord','0.00','20000.00'],[28,'Salary payroll Fictional Team','0.00','120000.00']];
  if(month===4)rows.push([10,'Owner investment fictional capital','300000.00','0.00']);
  if(month===5)rows.push([12,'Internal transfer own account fictional','100000.00','0.00']);
  if(month===6)rows.push([13,'Loan received fictional finance','500000.00','0.00']);
  if(month===7)rows.push([17,'Refund reversal fictional customer','0.00','10000.00']);
  if(month===8)rows.push([19,'NEFT FICTIONAL-AMBIGUOUS-A','25000.00','0.00']);
  if(month===9)rows.push([20,'UPI FICTIONAL-AMBIGUOUS-B','0.00','5000.00']);
  for(const [day,description,credit,debit] of rows.sort((a,b)=>a[0]-b[0])){n++;const suggestion=suggest(description,credit!=='0.00');ledger.transactions.push({id:String(n).padStart(64,'0'),account:'fictional-operating',date:`2026-${m}-${String(day).padStart(2,'0')}`,description,reference:'FICTIONAL-'+n,credit,debit,balance:null,category:suggestion.category,suggestion:suggestion.category,reason:suggestion.reason,reviewed:false,importIds:[importId]});}
 }
 ledger.imports.push({id:importId,hash:'fictional-demo-only',filename:'fictional-six-month-bank-statement.csv',mime:'text/csv',account:'fictional-operating',...DEMO_STATEMENT_PERIOD,coverageConfirmed:false,confirmed:false,at:'2026-10-26T00:00:00Z',file:'',transactionIds:ledger.transactions.map(t=>t.id)});return ledger;
}
