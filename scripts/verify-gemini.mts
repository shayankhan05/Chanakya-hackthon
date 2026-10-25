import nextEnv from '@next/env';
import {geminiConfiguration,geminiFailure} from '../lib/gemini-config';
import {probeGemini} from '../lib/gemini-provider';
nextEnv.loadEnvConfig(process.cwd(),true);
const config=geminiConfiguration();
if(!config.apiKey){console.log(JSON.stringify({provider:config.provider,model:config.model,liveSucceeded:false,errorCategory:'missing_api_key',message:'GEMINI_API_KEY is missing. A fresh Gemini credential is required.'}));process.exitCode=1;}
else try{console.log(JSON.stringify({provider:config.provider,...await probeGemini()}));}
catch(e){console.log(JSON.stringify({provider:config.provider,liveSucceeded:false,...geminiFailure(e)}));process.exitCode=1;}
