import {test} from 'node:test';
import assert from 'node:assert/strict';
import type {GenerateContentResponse,Content} from '@google/genai';
import {geminiConversation,geminiFunctions} from '../lib/gemini-provider';
import {geminiConfiguration,geminiFailure} from '../lib/gemini-config';
import {demoWorkspace} from '../lib/workspace';

test('Gemini configuration requires its own server credential',()=>{
 const old=process.env.GEMINI_API_KEY;
 try{delete process.env.GEMINI_API_KEY;assert.equal(geminiConfiguration().liveConfigured,false);process.env.GEMINI_API_KEY='  test-only  ';assert.equal(geminiConfiguration().apiKey,'test-only');}
 finally{if(old===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=old;}
});
test('Gemini declarations use its native JSON-schema function format',()=>{
 assert.ok(geminiFunctions.some(f=>f.name==='simulate_business_growth'));
 assert.ok(geminiFunctions.some(f=>f.name==='calculate_tax_or_contribution'));
 for(const f of geminiFunctions)assert.equal((f.parametersJsonSchema as {type:string}).type,'object');
});
test('Gemini tool loop retains signatures, uses authorized facts and preserves workspace',async()=>{
 const w=demoWorkspace('judge');w.profile.payrollNotes='PRIVATE PAYROLL';const before=JSON.stringify(w);let round=0;
 const answer=await geminiConversation(w,'What is my business name?',[],async p=>{
  round++;assert.ok(JSON.stringify(p.config?.systemInstruction).includes('Phoenix Tech Solutions'));assert.ok(!JSON.stringify(p).includes('PRIVATE PAYROLL'));
  if(round===1)return {candidates:[{content:{role:'model',parts:[{functionCall:{name:'read_business_records',args:{section:'profile'},id:'call-1'},thoughtSignature:'signature-fixture'}]}}]} as unknown as GenerateContentResponse;
  const contents=p.contents as Content[];assert.ok(JSON.stringify(contents).includes('signature-fixture'));assert.ok(JSON.stringify(contents).includes('Phoenix Tech Solutions'));
  return {candidates:[{content:{role:'model',parts:[{text:'Your business is Phoenix Tech Solutions.'}]}}]} as unknown as GenerateContentResponse;
 });
 assert.equal(round,2);assert.equal(answer.mode,'live');assert.match(answer.message,/Phoenix/);assert.equal(JSON.stringify(w),before);
});
test('Gemini growth tool targets fifty and never saves the scenario',async()=>{
 const w=demoWorkspace('judge'),before=JSON.stringify(w);let round=0;
 const answer=await geminiConversation(w,'If my employees increase to 50, what changes?',[],async p=>{
  if(++round===1)return {candidates:[{content:{role:'model',parts:[{functionCall:{name:'simulate_business_growth',args:{employees:{operation:'set',value:50},turnover:null,investment:null,branches:null,exports:null,supplies:null}}}]}}]} as unknown as GenerateContentResponse;
  assert.ok(JSON.stringify(p.contents).includes('50'));
  return {candidates:[{content:{role:'model',parts:[{text:'Growing from 8 to 50 employees means reviewing EPF, ESI and POSH. Hiring alone does not change GST.'}]}}]} as unknown as GenerateContentResponse;
 });
 assert.ok(answer.scenario?.ok);if(answer.scenario?.ok)assert.equal(answer.scenario.planned.employees,50);assert.equal(JSON.stringify(w),before);
});
test('Gemini failures remain explicit and sanitized',async()=>{
 const error=Object.assign(new Error(JSON.stringify({error:{status:'INVALID_ARGUMENT',details:[{reason:'API_KEY_INVALID'}],message:'PRIVATE-KEY'}})),{status:400});
 const d=geminiFailure(error);assert.equal(d.code,'API_KEY_INVALID');assert.match(d.reason,/authentication/);assert.ok(!JSON.stringify(d).includes('PRIVATE-KEY'));
 await assert.rejects(geminiConversation(demoWorkspace('judge'),'Hello',[],async()=>{throw error;}));
 assert.match(geminiFailure({status:429}).reason,/quota/);
});

test('native authentication reason is preserved without leaking credentials',()=>{const d=geminiFailure({status:401,message:JSON.stringify({error:{status:'UNAUTHENTICATED',details:[{reason:'ACCESS_TOKEN_TYPE_UNSUPPORTED'}],message:'PRIVATE-KEY'}})});assert.equal(d.code,'ACCESS_TOKEN_TYPE_UNSUPPORTED');assert.match(d.reason,/fresh Gemini API key/);assert.ok(!JSON.stringify(d).includes('PRIVATE-KEY'));});

