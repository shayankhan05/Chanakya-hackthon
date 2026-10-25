import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {blankProfile} from '../lib/domain.ts';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3001';
class Client{
 cookies=new Map<string,string>();
 async request(path:string,options:RequestInit={}){const headers=new Headers(options.headers);headers.set('origin',base);headers.set('cookie',[...this.cookies].map(([k,v])=>k+'='+v).join('; '));const r=await fetch(base+path,{...options,headers,redirect:'manual'});for(const c of r.headers.getSetCookie()){const part=c.split(';')[0],i=part.indexOf('=');this.cookies.set(part.slice(0,i),part.slice(i+1));}return r;}
 async json(path:string,method='GET',body?:unknown){const r=await this.request(path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
 async login(email:string,password:string){const csrf=(await this.json('/api/auth/csrf')).data.csrfToken;await this.request('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email,password,csrfToken:csrf,json:'true',callbackUrl:base+'/dashboard'})});assert.ok((await this.json('/api/auth/session')).data.user);}
}


const client=new Client(),email=`live-only-${randomUUID().slice(0,8)}@example.test`,password='Synthetic-live-check-12345';
assert.equal((await client.json('/api/account/signup','POST',{name:'Live verification owner',email,password,confirmPassword:password})).status,201);await client.login(email,password);
const profile={...structuredClone(blankProfile),name:'Phoenix Tech Solutions',state:'Karnataka',city:'Bengaluru',employees:8,branchLocations:[{state:'Karnataka',city:'Bengaluru',employees:8}],turnover:1800000,startDate:'2024-04-01',eligibleEsiEmployees:4,priorEpf:'No',priorEsi:'No'};
const created=await client.json('/api/workspaces','POST',profile);assert.equal(created.status,201);const w=created.data.workspace;
const provider=await client.json('/api/chat/provider-check','POST',{businessId:w.id});
console.log('SERVER PROVIDER PROBE '+JSON.stringify(provider));
assert.equal(provider.data.fallbackUsed,false);
const results=[];
for(const question of ['What is my company name?','How many employees do I have?','What happens if I increase my employees to 50?','What is my next compliance deadline?','What is POSH?','What is EPF?','Does hiring more employees increase my GST?','Explain that in simple language.','Write a recipe for chocolate cake.']){
 const response=await client.json('/api/chat','POST',{businessId:w.id,question,messageId:randomUUID(),requireLive:false});
 if(response.status===200){assert.equal(response.data.mode,'live');if(question.includes('name'))assert.match(response.data.message,/Phoenix Tech Solutions/);else if(question.includes('How many'))assert.match(response.data.message,/\b8\b/);else if(question.includes('start'))assert.match(response.data.message,/2024/);else if(question==='What happens if I increase my employees to 50?'){assert.ok(response.data.scenario?.ok);assert.equal(response.data.scenario.planned.employees,50);}assert.ok(response.data.message.split(/\s+/).length<=120);}
 else {assert.equal(response.data.fallbackUsed,false);assert.equal(response.data.liveSucceeded,false);assert.ok(response.data.errorCategory);assert.equal(response.data.message,undefined);}
 results.push({question,httpStatus:response.status,liveSucceeded:response.status===200&&response.data.mode==='live',fallbackUsed:false,mode:response.data.mode,providerStatus:response.data.providerStatus,code:response.data.code,errorCategory:response.data.errorCategory,error:response.data.error,message:response.data.message});
 console.log(JSON.stringify(results.at(-1)));
}
const after=(await client.json('/api/workspaces/'+w.id)).data.workspace;assert.equal(after.profile.employees,8);assert.equal(after.profile.name,'Phoenix Tech Solutions');
const liveWorking=provider.data.liveSucceeded===true&&results.every(r=>r.liveSucceeded);
const report={at:new Date().toISOString(),status:liveWorking?'LIVE AI WORKING':'LIVE AI NOT WORKING',fixture:'Isolated authenticated saved Phoenix Tech Solutions business, eight employees. Existing owner records preserved.',provider:{httpStatus:provider.status,...provider.data},results,savedProfileUnchanged:true};
await writeFile('docs/live-only-check.json',JSON.stringify(report,null,2)+'\n');
console.log(report.status);if(!liveWorking)process.exitCode=1;
