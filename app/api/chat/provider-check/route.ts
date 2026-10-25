import {NextResponse} from 'next/server';
import {authorizedWorkspace,errorResponse,readJson,sameOrigin} from '@/lib/api';
import {AppError,rateLimit} from '@/lib/repository';
import {aiConfiguration,aiFailure,probeAI} from '@/lib/ai-provider';
export const runtime='nodejs';
export async function POST(req:Request){try{
 sameOrigin(req);const body=await readJson(req);if(typeof body?.businessId!=='string')throw new AppError('Specify your business workspace.');
 const {user}=await authorizedWorkspace(body.businessId);await rateLimit('provider-check:'+user.id,5);
 const config=aiConfiguration();if(!config.apiKey)return NextResponse.json({provider:config.provider,liveSucceeded:false,fallbackUsed:false,errorCategory:'missing_api_key',message:config.keyEnvironment+' is missing from the running server.'},{status:503});
 try{const result=await probeAI();return NextResponse.json({provider:config.provider,fallbackUsed:false,...result});}
 catch(e){const diagnostic=aiFailure(e);console.warn('[provider-check]',{status:diagnostic.status,code:diagnostic.code});return NextResponse.json({provider:config.provider,liveSucceeded:false,fallbackUsed:false,errorCategory:'provider_failure',providerStatus:diagnostic.status,code:diagnostic.code,message:diagnostic.reason},{status:503});}
 }catch(e){return errorResponse(e);}}
