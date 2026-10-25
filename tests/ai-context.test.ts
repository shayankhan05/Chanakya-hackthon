import {test} from 'node:test';
import assert from 'node:assert/strict';
import type {GenerateContentResponse} from '@google/genai';
import {knowledgeAnswer} from '../lib/assistant';
import {demoWorkspace} from '../lib/workspace';
import {geminiConversation} from '../lib/gemini-provider';
import {geminiConfiguration} from '../lib/gemini-config';
import {parseChatRequest} from '../lib/chat-contract';

test('live-only chat flag survives validation and cannot be silently discarded',()=>{
 const messageId='a7e53ac1-dda6-4f3e-a40e-a88b6d058450';
 const parsed=parseChatRequest({question:'What is my business name?',businessId:'owned-workspace',messageId,requireLive:true},messageId);
 assert.ok('requireLive' in parsed&&parsed.requireLive===true);
 assert.throws(()=>parseChatRequest({question:'What is my business name?',businessId:'owned-workspace',messageId,requireLive:'true'},messageId));
});

test('business start date reads the saved field even after a legal discussion',()=>{
 const w=demoWorkspace('judge');w.profile.startDate='2024-04-01';
 const a=knowledgeAnswer('When did I start my business?',w,[{role:'user',content:'What is GST?'}]);
 assert.equal(a.message,'Your saved business start date is 1 April 2024.');
 assert.deepEqual(a.sources,[]);
});

test('missing business start date stays unknown instead of inventing a date or legal answer',()=>{
 const w=demoWorkspace('judge');w.profile.startDate='';
 assert.match(knowledgeAnswer('When did I start my business?',w).message,/not recorded/);
});

test('model input contains the current saved profile and omits private payroll notes',async()=>{
 const w=demoWorkspace('judge');w.profile.startDate='2023-07-15';w.profile.payrollNotes='PRIVATE PAYROLL';
 const a=await geminiConversation(w,'When did I start my business?',[],async p=>{
  const input=JSON.stringify(p.config?.systemInstruction);assert.ok(input.includes('2023-07-15'));
  assert.ok(input.includes(w.profile.name));assert.ok(!input.includes('PRIVATE PAYROLL'));
  assert.match(String(p.config?.systemInstruction||''),/empty startDate means not recorded/);
  return {candidates:[{content:{role:'model',parts:[{text:'Your saved business start date is 15 July 2023.'}]}}]} as unknown as GenerateContentResponse;
 });
 assert.equal(a.mode,'live'); // Injected transport only; this is not a real provider test.
});

test('whitespace configuration is not reported as a configured live provider',()=>{
 const oldKey=process.env.GEMINI_API_KEY,oldModel=process.env.GEMINI_MODEL;
 try{process.env.GEMINI_API_KEY='  ';process.env.GEMINI_MODEL='  ';
  const c=geminiConfiguration();assert.equal(c.liveConfigured,false);assert.equal(c.apiKey,undefined);assert.equal(c.model,'gemini-3.5-flash-lite');
 }finally{if(oldKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=oldKey;if(oldModel===undefined)delete process.env.GEMINI_MODEL;else process.env.GEMINI_MODEL=oldModel;}
});

