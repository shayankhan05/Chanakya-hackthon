/** Browser-safe validation; the server still verifies file content and ownership. */
export function statementSelectionError(file:Pick<File,'name'|'size'>){
 if(!/\.(csv|pdf)$/i.test(file.name))return 'Choose a CSV or supported text PDF statement.';
 if(!file.size)return 'The selected statement is empty. Choose a nonempty file.';
 if(file.size>2*1024*1024)return 'Maximum statement size is 2 MB. Export a smaller statement.';
 if(/\.csv$/i.test(file.name)&&file.size>500000)return 'Maximum CSV size is 500 KB. Export a smaller statement.';
 return null;
}
export async function readFinancialResponse<T>(response:Response):Promise<T>{
 const text=await response.text();let data:unknown;
 try{data=text?JSON.parse(text):null;}catch{data=null;}
 if(!response.ok){
  const supplied=typeof data==='object'&&data!==null&&'error' in data&&typeof data.error==='string'?data.error:null;
  const fallback=response.status===413?'The financial request is too large. CSV files must be at most 500 KB, PDFs at most 2 MB.':response.status===401?'Please sign in again before accessing financial records.':response.status===409?'Financial records changed. Reopen Financial Records before saving.':response.status===429?'Too many financial requests. Wait a few minutes and try again.':'The financial request could not be completed. Please try again.';
  throw Error(supplied||fallback);
 }
 if(typeof data!=='object'||data===null)throw Error('The server returned an incomplete financial response. Reopen Financial Records and try again.');
 return data as T;
}
