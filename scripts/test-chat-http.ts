import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {demoWorkspace} from '../lib/workspace';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
const w=demoWorkspace('manufacturing');
const history:{role:'user'|'assistant';content:string}[]=[];
async function ask(question:string,pattern:RegExp){const r=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',origin:base},body:JSON.stringify({question,messageId:randomUUID(),businessId:w.id,demoProfile:w.profile,history:history.slice(-20)})});assert.equal(r.status,200);const d=await r.json();assert.match(d.message,pattern);assert.notEqual(d.message,'The assistant is temporarily unavailable. You can still review your tasks and action plans.');assert.equal(d.mode,'knowledge-base');assert.ok(d.sources.length>0);assert.ok(d.requestId);history.push({role:'user',content:question},{role:'assistant',content:d.message});console.log('PASS '+question+' | HTTP 200 | source-backed local fallback');return d;}
async function main(){
const status=await (await fetch(base+'/api/chat')).json();console.log(JSON.stringify({serverReachable:true,liveConfigured:status.liveConfigured,model:status.model,fallback:status.fallback}));
await ask('What is POSH?',/sexual harassment/i);
await ask('What is EPF?',/retirement savings|provident/i);
await ask('Why does EPF apply to my business?',/24 employees|24.*20-person/);
await ask('What documents do I need?',/Employee register|Payroll|Business PAN/i);
await ask('Does hiring more employees increase my GST?',/Hiring alone does not determine GST/);
await ask('What is ESI?',/social insurance/i);
await ask('What is GST?',/supplies and indirect tax/i);
const legacy=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',origin:base},body:JSON.stringify({messages:[{role:'user',content:'What is POSH?'}],profile:{name:'Legacy test business',employees:24,state:'Maharashtra',turnover:1800000,branches:1,gst:false}})});assert.equal(legacy.status,200);assert.match((await legacy.json()).message,/Local source-backed guidance.*not an online AI response/);console.log('PASS original frontend payload | compatibility adapter | HTTP 200');
const invalid=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',origin:base},body:'{"messages":[]}'});assert.equal(invalid.status,400);assert.ok(invalid.headers.get('x-request-id'));console.log('PASS malformed request | structured HTTP 400 and safe request ID');
console.log('Chatbot HTTP checks passed: 9');

}
main().catch(error=>{console.error(error);process.exitCode=1;});

