import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkChatWorkspace} from '../lib/chat-workspace';
import {demoWorkspace} from '../lib/workspace';
const profile=()=>({...demoWorkspace('judge'),demo:false,id:'previous-business'});
function endpoint(status:number,data:unknown){return (async(url,options)=>{assert.equal(url,'/api/workspaces');assert.equal(options?.cache,'no-store');return Response.json(data,{status});}) as typeof fetch;}
test('stale account workspace is replaced only with the authenticated endpoint result',async()=>{const old=profile(),actual={...old,id:'current-account-business',messages:[]};const check=await checkChatWorkspace(old,endpoint(200,{workspace:actual}));assert.equal(check.kind,'changed');if('workspace' in check)assert.equal(check.workspace.id,actual.id);assert.equal(old.id,'previous-business');});
test('missing workspace and expired sessions are distinct recovery outcomes',async()=>{assert.equal((await checkChatWorkspace(profile(),endpoint(200,{workspace:null}))).kind,'onboarding');assert.equal((await checkChatWorkspace(profile(),endpoint(401,{error:'Please sign in'}))).kind,'sign-in');});
test('an active workspace is ready but a reset conversation requires review',async()=>{const w=profile();assert.equal((await checkChatWorkspace(w,endpoint(200,{workspace:w}))).kind,'ready');assert.equal((await checkChatWorkspace(w,endpoint(200,{workspace:{...w,conversationId:'reset'}}))).kind,'changed');});
test('backend failures cannot be treated as permission to use stale business records',async()=>{await assert.rejects(checkChatWorkspace(profile(),endpoint(503,{error:'Unavailable'})),/Unavailable/);});
