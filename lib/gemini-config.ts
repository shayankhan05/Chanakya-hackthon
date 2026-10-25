// Server-side only. Never serialize apiKey or raw SDK errors into a response.
export function geminiConfiguration(){
 const apiKey=process.env.GEMINI_API_KEY?.trim()||undefined;
 return {provider:'Google Gemini' as const,apiKey,model:process.env.GEMINI_MODEL?.trim()||'gemini-3.1-flash-lite',liveConfigured:!!apiKey};
}
export function geminiFailure(error:unknown){
 const e=error as {status?:number;message?:string;name?:string};
 const status=Number(e?.status)||undefined;
 let detail:{status?:string;details?:{reason?:string}[]}={};
 try{detail=JSON.parse(e.message||'').error||{};}catch{/* Never log the raw message; URLs may contain credentials. */}
 const allowed=new Set(['API_KEY_INVALID','API_KEY_EXPIRED','PERMISSION_DENIED','RESOURCE_EXHAUSTED','NOT_FOUND','INVALID_ARGUMENT','SERVICE_DISABLED','BILLING_DISABLED','UNAUTHENTICATED','ACCESS_TOKEN_TYPE_UNSUPPORTED','API_KEY_SERVICE_BLOCKED','CREDENTIALS_MISSING']);
 const candidate=detail.details?.find(d=>d.reason&&allowed.has(d.reason))?.reason||detail.status;
 const code=candidate&&allowed.has(candidate)?candidate:undefined;
 const reason=status===504?'Gemini generation timed out (HTTP 504). Please try again; the key and model may need checking in Google AI Studio.':code==='ACCESS_TOKEN_TYPE_UNSUPPORTED'?'Google rejected the configured Gemini credential (401 ACCESS_TOKEN_TYPE_UNSUPPORTED). Create a fresh Gemini API key in Google AI Studio for an enabled project and replace GEMINI_API_KEY on the server.':code==='API_KEY_INVALID'||code==='API_KEY_EXPIRED'||status===401?'Gemini API authentication failed. Check the server Gemini key.':status===403?'Gemini API access was denied. Check key restrictions, API enablement and project permissions.':status===429?'Gemini API quota or rate allowance was exceeded. Check the Google AI project quota and billing.':status===404?'The configured Gemini model is unavailable for this API or project.':status===400?'Gemini rejected the request configuration or key.':e?.name?.includes('Timeout')||e?.name==='AbortError'?'The Gemini request timed out.':'The server could not complete the Gemini request.';
 return {status,code,reason};
}
