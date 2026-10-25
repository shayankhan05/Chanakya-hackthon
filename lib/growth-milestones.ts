import type {Workspace} from './domain';
import {noChanges,runScenario} from './chat-scenarios';
export function growthMilestones(w:Workspace){
 const target=[10,20,50,100].find(n=>n>w.profile.employees)??w.profile.employees+10;
 const hiring=noChanges();hiring.employees={operation:'set',value:target};
 const branch=noChanges();branch.branches={count:1,state:w.profile.state,city:'Other city'};
 const exporting=noChanges();exporting.exports=true;
 return [{id:'hiring',title:`A team of ${target}`,description:`${target-w.profile.employees} more people than today`,input:hiring,target},{id:'branch',title:'Your next workplace',description:`One more branch in ${w.profile.state}`,input:branch},{id:'exports',title:w.profile.exports?'Review your export activity':'Your first export',description:w.profile.exports?'Check the export facts already recorded':'Explore the change before accepting an order',input:exporting}].map(item=>{
  if(item.id==='hiring'&&w.profile.branchLocations.length>1)return {...item,rules:[],note:'Confirm how new employees will be allocated across workplaces in the detailed planner.'};
  const result=runScenario(w,item.input);
  return {...item,rules:result.ok?result.impacts.filter(i=>i.triggeredBy.length&&i.after!=='Not applicable'&&i.change!=='Unchanged').map(i=>i.ruleId):[],note:result.ok?'Planning preview from your saved facts. Eligibility and exceptions still need checking.':result.clarification};
 });
}
