import {demoWorkspace} from './workspace';
import {evaluateBusiness} from './engine';
import type {Outcome} from './domain';
export function growthTransitionChecks(){
 const rows:{name:string;actual:Outcome|undefined;expected:Outcome;passed:boolean}[]=[];
 const add=(name:string,employees:number,id:string,expected:Outcome,patch:Record<string,unknown>={},at='2026-10-25')=>{const w=demoWorkspace('judge',at+'T12:00:00Z');const p={...w.profile,...patch,employees,branchLocations:[{state:'Karnataka',city:'Bengaluru',employees}]};const actual=evaluateBusiness(p,at).find(f=>f.ruleId===id)?.outcome;rows.push({name,actual,expected,passed:actual===expected});};
 add('EPF below general threshold with no prior coverage',19,'EPF','Not applicable',{epfExempt:'No'});
 add('EPF at threshold with no declared exemption',20,'EPF','Applicable',{epfExempt:'No'});
 add('EPF exemption unknown requires conditional screening',24,'EPF','Potentially applicable');
 add('EPF prior coverage continues after headcount falls',8,'EPF','Applicable',{priorEpf:'Yes'});
 add('POSH at one-workplace boundary',10,'POSH','Applicable');
 add('POSH below one-workplace boundary',9,'POSH','Not applicable');
 add('ESI threshold still requires notifications and eligibility',10,'ESI','Potentially applicable');
 add('ESI unknown hazardous facts remain missing',8,'ESI','Needs additional information',{hazardous:'Unknown'});
 add('Employee-only growth does not change GST screening',50,'GST','Not applicable');
 add('First export needs a conditional IEC review',8,'IEC','Potentially applicable',{exports:true});
 add('Rule effective date before Social Security Code version is not extrapolated',24,'EPF','Needs additional information',{epfExempt:'No'},'2025-01-01');
 return rows;
}
