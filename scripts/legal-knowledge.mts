// Local administrator workflow. No network scraping or public upload endpoint.
import {readFileSync} from 'node:fs';
import {z} from 'zod';
import {legalIndex,indexDocument,searchIndexedKnowledge} from '../lib/legal-index';
import {legalKnowledge,type LegalRecord} from '../lib/legal-knowledge';
const [command,...args]=process.argv.slice(2);
const manifest=z.object({id:z.string().regex(/^DOC-[A-Z0-9-]+$/),topic:z.string().min(1),lawName:z.string().min(1),provision:z.string().min(1),jurisdiction:z.string().min(1),url:z.url(),sourceTitle:z.string().min(1),publicationDate:z.iso.date().nullable(),effectiveDate:z.iso.date().nullable(),industries:z.array(z.string()),requiredFacts:z.array(z.string()),exceptions:z.array(z.string()),explanation:z.string().min(1),version:z.number().int().positive(),keywords:z.array(z.string()),accessRights:z.literal('Authorized public material or permission obtained')});
if(command==='index'){legalIndex();console.log(JSON.stringify({indexed:legalKnowledge.length,path:process.env.LEGAL_INDEX_PATH||'.data/legal-knowledge.sqlite'}));}
else if(command==='search'){console.log(JSON.stringify(searchIndexedKnowledge(args.join(' ')),null,2));}
else if(command==='ingest'){
 if(!args[0]||!args[1])throw Error('Usage: ingest manifest.json extracted.txt|source.html');
 const m=manifest.parse(JSON.parse(readFileSync(args[0],'utf8')));let text=readFileSync(args[1],'utf8');if(text.length>2000000)throw Error('Document exceeds 2 MB text limit.');
 if(/\.html?$/i.test(args[1]))text=text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
 const {accessRights:_,...data}=m;const record:LegalRecord={...data,parameters:{},status:'draft',verifiedAt:null};indexDocument(record,text);console.log('Draft ingested and chunked. Excluded from assistant retrieval until administrator review.');
}else if(command==='review'){
 const [id,status,verifiedAt,reviewer]=args;if(!id?.startsWith('DOC-')||!['reviewed','needs-review','superseded'].includes(status)||!z.iso.date().safeParse(verifiedAt).success||!reviewer)throw Error('Usage: review DOC-ID reviewed|needs-review|superseded YYYY-MM-DD reviewer-name. Review authority, scope and operative dates before approving.');
 const d=legalIndex(),row=d.prepare('SELECT metadata FROM legal_documents WHERE id=?').get(id) as {metadata:string}|undefined;if(!row)throw Error('Draft document not found.');const m=JSON.parse(row.metadata) as LegalRecord;m.status=status as LegalRecord['status'];m.verifiedAt=verifiedAt;d.prepare('UPDATE legal_documents SET metadata=?,status=?,reviewer=? WHERE id=?').run(JSON.stringify(m),status,reviewer,id);console.log('Review recorded. Calculators retain their separately reviewed parameters.');
}else throw Error('Commands: index; search query; ingest manifest.json extracted.txt; review DOC-ID status YYYY-MM-DD reviewer. For PDFs use an authorized local text extraction tool first; scanned PDFs require reviewed OCR.');
