/** Drain a small bounded excess before returning 413, so a response is not lost
 * while the HTTP client is still transmitting. Never retain oversized content. */
export class FinancialBodyError extends Error{constructor(message:string,public status:413|408){super(message);}}
export async function readFinancialBody(req:Request,limit:number){
 const maximumRead=limit+1000000,declared=Number(req.headers.get('content-length')||0);
 if(declared>maximumRead)throw new FinancialBodyError('Financial request exceeds the processing limit.',413);
 const reader=req.body?.getReader();if(!reader)throw Error('Financial request is empty.');
 let size=0,oversized=declared>limit,timedOut=false;const chunks:Uint8Array[]=[];
 const timer=setTimeout(()=>{timedOut=true;void reader.cancel().catch(()=>{});},10000);
 try{while(true){const {done,value}=await reader.read();if(timedOut)throw new FinancialBodyError('Financial request timed out. Try a smaller file.',408);if(done)break;size+=value.length;
  if(size>maximumRead){await reader.cancel();throw new FinancialBodyError('Financial request exceeds the processing limit.',413);}
  if(size>limit){oversized=true;chunks.length=0;}
  if(!oversized)chunks.push(value);
 }}finally{clearTimeout(timer);reader.releaseLock();}
 if(oversized)throw new FinancialBodyError('Financial request exceeds the processing limit.',413);
 return Buffer.concat(chunks);
}
