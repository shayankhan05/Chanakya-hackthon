import {parentPort,workerData} from 'node:worker_threads';
import {getDocumentProxy} from 'unpdf';
let pdf;
try {
 pdf=await getDocumentProxy(new Uint8Array(workerData),{isEvalSupported:false,disableFontFace:true,maxImageSize:1000000});
 if(pdf.numPages>12)throw Error('page limit');
 const lines=[];let length=0;
 for(let n=1;n<=pdf.numPages;n++){
  const page=await pdf.getPage(n),content=await page.getTextContent();let line='';
  for(const item of content.items){if(!('str' in item))continue;line+=item.str+' ';if(item.hasEOL){lines.push(line.trim());line='';}length+=item.str.length;if(length>200000)throw Error('text limit');}
  if(line.trim())lines.push(line.trim());page.cleanup();
 }
 parentPort.postMessage({text:lines.join('\n')});
}catch {parentPort.postMessage({error:'Unsupported, encrypted, scanned or overly complex PDF. Use an unencrypted text PDF with the documented table or a CSV export. No transactions were invented.'});}
finally{await pdf?.destroy();}
