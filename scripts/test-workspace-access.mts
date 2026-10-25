import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {checkChatWorkspace} from '../lib/chat-workspace.ts';
import {blankProfile} from '../lib/domain.ts';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3001';
class Client{
 cookies=new Map<string,string>();
 async request(path:string,options:RequestInit={}){const headers=new Headers(options.headers);headers.set('origin',base);headers.set('cookie',[...this.cookies].map(([k,v])=>k+'='+v).join('; '));const r=await fetch(base+path,{...options,headers,redirect:'manual'});for(const c of r.headers.getSetCookie()){const part=c.split(';')[0],i=part.indexOf('=');this.cookies.set(part.slice(0,i),part.slice(i+1));}return r;}
 async json(path:string,method='GET',body?:unknown){const r=await this.request(path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
 async login(email:string,password:string){const csrf=(await this.json('/api/auth/csrf')).data.csrfToken;await this.request('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email,password,csrfToken:csrf,json:'true',callbackUrl:base+'/dashboard'})});assert.ok((await this.json('/api/auth/session')).data.user);}
}



const a=new Client(),b=new Client(),password='Synthetic-access-test-12345';
for(const [index,client] of [a,b].entries()){const email='workspace-access-'+randomUUID()+'@example.test';assert.equal((await client.json('/api/account/signup','POST',{name:'Access test '+index,email,password,confirmPassword:password})).status,201);await client.login(email,password);}
const create=async(client:Client,name:string)=>{const r=await client.json('/api/workspaces','POST',{...structuredClone(blankProfile),name,state:'Karnataka',city:'Bengaluru',employees:8,branchLocations:[{state:'Karnataka',city:'Bengaluru',employees:8}],turnover:1800000});assert.equal(r.status,201);return r.data.workspace;};
const wa=await create(a,'Workspace Access Alpha');
const cross=await b.json('/api/chat','POST',{businessId:wa.id,question:'What is my company name?',messageId:randomUUID(),requireLive:true});assert.equal(cross.status,404);assert.equal(cross.data.workspace,undefined);console.log('PASS: stale foreign business ID reproduces HTTP 404; no foreign workspace exposed.');
const transport=((url:string|URL|Request,options?:RequestInit)=>b.request(String(url),options)) as typeof fetch;
assert.equal((await checkChatWorkspace(wa,transport)).kind,'onboarding');console.log('PASS: current account without a business is directed to onboarding.');
const wb=await create(b,'Workspace Access Beta');const resolved=await checkChatWorkspace(wa,transport);assert.equal(resolved.kind,'changed');assert.ok('workspace' in resolved);assert.equal(resolved.workspace.id,wb.id);console.log('PASS: stale tab resolves the signed-in account business; requires review before sending.');
const answer=await b.json('/api/chat','POST',{businessId:wb.id,question:'What is my company name?',messageId:randomUUID(),requireLive:true});assert.equal(answer.status,200);assert.equal(answer.data.mode,'live');assert.match(answer.data.message,/Workspace Access Beta/);assert.doesNotMatch(answer.data.message,/Workspace Access Alpha/);console.log('PASS: real live chat answers with the correct authorized business name.');
