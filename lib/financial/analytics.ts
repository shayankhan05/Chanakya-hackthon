import type {Workspace} from '../domain';
import {classify,evaluateBusiness} from '../engine';
import {rulesForState} from '../legal-catalogue';
import {paise,rupees,roundedDivide} from './money';
import type {FinancialLedger,FinancialSummary,MonthlyFinance} from './types';
export function financialYear(date:string){const year=Number(date.slice(0,4))-(Number(date.slice(5,7))<4?1:0);return `${year}-${String(year+1).slice(2)}`;}
const monthName=(year:number,i:number)=>`${year+Math.floor((i+3)/12)}-${String((i+3)%12+1).padStart(2,'0')}`;
const monthEnd=(month:string)=>new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).toISOString().slice(0,10);
function covered(from:string,to:string,intervals:{from:string;to:string}[]){let current=from;for(const interval of [...intervals].sort((a,b)=>a.from.localeCompare(b.from))){if(interval.to<current)continue;if(interval.from>current)return false;if(interval.to>=to)return true;current=new Date(Date.parse(interval.to+'T00:00:00Z')+86400000).toISOString().slice(0,10);}return false;}
export function analyzeFinancials(ledger:FinancialLedger,w:Workspace,asOf:string,method:'average'|'weighted'='average'):FinancialSummary{
 const fy=financialYear(asOf),year=Number(fy.slice(0,4)),allMonths=Array.from({length:12},(_,i)=>monthName(year,i)),elapsed=allMonths.filter(m=>monthEnd(m)<asOf),imports=ledger.imports,confirmedIds=new Set(imports.filter(i=>i.confirmed).map(i=>i.id));
 const active=ledger.transactions.filter(t=>t.importIds.some(id=>confirmedIds.has(id))),months:MonthlyFinance[]=[],accounts=[...new Set(imports.map(i=>i.account))];
 for(const month of [...new Set(ledger.transactions.map(t=>t.date.slice(0,7)))].sort()){
  const rows=active.filter(t=>t.date.startsWith(month));let received=0n,paid=0n,sales=0n,operating=0n;
  for(const t of ledger.transactions.filter(t=>t.date.startsWith(month))){received+=paise(t.credit);paid+=paise(t.debit);}
  for(const t of rows){const c=paise(t.credit),d=paise(t.debit);if(t.reviewed&&t.category==='Customer sales receipt')sales+=c;if(t.reviewed&&['Business expense','Salary expense','Rent'].includes(t.category))operating+=d;}
  const pending=ledger.transactions.filter(t=>t.date.startsWith(month)&&(!t.reviewed||!t.importIds.some(id=>confirmedIds.has(id)))).length;
  const complete=accounts.length>0&&accounts.every(account=>covered(month+'-01',monthEnd(month),imports.filter(i=>i.account===account&&i.confirmed&&i.coverageConfirmed)))&&pending===0;
  months.push({month,received:rupees(received),paid:rupees(paid),salesReceipts:rupees(sales),operatingPayments:rupees(operating),netCashMovement:rupees(received-paid),estimatedCashSurplus:rupees(sales-operating),needsReview:pending,complete});
 }
 for(const month of elapsed)if(!months.some(m=>m.month===month)&&accounts.length&&accounts.every(account=>covered(month+'-01',monthEnd(month),imports.filter(i=>i.account===account&&i.confirmed&&i.coverageConfirmed))))months.push({month,received:'0.00',paid:'0.00',salesReceipts:'0.00',operatingPayments:'0.00',netCashMovement:'0.00',estimatedCashSurplus:'0.00',needsReview:0,complete:true});
 months.sort((a,b)=>a.month.localeCompare(b.month));
 const complete=elapsed.map(m=>months.find(x=>x.month===m)).filter((m):m is MonthlyFinance=>!!m?.complete),missing=elapsed.filter(m=>!complete.some(x=>x.month===m)),pendingReview=ledger.transactions.filter(t=>!t.reviewed).length,unconfirmed=imports.filter(i=>!i.confirmed).length;
 const sufficient=complete.length>=(method==='weighted'?6:3)&&missing.length===0&&elapsed.length>0;
 // A separate annualized proxy can use four complete months even when FY coverage has gaps.
 // Never count receipts from the partial boundary months, or treat those months as zero.
 const annualized=!sufficient&&complete.length>=4,sales=complete.reduce((n,m)=>n+paise(m.salesReceipts),0n),usedMethod=annualized?'average':method;
 let rate:bigint|null=null;if(sufficient||annualized)rate=usedMethod==='average'?roundedDivide(sales,BigInt(complete.length)):roundedDivide(complete.slice(-3).reduce((n,m,i)=>n+paise(m.salesReceipts)*BigInt(i+1),0n),6n);
 // Annualize before rounding: rounding a monthly rate first can introduce several paise of drift.
 const projected=annualized?roundedDivide(sales*12n,BigInt(complete.length)):rate===null?null:sales+rate*BigInt(12-elapsed.length);
 const projection:FinancialSummary['projection']={
  status:annualized?'provisional':sufficient?'estimate':'insufficient',basis:annualized?'annualized-run-rate':sufficient?'fy-forecast':'insufficient',method:usedMethod,requestedMethod:method,
  monthsUsed:complete.map(m=>m.month),dataQualityWarning:annualized?'Partial or missing FY months were excluded. This annualized run-rate assumes the available complete months represent the full year and does not adjust for seasonality. It is not verified annual turnover, statutory GST turnover or accounting profit.':'Classifications and account coverage are owner-confirmed, not audited. Bank receipts alone do not establish verified turnover or accounting profit.',
  completeMonths:complete.length,missingMonths:missing,salesToDate:rupees(sales),monthlyRunRate:rate===null?null:rupees(rate),projectedSales:projected===null?null:rupees(projected),
  cutoff:annualized?monthEnd(complete.at(-1)!.month):elapsed.length?monthEnd(elapsed.at(-1)!):`${year}-03-31`,
  assumptions:[`India FY ${fy}, April to March. Only complete, owner-confirmed, closed months are used; current/open months and partial boundary months are excluded.`,
   ...(annualized?[`Simple annualized run-rate = confirmed customer receipts from ${complete.length} complete months (₹${rupees(sales)}) ÷ ${complete.length} × 12. The annual result is rounded once to the nearest paise.`,
    ...(method==='weighted'?['The selected weighted FY forecast lacks its required coverage. Showing a provisional simple annualized average instead; this is not a weighted forecast.']:[])]:[method==='average'?'Average of all complete FY months; minimum three months and no missing elapsed FY months.':'Latest three complete months weighted 1:2:3, with at least six complete FY months and no missing elapsed months.','FY projection = reviewed customer receipts in completed FY months + rounded monthly run-rate × remaining FY months.']),
   'Coverage and classifications are owner-confirmed, not audited. Unpaid invoices, cash sales, other accounts, GST components and accrual adjustments may change actual sales and statutory turnover.']
 };
 const warnings:FinancialSummary['warnings']=[];
 if(projection.projectedSales!==null){const forecast=paise(projection.projectedSales),hypothetical={...w.profile,turnover:Number(projection.projectedSales),financialYear:fy},current=evaluateBusiness(w.profile,asOf,w.findings),planned=evaluateBusiness(hypothetical,asOf,w.findings),gst=planned.find(f=>f.ruleId==='GST')!,match=gst.facts.find(f=>f.startsWith('Screening threshold:'))?.match(/Rs (\d+)/),limit=match?BigInt(match[1])*100n:null;
  for(const id of ['GST','UDYAM']){const rule=rulesForState(w.profile.state).find(r=>r.id===id)!,before=current.find(f=>f.ruleId===id)!,after=planned.find(f=>f.ruleId===id)!,near=id==='GST'&&limit!==null&&forecast*100n>=limit*80n,bandChange=id==='UDYAM'&&classify(w.profile,asOf).category!==classify(hypothetical,asOf).category;
   if(near||bandChange||before.outcome!==after.outcome)warnings.push({id:`financial:${fy}:${id}:v${rule.version}`,ruleId:id,version:rule.version,sourceUrl:rule.sourceUrl,message:`Provisional ${id} review: ${annualized?'the provisional annualized sales estimate':'projected FY customer receipts'} of ₹${projection.projectedSales} ${near?'approach or exceed the catalogue screening threshold':'could change the current screening result'}. This is a bank-receipt-based sales proxy, not confirmed statutory turnover. Declared turnover stays unchanged.`,missing:[...new Set([...after.missing,'Reconcile invoices, cash and all relevant accounts','Confirm the applicable turnover definition, supply treatment and financial year',...(id==='UDYAM'?['Verify investment and export adjustments']:[])])]});
  }
 }
 return {asOf,financialYear:fy,ownerDeclaredTurnover:w.profile.turnover.toFixed(2),confirmedSupplyFigure:ledger.confirmedFigure||null,months,pendingReview,unconfirmedImports:unconfirmed,accountingRevenue:null,accountingExpenses:null,accountingProfit:null,projection,warnings,reviewTasks:warnings.map(warning=>({id:warning.id+':review',title:`Review ${warning.ruleId} turnover evidence`,reason:warning.message,steps:warning.missing,sourceUrl:warning.sourceUrl})),limitations:['Bank receipts are not automatically sales or GST aggregate turnover.','Operating cash surplus is reviewed customer receipts minus reviewed business expense, salary and rent payments. Taxes, loans, owner movements, transfers and refunds remain separate. Refunds require invoice reconciliation before net sales can be established.','No invoice or accrual-adjustment import is implemented. Accounting revenue, accounting expenses and accounting profit remain unavailable.','80% of the existing GST screening threshold is an advisory product setting, not a statutory trigger. Forecasts do not change definitive findings or create registration tasks.']};
}
