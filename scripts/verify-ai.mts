import nextEnv from '@next/env';
import {aiConfiguration,aiFailure,probeAI} from '../lib/ai-provider';
nextEnv.loadEnvConfig(process.cwd(),true);const c=aiConfiguration();
if(!c.apiKey){console.log(JSON.stringify({provider:c.provider,liveSucceeded:false,errorCategory:'missing_api_key',message:c.keyEnvironment+' is missing.'}));process.exitCode=1;}
else try{console.log(JSON.stringify({provider:c.provider,...await probeAI()}));}
catch(e){console.log(JSON.stringify({provider:c.provider,liveSucceeded:false,...aiFailure(e)}));process.exitCode=1;}
