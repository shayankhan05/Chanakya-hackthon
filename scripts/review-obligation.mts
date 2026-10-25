import {readFileSync} from 'node:fs';
import {z} from 'zod';
import {loadWorkspace,saveWorkspace} from '../lib/repository';
import {attachDeadlineVerification,indiaDate} from '../lib/deadlines';
import {monitor} from '../lib/engine';
const [path]=process.argv.slice(2);if(!path)throw Error('Usage: review-obligation.mts reviewed-obligation.json. Local trusted reviewer only; never expose this command as a public API.');
const common=z.object({ownerId:z.string().min(1),businessId:z.string().min(1),taskId:z.string().min(1),reviewer:z.string().min(2),note:z.string().min(10)});
const schema=z.discriminatedUnion('action',[
 common.extend({action:z.literal('verify-deadline'),verification:z.object({dueDate:z.iso.date(),ruleId:z.string(),jurisdiction:z.string(),law:z.string(),provision:z.string(),sourceUrl:z.url(),verifiedAt:z.iso.date(),reviewedThrough:z.iso.date(),version:z.string(),applicabilityConfirmed:z.literal(true),extensionsChecked:z.literal(true),consequenceRuleId:z.string().optional(),consequenceVersion:z.string().optional(),obligationType:z.string().optional(),nilReturn:z.boolean().optional(),taxPeriod:z.string().optional(),reliefChecked:z.boolean().optional()})}),
 common.extend({action:z.enum(['review-proof','confirm-fulfilled'])})]);
const data=schema.parse(JSON.parse(readFileSync(path,'utf8'))),w=await loadWorkspace(data.ownerId,data.businessId),t=w.tasks.find(t=>t.id===data.taskId);if(!t)throw Error('Task not found in authorized business.');const at=new Date().toISOString();
if(data.action==='verify-deadline'){if(data.verification.verifiedAt>indiaDate(at))throw Error('Review date cannot be in the future.');Object.assign(t,attachDeadlineVerification(t,{...data.verification,reviewer:data.reviewer}));t.reviewAcknowledgedAt=undefined;}
else{if(!t.completion)throw Error('No completion declaration to review.');if(data.action==='confirm-fulfilled'&&t.completion.state!=='Proof reviewed')throw Error('Review supporting proof or declaration before confirming fulfillment.');Object.assign(t.completion,{state:data.action==='review-proof'?'Proof reviewed':'Obligation confirmed fulfilled',reviewedAt:at,reviewer:data.reviewer,reviewNote:data.note});}
t.history=[...(t.history||[]),{at,actor:data.reviewer,action:data.action,dueDate:t.legalDueDate,completedOn:t.completion?.completedOn,detail:data.note}];await saveWorkspace(data.ownerId,monitor(w,at),w.revision,data.action);console.log('Review saved with audit history. No government filing or automatic evidence verification performed.');


