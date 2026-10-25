import type {PlanningInput,ScheduledTask} from './solver';
import {paise} from '../calculators';
// Independent exhaustive oracle for tiny datasets only. It does not call the production candidate generator.
export function bruteForceOracle(p:PlanningInput){if(p.tasks.length>5)throw Error('Oracle is limited to five tasks.');let best=-1;const mandatory=new Set(p.tasks.filter(t=>t.mandatory||t.deadlineKind==='verified').map(t=>t.id));let changed=true;while(changed){changed=false;for(const t of p.tasks)if(mandatory.has(t.id))for(const d of t.dependencies)if(!mandatory.has(d)){mandatory.add(d);changed=true;}}
 for(let mask=0;mask<(1<<p.tasks.length);mask++){const chosen=p.tasks.filter((_,i)=>mask&(1<<i)),ids=new Set(chosen.map(t=>t.id));if([...mandatory].some(id=>!ids.has(id))||chosen.some(t=>t.dependencies.some(id=>!ids.has(id)))||chosen.reduce((n,t)=>n+paise(t.cost),0n)>paise(p.budget)||chosen.reduce((n,t)=>n+t.hours,0)>p.availableHours)continue;const value=chosen.filter(t=>!mandatory.has(t.id)).reduce((n,t)=>n+t.importance,0);if(value<=best)continue;
 let found=false;
 const visit=(i:number,s:ScheduledTask[])=>{if(found)return;if(i===chosen.length){if(s.some(x=>chosen.find(t=>t.id===x.taskId)!.dependencies.some(d=>s.find(a=>a.taskId===d)!.finish>x.start)))return;found=true;return;}
 const task=chosen[i];for(const id of task.allowedPeople){const person=p.people.find(a=>a.id===id)!;const hours:number[]=[];person.dailyHours.forEach((n,d)=>{for(let h=0;h<n;h++)hours.push(d*p.hoursPerDay+h);});for(let start=0;start+task.hours<=hours.length;start++){const slots=hours.slice(start,start+task.hours);if(slots.at(-1)!+1>(task.dueDay??p.days)*p.hoursPerDay||s.some(a=>a.personId===id&&a.slots.some(slot=>slots.includes(slot))))continue;visit(i+1,[...s,{taskId:task.id,personId:id,slots,start:slots[0],finish:slots.at(-1)!+1,cost:task.cost,mandatory:mandatory.has(task.id)}]);}}
 };visit(0,[]);if(found)best=value;
 }return {feasible:best>=0,advisoryValue:best};}
