import {z} from 'zod';
import {locations} from './locations';

// Monetary inputs cross JSON boundaries as decimal strings. All arithmetic uses integer paise.
const money=z.string().regex(/^\d{1,11}(?:\.\d{1,2})?$/,'Enter a non-negative rupee amount with at most two decimals.');
const date=z.iso.date();
const state=z.string().refine(s=>Object.keys(locations).some(k=>k.toLowerCase()===s.trim().toLowerCase()),'Choose a supported Indian state or union territory.');
export function paise(s:string){money.parse(s);const [a,b='']=s.split('.');return BigInt(a)*100n+BigInt(b.padEnd(2,'0'));}
export function decimal(n:bigint){return `${n/100n}.${String(n%100n).padStart(2,'0')}`;}
const round=(n:bigint,d:bigint)=>(n+d/2n)/d;
const min=(a:bigint,b:bigint)=>a<b?a:b;
export const gstSchema=z.object({kind:z.literal('gst'),date,registered:z.enum(['Yes','No','Unknown']),supply:z.enum(['Goods','Services','Both']),supplierState:state,placeOfSupply:state,treatment:z.enum(['ordinary','exempt','zero-rated-lut']),specialScheme:z.boolean(),reverseCharge:z.boolean(),classificationConfirmed:z.boolean(),lines:z.array(z.object({description:z.string().min(1).max(200),classification:z.string().max(20),amount:money,inclusive:z.boolean(),rate:z.string().regex(/^\d{1,2}(?:\.\d{1,2})?$/).refine(s=>Number(s)<=40,'Rate must be between 0 and 40; verify the notified rate separately.')})).min(1).max(50),credit:z.object({igst:money,cgst:money,sgst:money}),creditConfirmed:z.boolean()}).strict();
export const incomeSchema=z.object({kind:z.literal('income'),taxpayer:z.enum(['Partnership','LLP','Company','Individual']),financialYear:z.string().max(10),regime:z.string().max(40),taxableIncome:money,adjustmentsConfirmed:z.boolean(),ordinaryIncomeOnly:z.boolean()}).strict();
export const payrollSchema=z.object({kind:z.literal('payroll'),scheme:z.enum(['EPF','ESI']),date,covered:z.boolean(),eligible:z.boolean(),wageBase:money,parametersConfirmed:z.boolean(),rate:z.enum(['12','10']),epsEligible:z.boolean(),epsWageBase:money,averageDailyWage:money,continuingEsiPeriod:z.boolean()}).strict();
export const calculationSchema=z.discriminatedUnion('kind',[gstSchema,incomeSchema,payrollSchema]);
export type CalculationInput=z.infer<typeof calculationSchema>;
export type CalculationResult={kind:string;status:'estimate'|'needs-review';title:string;breakdown:{label:string;amount:string}[];warnings:string[];assumptions:string[];sourceIds:string[];lines?:{description:string;taxable:string;gst:string;total:string}[];allocation?:{credit:string;liability:string;amount:string}[];inputs:CalculationInput};
export function calculate(raw:unknown):CalculationResult{
 const x=calculationSchema.parse(raw);const base:CalculationResult={kind:x.kind,status:'estimate',title:'Illustrative estimate — not a government assessment',breakdown:[],warnings:[],assumptions:[],sourceIds:[],inputs:x};
 const blocked=(message:string)=>({...base,status:'needs-review' as const,warnings:[message]});
 if(x.kind==='gst'){
  base.sourceIds=['GST-VALUE','GST-CREDIT','GST-CLASSIFICATION','GST-EXPORT'];
  if(x.date<'2019-03-29')return blocked('Credit-allocation support starts with Rule 88A on 29 March 2019. Earlier periods need separate dated rules.');
  if(x.date>'2026-10-25')base.warnings.push('Future supply date: later rate and rule changes have not been verified. Arithmetic uses your assumed inputs.');
  if(x.specialScheme||x.reverseCharge)return blocked('Composition/special schemes and reverse-charge liabilities require a separate review; ordinary invoice arithmetic is not applicable.');
  if(x.treatment!=='ordinary'&&x.lines.some(l=>Number(l.rate)!==0))return blocked('Exempt and zero-rated supplies without payment of tax must use a zero output rate. Confirm the exemption or LUT conditions.');
  const intra=x.supplierState.toLowerCase().trim()===x.placeOfSupply.toLowerCase().trim();
  let taxable=0n,total=0n,tax=0n,c=0n,s=0n,i=0n;
  base.lines=x.lines.map(l=>{const amount=paise(l.amount),rate=paise(l.rate);const gst=x.treatment!=='ordinary'?0n:l.inclusive?round(amount*rate,10000n+rate):round(amount*rate,10000n);const value=l.inclusive?amount-gst:amount,invoice=value+gst;taxable+=value;tax+=gst;total+=invoice;if(intra){const central=round(gst,2n);c+=central;s+=gst-central;}else i+=gst;return {description:l.description,taxable:decimal(value),gst:decimal(gst),total:decimal(invoice)};});
  const liability={igst:i,cgst:c,sgst:s},credit={igst:paise(x.credit.igst),cgst:paise(x.credit.cgst),sgst:paise(x.credit.sgst)};
  const hasCredit=Object.values(credit).some(n=>n>0n);if(hasCredit&&!x.creditConfirmed)return blocked('Confirm eligible and reconciled credit by tax head before estimating net liability.');
  if(x.treatment==='exempt'&&hasCredit)return blocked('Exempt supplies can require ITC restrictions or reversals. This ordinary-credit calculator cannot determine those adjustments.');
  base.allocation=[];
  function use(a:keyof typeof credit,b:keyof typeof liability,limit?:bigint){const n=min(min(credit[a],liability[b]),limit??credit[a]);credit[a]-=n;liability[b]-=n;if(n)base.allocation!.push({credit:a.toUpperCase(),liability:b.toUpperCase(),amount:decimal(n)});}
  use('igst','igst');
  // Exhaust IGST first; direct it to deficits before consuming amounts coverable by own-head credits.
  use('igst','cgst',c>credit.cgst?c-credit.cgst:0n);use('igst','sgst',s>credit.sgst?s-credit.sgst:0n);use('igst','cgst');use('igst','sgst');
  use('cgst','cgst');use('sgst','sgst');use('cgst','igst');use('sgst','igst');
  base.breakdown=[['Taxable value',taxable],['Output GST',tax],['Invoice total',total],[intra?'CGST':'IGST',intra?c:i],...(intra?[[x.supplierState==='Chandigarh'||x.supplierState==='Ladakh'||x.supplierState==='Andaman and Nicobar Islands'||x.supplierState==='Lakshadweep'||x.supplierState==='Dadra and Nagar Haveli and Daman and Diu'?'UTGST':'SGST',s]]:[]),['Estimated cash liability',liability.igst+liability.cgst+liability.sgst],['Remaining IGST credit',credit.igst],['Remaining CGST credit',credit.cgst],['Remaining state/UT credit',credit.sgst]].map(([label,amount])=>({label:String(label),amount:decimal(amount as bigint)}));
  if(x.registered!=='Yes')base.warnings.push('GST registration is not confirmed. These figures are arithmetic only, not permission to charge GST. Review registration separately.');
  if(!x.classificationConfirmed||x.lines.some(l=>!l.classification))base.warnings.push('HSN/SAC and notified rate are not verified. The selected rates are assumptions; industry alone cannot determine a rate.');
  if(x.treatment==='zero-rated-lut')base.warnings.push('Zero output tax assumes an eligible zero-rated supply under a valid LUT/bond without payment. Export conditions and refund eligibility are not determined.');
  base.warnings.push('Unused credit is not a cash refund. RCM, blocked credit, reversals, cess, interest, late fees and minimum-cash rules are excluded.');
  base.assumptions=['Ordinary supply; supplier state and user-confirmed legal place of supply determine the tax split. Special place-of-supply rules need review.','IGST credit first; no CGST-to-SGST or SGST-to-CGST use. Amounts rounded half-up per invoice line to paise; returns may require statutory rupee rounding.'];return base;
 }
 if(x.kind==='income'){
  base.sourceIds=['INCOME-FIRM'];
  if(!['Partnership','LLP'].includes(x.taxpayer))return blocked('A numerical estimate is currently supported only for ordinary-income partnership firms and LLPs. Individuals and companies need independently verified regimes and additional facts.');
  if(x.financialYear!=='2025-26'||x.regime!=='ordinary')return blocked('Only FY 2025-26 / AY 2026-27 ordinary firm taxation is verified in this calculator. Other years and regimes are not extrapolated.');
  if(!x.adjustmentsConfirmed||!x.ordinaryIncomeOnly)return blocked('Confirm reconciled taxable income after lawful expenses, deductions and adjustments, with no special-rate income, AMT, foreign tax credits or other excluded conditions. Accounting profit alone is insufficient.');
  const income=round(paise(x.taxableIncome),1000n)*1000n,tax=round(income*30n,100n),threshold=1000000000n;let surcharge=income>threshold?round(tax*12n,100n):0n;
  // Marginal relief: tax plus surcharge cannot exceed tax at Rs 1 crore plus excess income.
  if(income>threshold){const max=round(threshold*30n,100n)+income-threshold;surcharge=min(surcharge,max-tax);}
  const cess=round((tax+surcharge)*4n,100n),sum=tax+surcharge+cess;
  base.breakdown=[['Taxable income',income],['Income tax at 30%',tax],['Surcharge after marginal relief',surcharge],['Health and Education Cess at 4%',cess],['Estimated tax rounded to nearest ₹10',round(sum,1000n)*1000n]].map(([label,amount])=>({label:String(label),amount:decimal(amount as bigint)}));
  base.sourceIds.push('INCOME-ROUNDING');base.assumptions=['FY 2025-26 only; ordinary partnership/LLP income, 12% surcharge above ₹1 crore with marginal relief, then 4% cess. Taxable income and final tax rounded to the nearest ₹10.'];base.warnings=['Not the balance payable: TDS/TCS, advance tax, interest and tax credits are not deducted. GST is separate.'];return base;
 }
 base.sourceIds=[x.scheme==='EPF'?'EPF-CONTRIBUTION':'ESI-CONTRIBUTION','LABOUR-TRANSITION'];
 if(x.date<'2025-11-21'||x.date>'2026-10-25')return blocked('This conditional payroll estimator covers contribution dates from 21 November 2025 through the source review date, 25 October 2026. Other periods need independently verified parameters.');
 if(!x.covered||!x.eligible||!x.parametersConfirmed)return blocked('Confirm establishment coverage, employee eligibility, the applicable dated wage definition/base and contribution parameters. Headcount or gross salary alone is insufficient.');
 const wage=paise(x.wageBase);if(wage===0n)return blocked('Enter a positive confirmed statutory monthly wage base.');
 if(x.scheme==='EPF'){
  // Do not silently select an outdated ceiling following the 2026 portal revision notice.
  const eps=paise(x.epsWageBase);if(x.epsEligible&&eps>wage)return blocked('The confirmed EPS wage base cannot exceed the EPF contribution base.');
  const employee=round(wage*BigInt(x.rate),10000n)*100n,employer=employee,pension=x.epsEligible?round(eps*833n,1000000n)*100n:0n;
  if(pension>employer)return blocked('EPS allocation exceeds the employer contribution; review eligibility and bases.');
  base.breakdown=[['Confirmed EPF wage base',wage],['Employee EPF',employee],['Employer total EPF + EPS',employer],['Employer EPS allocation',pension],['Employer EPF balance',employer-pension]].map(([label,amount])=>({label:String(label),amount:decimal(amount as bigint)}));
  base.warnings=['No automatic wage ceiling is selected: EPFO reports a recent ₹15,000 to ₹25,000 revision. Verify the notification, effective date and separate EPS ceiling/options before confirming your bases. EDLI, administration charges, voluntary higher contributions and exemptions are excluded.'];
  base.assumptions=[`User-confirmed ${x.rate}% category and statutory EPF/EPS bases for ${x.date}; no headcount-based rate inference. Contributions rounded per employee to the nearest rupee. This is conditional arithmetic, not an eligibility determination.`];
 }else{
  if(wage>2100000n&&!x.continuingEsiPeriod)return blocked('Above the ordinary ₹21,000 entry ceiling: confirm continuing coverage in the contribution period. Disability and other special eligibility cases require separate review.');
  const daily=paise(x.averageDailyWage);if(daily===0n)return blocked('Confirm average daily wages to check the employee-contribution exemption.');
  const ee=daily<=17600n?0n:((wage*75n+999999n)/1000000n)*100n,er=((wage*325n+999999n)/1000000n)*100n;
  base.breakdown=[['Confirmed ESI wage base',wage],['Employee ESI',ee],['Employer ESI',er],['Combined contribution',ee+er]].map(([label,amount])=>({label:String(label),amount:decimal(amount as bigint)}));
  const year=Number(x.date.slice(0,4)),month=Number(x.date.slice(5,7));const period=month>=4&&month<=9?`April–September ${year}`:month>=10?`October ${year}–March ${year+1}`:`October ${year-1}–March ${year}`;
  base.assumptions=[`Contribution period: ${period}. Employee 0.75%, employer 3.25%; each contribution rounded up to the next rupee. Employee share is zero where confirmed average daily wages do not exceed ₹176.`];
  base.warnings=['User confirms the dated parameters and current contribution-period eligibility. Wage ceilings do not cap contribution wages for an employee who remains covered. Special categories and transition notifications require review.'];
 }return base;
}
