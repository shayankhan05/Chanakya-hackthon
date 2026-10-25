import {test} from 'node:test';
import assert from 'node:assert/strict';
import {growthMilestones} from '../lib/growth-milestones';
import {demoWorkspace} from '../lib/workspace';
import {noChanges,runScenario} from '../lib/chat-scenarios';
test('growth radar derives hiring reviews from the same simulator without changing saved records',()=>{const w=demoWorkspace('judge'),before=JSON.stringify(w);const card=growthMilestones(w)[0];assert.equal(card.target,10);const changes=noChanges();changes.employees={operation:'set',value:10};const result=runScenario(w,changes);assert.ok(result.ok);if(result.ok)assert.deepEqual(card.rules,result.impacts.filter(i=>i.triggeredBy.length&&i.after!=='Not applicable'&&i.change!=='Unchanged').map(i=>i.ruleId));assert.equal(JSON.stringify(w),before);});
test('growth radar never invents staff allocation for a multi-workplace hiring preview',()=>{const w=demoWorkspace('judge');w.profile.branches=2;w.profile.branchLocations=[{state:'Karnataka',city:'Bengaluru',employees:4},{state:'Karnataka',city:'Mysuru',employees:4}];const card=growthMilestones(w)[0];assert.deepEqual(card.rules,[]);assert.match(card.note,/allocated across workplaces/);});
test('growth radar export and branch previews preserve profile registrations and tasks',()=>{const w=demoWorkspace('judge'),before=JSON.stringify(w),cards=growthMilestones(w);assert.equal(cards.length,3);assert.equal(cards[1].input.branches?.state,w.profile.state);assert.equal(cards[2].input.exports,true);assert.equal(JSON.stringify(w),before);});
