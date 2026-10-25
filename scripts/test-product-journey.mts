import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {blankProfile} from '../lib/domain.ts';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3001';
class Client{
 cookies=new Map<string,string>();
 async request(path:string,options:RequestInit={}){const headers=new Headers(options.headers);headers.set('origin',base);headers.set('cookie',[...this.cookies].map(([k,v])=>k+'='+v).join('; '));const r=await fetch(base+path,{...options,headers,redirect:'manual'});for(const c of r.headers.getSetCookie()){const part=c.split(';')[0],i=part.indexOf('=');this.cookies.set(part.slice(0,i),part.slice(i+1));}return r;}
 async json(path:string,method='GET',body?:unknown){const r=await this.request(path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
 async login(email:string,password:string){const csrf=(await this.json('/api/auth/csrf')).data.csrfToken;await this.request('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email,password,csrfToken:csrf,json:'true',callbackUrl:base+'/dashboard'})});assert.ok((await this.json('/api/auth/session')).data.user);}
}

const a=new Client(),email=`journey-${randomUUID().slice(0,8)}@example.test`,password='Synthetic-journey-12345';
assert.equal((await a.json('/api/account/signup','POST',{name:'Journey owner',email,password,confirmPassword:password})).status,201);await a.login(email,password);
const profile={...structuredClone(blankProfile),name:'Growth Journey Test',state:'Karnataka',city:'Bengaluru',employees:8,branchLocations:[{state:'Karnataka',city:'Bengaluru',employees:8}],turnover:1800000,eligibleEsiEmployees:4,priorEpf:'No',priorEsi:'No',hazardous:'No',seasonalFactory:'No',taxableSupplies:'Yes',gstExceptions:'No',interstate:'No'};
const created=await a.json('/api/workspaces','POST',profile);assert.equal(created.status,201);let w=created.data.workspace;
console.log('PASS signup, login and real 8-employee onboarding');
const html=await (await a.request('/dashboard')).text(),nav=html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/)?.[1]||'';
assert.equal((nav.match(/<button/g)||[]).length,6);
for(const name of ['Overview','Laws for My Business','What I Need to Do','Important Warnings','Plan My Growth','Ask AI'])assert.ok(nav.includes(name));
console.log('PASS server-rendered six-section navigation');
const gst=w.findings.find((f:{ruleId:string})=>f.ruleId==='GST').outcome;
const update=await a.json(`/api/workspaces/${w.id}`,'PATCH',{revision:w.revision,mutation:{type:'profile',profile:{...profile,employees:24,branchLocations:[{state:'Karnataka',city:'Bengaluru',employees:24}]}}});assert.equal(update.status,200);w=update.data.workspace;
assert.ok(w.events.some((e:{changes:{field:string;before:number;after:number}[]})=>e.changes.some(c=>c.field==='employees'&&c.before===8&&c.after===24)));
assert.ok(w.findings.some((f:{ruleId:string;outcome:string})=>f.ruleId==='EPF'&&f.outcome==='Potentially applicable'));
assert.equal(w.findings.find((f:{ruleId:string})=>f.ruleId==='GST').outcome,gst);
console.log('PASS saved growth 8 → 24, event, EPF reevaluation and unchanged GST trigger');
const before=JSON.stringify({profile:w.profile,tasks:w.tasks,events:w.events,notices:w.notices});
const simulation=await a.json(`/api/workspaces/${w.id}/simulate`,'POST',{...w.profile,employees:50,branchLocations:[{state:'Karnataka',city:'Bengaluru',employees:50}]});assert.equal(simulation.status,200);assert.ok(simulation.data.changes.some((c:{field:string;after:number})=>c.field==='employees'&&c.after===50));
w=(await a.json('/api/workspaces/'+w.id)).data.workspace;assert.equal(JSON.stringify({profile:w.profile,tasks:w.tasks,events:w.events,notices:w.notices}),before);
console.log('PASS simulated 50 employees never changes saved 24-employee business');
const epf=await a.json('/api/chat','POST',{question:'Why does EPF apply to my business?',businessId:w.id,messageId:randomUUID()});assert.equal(epf.status,200);assert.match(epf.data.message,/24 employees|20-person/);assert.match(epf.data.message,/exemption|eligib/i);console.log('PASS actual EPF why-question uses 24 employees and coverage qualifications');
const chat=await a.json('/api/chat','POST',{question:'How many employees do I have?',businessId:w.id,messageId:randomUUID()});assert.equal(chat.status,200);assert.match(chat.data.message,/24/);
console.log('PASS chatbot reads saved 24, rather than simulated 50');
const csrf=(await a.json('/api/auth/csrf')).data.csrfToken;await a.request('/api/auth/signout',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrfToken:csrf,json:'true',callbackUrl:base})});assert.ok(!(await a.json('/api/auth/session')).data.user);
const returning=new Client();await returning.login(email,password);const reloaded=(await returning.json('/api/workspaces')).data.workspace;assert.equal(reloaded.profile.employees,24);assert.equal(reloaded.messages.at(-1).content,chat.data.message);
console.log('PASS logout/login preserves profile, change history and conversation');
for(const path of ['/demo','/demo/deadlines'])assert.equal((await returning.request(path)).status,200);
console.log('PASS main demo and isolated deadline demonstration routes');
console.log('Product journey checks passed: 9 groups. Browser hydration and mobile layout were not tested by this HTTP script.');
