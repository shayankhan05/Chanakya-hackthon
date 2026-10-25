import type {Workspace} from '../domain';
import {assessDeadline,daysBetween,indiaDate} from '../deadlines';
import {planningSchema,type PlanningInput} from './solver';
export function planningBasis(w:Workspace){return JSON.stringify({profile:{...w.profile,payrollNotes:undefined},tasks:w.tasks.map(t=>({id:t.id,status:t.status,legalDueDate:t.legalDueDate,deadlineVerification:t.deadlineVerification,archived:t.archived}))});}
export function authorizePlanInput(w:Workspace,raw:unknown,startDate=indiaDate()):PlanningInput{
 const input=planningSchema.parse(raw);if(input.fictional)return input;
 const active=w.tasks.filter(t=>!t.archived&&t.status!=='Completed');
 const isRequired=(id:string)=>{const t=active.find(a=>a.id===id)!;return assessDeadline(t,w).verified||w.findings.some(f=>f.ruleId===t.ruleId&&f.outcome==='Applicable');};
 if(active.some(t=>isRequired(t.id)&&!input.tasks.some(a=>a.id===t.id)))throw Error('Include every unfinished confirmed screening requirement and verified-deadline task. Mandatory work cannot be silently excluded.');
 return planningSchema.parse({...input,tasks:input.tasks.map(t=>{const stored=active.find(a=>a.id===t.id);if(!stored)throw Error('A planning task must belong to this business and be unfinished.');const verified=assessDeadline(stored,w).verified;const due=verified?Math.max(0,daysBetween(startDate,stored.legalDueDate!)+1):null;return {...t,title:stored.title,mandatory:t.mandatory||isRequired(t.id),dueDay:due!==null&&due<=input.days?due:null,deadlineKind:due!==null&&due<=input.days?'verified':t.deadlineKind==='planning-target'?'planning-target':'none',deadlineSource:verified?(stored.deadlineVerification!.sourceUrl+' '+stored.deadlineVerification!.provision):''};})});
}
