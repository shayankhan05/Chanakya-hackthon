import type {BusinessProfile,Finding,WorkTask} from './domain';
import {rulesForState} from './legal-catalogue';
export function ruleDelta(before:BusinessProfile,after:BusinessProfile,previous:Finding[],next:Finding[],existingTasks:WorkTask[],asOf:string){
 const previousRules=rulesForState(before.state),nextRules=rulesForState(after.state);
 const changedFields=(Object.keys(before) as (keyof BusinessProfile)[]).filter(k=>JSON.stringify(before[k])!==JSON.stringify(after[k]));
 const entries=next.map(f=>{const old=previous.find(p=>p.ruleId===f.ruleId),rule=nextRules.find(r=>r.id===f.ruleId),oldRule=previousRules.find(r=>r.id===f.ruleId);const categories:string[]=[];
 if(f.outcome==='Potentially applicable'&&(!old||['Not applicable','Needs additional information'].includes(old.outcome)))categories.push('New potential requirement');
 if(f.outcome==='Applicable'&&old?.outcome!=='Applicable')categories.push('New confirmed screening requirement');
 if(f.outcome==='Applicable'&&old?.outcome==='Applicable')categories.push('Continuing obligation');
 if(f.outcome==='Not applicable'&&old&&['Applicable','Potentially applicable'].includes(old.outcome))categories.push('Screening condition no longer triggered');
 if(f.missing.length||f.outcome==='Needs additional information')categories.push('Additional data required');
 const triggers=changedFields.filter(field=>rule?.triggers.includes(field));const changed=old?.outcome!==f.outcome||JSON.stringify(old?.missing)!==JSON.stringify(f.missing)||old?.version!==f.version||before.state!==after.state;
 if(!categories.length)categories.push('Unchanged screening');
 return {ruleId:f.ruleId,name:f.name,before:old?.outcome||'Not evaluated',after:f.outcome,categories,changed,triggers,reason:f.reason,missing:f.missing,previousVersion:old?.version??null,version:f.version,effectiveFrom:rule?.effectiveFrom,effectiveTo:rule?.effectiveTo||null,previousJurisdiction:oldRule?.jurisdiction,jurisdiction:rule?.jurisdiction,sourceUrl:f.sourceUrl,reference:f.reference,reviewedAt:rule?.reviewedAt,reviewStatus:f.reviewStatus};});
 const newTasks=next.filter(f=>f.outcome!=='Not applicable'&&f.ruleId!=='LICENSE'&&!existingTasks.some(t=>t.key===`${f.ruleId}:v${f.version}:setup`)).map(f=>({key:`${f.ruleId}:v${f.version}:setup`,ruleId:f.ruleId,title:f.actions[0],documents:f.documents,reason:f.reason}));
 return {asOf,changedFields,entries,newTasks,hasChange:changedFields.length>0||entries.some(e=>e.changed),audit:{fromState:before.state,toState:after.state,ruleVersions:entries.map(e=>`${e.ruleId}@${e.version}`),meaning:'Screening transitions, not government coverage determinations. New preparation tasks are proposals until a profile change is saved.'}};
}
export type RuleDelta=ReturnType<typeof ruleDelta>;
