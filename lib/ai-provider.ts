import type {Workspace} from './domain';
import {openRouterConfiguration,openRouterFailure,openRouterConversation,probeOpenRouter} from './openrouter-provider';
export function aiConfiguration(){const id=(process.env.AI_PROVIDER||'openrouter').trim().toLowerCase();if(id!=='openrouter')throw Error('AI_PROVIDER must be openrouter.');return {id,...openRouterConfiguration(),keyEnvironment:'OPENROUTER_API_KEY',officialSearchEnabled:false};}
export async function liveAIConversation(w:Workspace,question:string,history:{role:'user'|'assistant';content:string}[]){aiConfiguration();return openRouterConversation(w,question,history);}
export function aiFailure(e:unknown){return openRouterFailure(e);}
export async function probeAI(){const c=aiConfiguration();if(!c.apiKey)throw Error(c.keyEnvironment+' is missing.');return probeOpenRouter();}
