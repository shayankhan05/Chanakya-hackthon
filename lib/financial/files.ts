import {Worker} from 'node:worker_threads';
import {resolve} from 'node:path';
import {parseStatementWithMapping} from './parser';
export const MAX_STATEMENT_BYTES=2*1024*1024;
export async function extractStatement(bytes:Uint8Array,mime:string,filename:string,account:string){
 if(!bytes.length||bytes.length>MAX_STATEMENT_BYTES)throw Error('Statement must be nonempty and at most 2 MB.');
 const pdf=Buffer.from(bytes.subarray(0,5)).toString()==='%PDF-';
 if(pdf){if(!/\.pdf$/i.test(filename)||!['application/pdf','','application/octet-stream'].includes(mime))throw Error('File extension, MIME and signature do not match.');
  const text=await new Promise<string>((done,fail)=>{const worker=new Worker(resolve(process.cwd(),'lib/financial/pdf-worker.mjs'),{workerData:bytes,resourceLimits:{maxOldGenerationSizeMb:128}});const timer=setTimeout(()=>{void worker.terminate();fail(Error('PDF processing timed out. Export the statement as CSV.'));},10000);let settled=false;const finish=(error?:Error,text?:string)=>{if(settled)return;settled=true;clearTimeout(timer);void worker.terminate();if(error)fail(error);else done(text||'');};worker.once('message',d=>finish(d.error?Error(d.error):undefined,d.text));worker.once('error',()=>finish(Error('PDF could not be safely processed. Use CSV.')));worker.once('exit',()=>{if(!settled)finish(Error('PDF exceeded processing limits. Use CSV.'));});});
  return {mime:'application/pdf',...parseStatementWithMapping(text,account,'pdf')};
 }
 if(!/\.csv$/i.test(filename)||!['text/csv','application/vnd.ms-excel','text/plain','application/csv','','application/octet-stream'].includes(mime)||bytes.length>500000)throw Error('Supported formats: CSV up to 500 KB, or a supported text PDF up to 2 MB.');
 const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if([...text].some(c=>c.charCodeAt(0)<32&&![9,10,13].includes(c.charCodeAt(0))))throw Error('CSV contains unsupported binary data.');
 return {mime:'text/csv',...parseStatementWithMapping(text,account)};
}
