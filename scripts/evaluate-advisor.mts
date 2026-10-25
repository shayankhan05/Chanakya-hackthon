import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {blankProfile} from '../lib/domain.ts';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3001';
class Client{
 cookies=new Map<string,string>();
 async request(path:string,options:RequestInit={}){const headers=new Headers(options.headers);headers.set('origin',base);headers.set('cookie',[...this.cookies].map(([k,v])=>k+'='+v).join('; '));const r=await fetch(base+path,{...options,headers,redirect:'manual'});for(const c of r.headers.getSetCookie()){const part=c.split(';')[0],i=part.indexOf('=');this.cookies.set(part.slice(0,i),part.slice(i+1));}return r;}
 async json(path:string,method='GET',body?:unknown){const r=await this.request(path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
 async login(email:string,password:string){const csrf=(await this.json('/api/auth/csrf')).data.csrfToken;await this.request('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email,password,csrfToken:csrf,json:'true',callbackUrl:base+'/dashboard'})});assert.ok((await this.json('/api/auth/session')).data.user);}
}

const fixtures=JSON.parse(await readFile(new URL('../tests/fixtures/advisor-evaluation.json',import.meta.url),'utf8'));
const probe=new Client(),configuration=(await probe.json('/api/chat')).data;
if(configuration.liveConfigured&&process.env.RUN_LIVE_EVAL!=='true')throw Error('Live AI is configured. Set RUN_LIVE_EVAL=true to explicitly authorize metered evaluations.');
const pool:Client[]=[];
for(let i=0;i<3;i++){const client=new Client(),email=`evaluation-${randomUUID().slice(0,8)}@example.test`,password='Synthetic-evaluation-12345';assert.equal((await client.json('/api/account/signup','POST',{name:'Evaluation owner',email,password,confirmPassword:password})).status,201);await client.login(email,password);const created=await client.json('/api/workspaces','POST',{...structuredClone(blankProfile),...fixtures[0].profile});assert.equal(created.status,201);pool.push(client);}
const results=[];
for(const f of fixtures){
 const client:Client=pool[(f.id-1)%pool.length],profile={...structuredClone(blankProfile),...f.profile};
 let w=(await client.json('/api/workspaces')).data.workspace;
 if(JSON.stringify(w.profile)!==JSON.stringify(profile)){const updated=await client.json(`/api/workspaces/${w.id}`,'PATCH',{revision:w.revision,mutation:{type:'profile',profile}});assert.equal(updated.status,200);w=updated.data.workspace;}
 const reset=await client.json('/api/chat','PATCH',{businessId:w.id,action:'new'});assert.equal(reset.status,200);w=reset.data.workspace;
 const unchanged=JSON.stringify({profile:w.profile,tasks:w.tasks,events:w.events,resources:w.resources});
 for(const q of f.history){const r=await client.json('/api/chat','POST',{question:q,messageId:randomUUID(),businessId:w.id,conversationId:w.conversationId||'legacy'});assert.equal(r.status,200);w=r.data.workspace;}
 const r=await client.json('/api/chat','POST',{question:f.question,messageId:randomUUID(),businessId:w.id,conversationId:w.conversationId||'legacy'});
 const message=r.data.message||'',details=r.data.details||'';
 const immutable=r.status===200&&unchanged===JSON.stringify({profile:r.data.workspace.profile,tasks:r.data.workspace.tasks,events:r.data.workspace.events,resources:r.data.workspace.resources});
 const contentCheck=[f.localCheck,...(f.additionalChecks||[])].every(pattern=>new RegExp(pattern,'i').test(message+'\n'+details));
 const honest=r.data.mode==='live'||r.data.configuration?.includes('local');
 const passed=r.status===200&&immutable&&contentCheck&&honest;
 const status=f.requiresLiveModel&&r.data.mode!=='live'?'BLOCKED_NO_MODEL':passed?'PASS':'FAIL';
 results.push({id:f.id,question:f.question,status,http:r.status,mode:r.data.mode,contentCheck,immutable,honest,words:message.split(/\s+/).length,toolSelection:'Not observed: no provider trace is exposed by the HTTP endpoint',message,details});
 console.log(`${status} ${f.id}. ${f.question}`);
}
const report={at:new Date().toISOString(),base,provider:configuration,executed:results.length,passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,blocked:results.filter(r=>r.status==='BLOCKED_NO_MODEL').length,liveModelResponses:results.filter(r=>r.mode==='live').length,scope:'Automated authenticated response-content, immutability and honest-mode checks. Not a comprehensive human legal assessment or proof of live model tool selection.',results};
await writeFile(new URL('../docs/advisor-evaluation-results.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,results:undefined},null,2));
if(report.failed)process.exitCode=1;
