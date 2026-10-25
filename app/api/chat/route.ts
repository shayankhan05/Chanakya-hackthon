import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {authorizedWorkspace,errorResponse,readJson,sameOrigin} from '@/lib/api';
import {AppError,loadWorkspace,rateLimit,saveWorkspace} from '@/lib/repository';
import {emptyWorkspace} from '@/lib/workspace';
import {evaluateBusiness} from '@/lib/engine';
import {knowledgeAnswer,presentAnswer,type AssistantAnswer} from '@/lib/assistant';
import {aiConfiguration,liveAIConversation,aiFailure} from '@/lib/ai-provider';
import {parseChatRequest} from '@/lib/chat-contract';
import type {ChatMessage,Workspace} from '@/lib/domain';
export const runtime='nodejs';
export async function GET(){const {provider,id,keyEnvironment,liveConfigured,model,officialSearchEnabled}=aiConfiguration();return NextResponse.json({provider,providerId:id,keyEnvironment,liveConfigured,model,officialSearchEnabled,connectivity:'Not probed. Live requests require credentials, available model access and quota.',fallback:'Saved business records and limited source-backed local knowledge base',requestVersion:3},{headers:{'Cache-Control':'no-store'}});}
export async function PATCH(req:Request){const requestId=randomUUID();try{sameOrigin(req);const parsed=z.object({businessId:z.string().min(1),action:z.enum(['new','clear'])}).safeParse(await readJson(req));if(!parsed.success)throw new AppError('Specify a business and new or clear conversation action.');const {user,workspace}=await authorizedWorkspace(parsed.data.businessId);await rateLimit('chat-reset:'+user.id,30);const next={...workspace,conversationId:randomUUID(),chatEpoch:(workspace.chatEpoch||0)+1,messages:parsed.data.action==='clear'?[]:workspace.messages};return NextResponse.json({workspace:await saveWorkspace(user.id,next,workspace.revision,'chat-'+parsed.data.action),requestId});}catch(e){return errorResponse(e)}}
export async function POST(req:Request){
 const requestId=randomUUID(),started=Date.now();let stage='validation';
 try{
  sameOrigin(req);let data:ReturnType<typeof parseChatRequest>;try{data=parseChatRequest(await readJson(req),requestId);}catch(e){throw new AppError(e instanceof Error?e.message:'Invalid question.');}
  let workspace:Workspace,userId:string|undefined;
  if(data.businessId&&!data.businessId.startsWith('demo-')){
   stage='authorization';const auth=await authorizedWorkspace(data.businessId);workspace=auth.workspace;userId=auth.user.id;
   if('conversationId' in data&&data.conversationId&&data.conversationId!==(workspace.conversationId||'legacy'))throw new AppError('This conversation changed in another tab. Reopen chat and try again.',409);
   const existing=workspace.messages.find(m=>m.id===data.messageId+'-answer'&&(m.conversationId||'legacy')===(workspace.conversationId||'legacy'));
   if(existing&&existing.mode!=='live')throw new AppError('This message ID belongs to a local response. Use a new message ID for a live-only request.',409);
   if(existing)return NextResponse.json({message:existing.content,details:existing.details,mode:existing.mode,sources:existing.sources,links:existing.links,workspace,requestId});
   await rateLimit('chat:'+userId,60);
  }else{
   if(!data.demoProfile)throw new AppError('A sample profile is required for anonymous local guidance.');workspace=emptyWorkspace('demo-request','Demo',true);workspace.profile=data.demoProfile;workspace.findings=evaluateBusiness(data.demoProfile,new Date().toISOString().slice(0,10));
   if('demoTasks' in data&&data.demoTasks)workspace.tasks=data.demoTasks.map(t=>({...t,key:t.id,priority:'Medium',assignee:'Demo owner',evidence:[],completedAt:null,eventId:null,period:'Demo',sourceUrl:'',sourceReference:''}));
  }
  stage='answer';const conversationId=workspace.conversationId||'legacy',epoch=workspace.chatEpoch||0;
  const history=userId?workspace.messages.filter(m=>(m.conversationId||'legacy')===conversationId).slice(-20).map(m=>({role:m.role,content:m.content})):data.history||[];
  const configuration=aiConfiguration(),requireLive=!!userId||('requireLive' in data&&data.requireLive);let response:AssistantAnswer,providerError:string|undefined;
  if(requireLive&&(!userId||!configuration.apiKey))return NextResponse.json({error:!userId?'Live-only chat requires an authenticated business.':configuration.keyEnvironment+' is missing from the running server.',errorCategory:!userId?'authentication_required':'missing_api_key',liveSucceeded:false,fallbackUsed:false,requestId},{status:503});
  if(userId&&configuration.apiKey){stage='provider';try{response=await liveAIConversation(workspace,data.question,history);}catch(e){const diagnostic=aiFailure(e);if(requireLive){console.warn('[compliance-chat]',{requestId,event:'live_only_failure',status:diagnostic.status,code:diagnostic.code});return NextResponse.json({error:diagnostic.reason,errorCategory:'provider_failure',providerStatus:diagnostic.status,code:diagnostic.code,liveSucceeded:false,fallbackUsed:false,requestId},{status:503});}providerError=diagnostic.reason+' The response below uses saved records and local checked sources, not the online model.';console.error('[compliance-chat]',{requestId,event:'provider_failure',model:configuration.model,status:diagnostic.status,code:diagnostic.code,durationMs:Date.now()-started});response=knowledgeAnswer(data.question,workspace,history);}}
  else response=knowledgeAnswer(data.question,workspace,history);
  response=presentAnswer(data.question,response,workspace);
  if(data.legacy&&response.mode==='knowledge-base')response.message='Local source-backed guidance — not an online AI response.\n\n'+response.message;
  let updated:Workspace|undefined;const at=new Date().toISOString();
  if(userId){stage='history-save';for(let attempt=0;attempt<3;attempt++){
    const latest=await loadWorkspace(userId,workspace.id);if((latest.conversationId||'legacy')!==conversationId||(latest.chatEpoch||0)!==epoch)throw new AppError('The conversation was reset while the response was being prepared. Please send your question in the new conversation.',409);
    const existing=latest.messages.find(m=>m.id===data.messageId+'-answer');if(existing){updated=latest;break;}
    const userMessage:ChatMessage={id:data.messageId,role:'user',content:data.question,at,conversationId};const answer:ChatMessage={id:data.messageId+'-answer',role:'assistant',content:response.message,details:response.details,at,conversationId,mode:response.mode,sources:response.sources,links:response.links};
    try{updated=await saveWorkspace(userId,{...latest,messages:[...latest.messages,userMessage,answer].slice(-400)},latest.revision,'assistant-message');break;}catch(e){if(!(e instanceof AppError&&e.status===409)||attempt===2)throw e;}
   }}
  console.info('[compliance-chat]',{requestId,event:'response',mode:response.mode,legacyClient:data.legacy,liveConfigured:configuration.liveConfigured,durationMs:Date.now()-started});
  return NextResponse.json({...response,providerError,requestId,configuration:response.mode==='knowledge-base'?(userId?(configuration.liveConfigured?'The online provider failed; this response uses saved records and local sources.':configuration.keyEnvironment+' is missing from the server environment. This response uses saved records and local sources.'):'Demo mode uses local records and source-backed guidance, not an online AI model.'):undefined,workspace:updated});
 }catch(e){console.warn('[compliance-chat]',{requestId,event:'request_failure',stage,status:e instanceof AppError?e.status:500,durationMs:Date.now()-started});const r=errorResponse(e);r.headers.set('X-Request-Id',requestId);return r;}
}
