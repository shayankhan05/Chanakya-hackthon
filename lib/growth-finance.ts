import {z} from 'zod';
import {paise,decimal,calculate,payrollSchema} from './calculators';
import type {Workspace} from './domain';
import {businessSchema} from './profile-schema';
import {simulate} from './engine';
const money=z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/);
export const financeSchema=z.object({plannedEmployees:z.number().int().min(0).max(1000000),grossPerNewEmployee:money,months:z.number().int().min(1).max(12),startDate:z.iso.date(),budget:money,phases:z.array(z.object({month:z.number().int().min(1).max(12),hires:z.number().int().min(1).max(1000000)}).strict()).max(12),contributions:z.array(z.object({phaseMonth:z.number().int().min(1).max(12),employees:z.number().int().min(1).max(1000000),calculation:payrollSchema}).strict()).max(24)}).strict();
export type FinanceInput=z.infer<typeof financeSchema>;
export function growthFinance(w:Workspace,raw:unknown){
 const input=financeSchema.parse(raw),additional=input.plannedEmployees-w.profile.employees;
 if(additional<0)throw Error('This expansion calculator supports hiring only. Planned headcount cannot be below the saved count. Use the existing planner to review reductions.');
 if(input.phases.some(p=>p.month>input.months)||new Set(input.phases.map(p=>p.month)).size!==input.phases.length)throw Error('Use unique hiring months within the projection horizon.');
 if(input.phases.reduce((n,p)=>n+p.hires,0)!==additional)throw Error('The hiring phases must add up to the planned employee increase.');
 for(const c of input.contributions){const phase=input.phases.find(p=>p.month===c.phaseMonth);if(!phase||c.employees>phase.hires)throw Error('Contribution cohort counts must fit an explicit hiring phase.');}
 if(new Set(input.contributions.map(c=>c.phaseMonth+':'+c.calculation.scheme)).size!==input.contributions.length)throw Error('Use at most one wage cohort per scheme and hiring phase; heterogeneous wages require separate reviewed calculations.');
 const profile=structuredClone(w.profile);profile.employees=input.plannedEmployees;if(profile.branchLocations.length===1)profile.branchLocations[0].employees=profile.employees;
 if(profile.branchLocations.length>1&&additional)throw Error('Allocate the additional employees across workplaces in the detailed growth planner first; this financial view cannot assume where they work.');
 if(profile.eligibleEsiEmployees!==null&&profile.eligibleEsiEmployees>profile.employees)profile.eligibleEsiEmployees=null;
 const checked=businessSchema.parse(profile),comparison=simulate(w,checked,input.startDate+'T12:00:00Z');
 const gross=paise(input.grossPerNewEmployee),missing:string[]=['New establishment coverage can also affect existing employees; their additional employer costs need separate reviewed employee data and are not included here.'],contributionRows:{month:number;scheme:string;employees:number;employer:string|null;reason:string}[]=[];
 let grossTotal=0n,contributionTotal=0n;const monthly=[];
 for(let month=1;month<=input.months;month++){
  const count=input.phases.filter(p=>p.month<=month).reduce((n,p)=>n+p.hires,0),payroll=gross*BigInt(count);grossTotal+=payroll;let contributions=0n;
  const start=new Date(input.startDate+'T12:00:00Z');const day=Number(input.startDate.slice(-2));const last=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+month,0)).getUTCDate();const date=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+month-1,Math.min(day,last),12)).toISOString().slice(0,10);
  for(const c of input.contributions.filter(c=>c.phaseMonth<=month)){
   const result=calculate({...c.calculation,date});const required=comparison.findings.find(f=>f.ruleId===c.calculation.scheme);
   const supported=result.status==='estimate'&&required?.outcome==='Applicable';
   const value=result.breakdown.find(b=>b.label===(c.calculation.scheme==='EPF'?'Employer total EPF + EPS':'Employer ESI'));
   const amount=supported&&value?paise(value.amount)*BigInt(c.employees):null;
   if(amount!==null){contributions+=amount;contributionTotal+=amount;}
   const reason=amount!==null?'Confirmed cohort inputs; dated calculator parameters apply.':'Not included: '+(required?.outcome!=='Applicable'?'Establishment coverage is not confirmed by the saved/planned facts. ':result.warnings.join(' '));
   contributionRows.push({month,scheme:c.calculation.scheme,employees:c.employees,employer:amount===null?null:decimal(amount),reason});
  }
  monthly.push({month,date,newEmployees:count,grossChange:decimal(payroll),supportedEmployerContributions:decimal(contributions),knownCost:decimal(payroll+contributions)});
 }
 for(const scheme of ['EPF','ESI']){if(!input.contributions.some(c=>c.calculation.scheme===scheme))missing.push(`${scheme}: confirmed coverage, employee eligibility, statutory wage base, dated rates and cohort distribution were not supplied; no contribution amount is assumed.`);else if(input.phases.some(p=>!input.contributions.some(c=>c.phaseMonth===p.month&&c.calculation.scheme===scheme&&c.employees===p.hires)))missing.push(`${scheme}: not every new employee cohort is covered by confirmed inputs. Unspecified employee costs remain unknown.`);}
 if(contributionRows.some(r=>r.employer===null))missing.push('Some projected contribution periods or eligibility conditions are unsupported. Those amounts are excluded, not treated as legally zero.');
 const total=grossTotal+contributionTotal,budget=paise(input.budget);return {input,additionalEmployees:additional,currentEmployees:w.profile.employees,plannedEmployees:input.plannedEmployees,monthlyGrossChange:decimal(gross*BigInt(additional)),annualSteadyGrossChange:decimal(gross*BigInt(additional)*12n),horizonGrossCost:decimal(grossTotal),supportedEmployerContributions:decimal(contributionTotal),knownExpansionCost:decimal(total),budgetShortfall:decimal(total>budget?total-budget:0n),budgetStatus:total>budget?'known-cost-shortfall':'within-known-costs',completeCostEstimate:false,monthly,contributionRows,missing,comparison,assumptions:['All new hires use the explicitly entered gross monthly wage; existing employee wages are unchanged.','Every hire starts at the beginning of its stated projection month.','Gross wages are never substituted for EPF/ESI statutory contribution bases. Only confirmed, supported dated cohort estimates are included.','Known expansion cost excludes unknown statutory amounts, EDLI, administration charges, recruitment, equipment, benefits, preparation fees and tax. It is not a complete cost or budget clearance.','Future rule changes are not verified. Contribution amounts beyond the existing source-review date are withheld.'],businessFacts:{state:w.profile.state,workplaces:w.profile.branchLocations,registrations:w.profile.registrations},nonDestructive:true};
}
