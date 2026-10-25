import type {Workspace} from './domain';
import {openRouterConfiguration,openRouterFailure} from './openrouter-provider';
import {geminiConfiguration,geminiFailure} from './gemini-config';
export function aiConfiguration(){const id=(process.env.AI_PROVIDER||'gemini').trim().toLowerCase();if(id==='gemini')return {id,...geminiConfiguration(),keyEnvironment:'GEMINI_API_KEY',officialSearchEnabled:false};if(id==='openrouter')return {id,...openRouterConfiguration(),keyEnvironment:'OPENROUTER_API_KEY',officialSearchEnabled:false};throw Error('AI_PROVIDER must be gemini or openrouter.');}
export async function liveAIConversation(w:Workspace,question:string,history:{role:'user'|'assistant';content:string}[]){return aiConfiguration().id==='gemini'?(await import('./gemini-provider')).geminiConversation(w,question,history):(await import('./openrouter-provider')).openRouterConversation(w,question,history);}
export function aiFailure(e:unknown){return aiConfiguration().id==='gemini'?geminiFailure(e):openRouterFailure(e);}
export async function probeAI(){const c=aiConfiguration();if(!c.apiKey)throw Error(c.keyEnvironment+' is missing.');return c.id==='gemini'?(await import('./gemini-provider')).probeGemini():(await import('./openrouter-provider')).probeOpenRouter();}
