import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {legalKnowledge,tokens,type LegalRecord} from './legal-knowledge';
import {officialUrl} from './assistant-context';
let database:DatabaseSync|undefined;
export function chunkText(text:string,size=1000){const clean=text.replace(/\r\n/g,'\n').replace(/[ \t]+/g,' ').trim();const chunks:string[]=[];for(let start=0;start<clean.length;start+=size-150)chunks.push(clean.slice(start,start+size));return chunks;}
export function legalIndex(){if(database)return database;const file=process.env.VERCEL==='1'?':memory:':resolve(process.env.LEGAL_INDEX_PATH||'.data/legal-knowledge.sqlite');if(file!==':memory:')mkdirSync(dirname(file),{recursive:true});const d=new DatabaseSync(file);d.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS legal_documents(id TEXT PRIMARY KEY,version INTEGER NOT NULL,metadata TEXT NOT NULL,hash TEXT NOT NULL,status TEXT NOT NULL,reviewer TEXT);
 CREATE VIRTUAL TABLE IF NOT EXISTS legal_chunks USING fts5(documentId UNINDEXED,text,tokenize='unicode61');`);
 database=d;for(const record of legalKnowledge)indexDocument(record,record.topic+'\n'+record.explanation+'\n'+record.keywords.join(' '),'Curated repository');return d;}
export function indexDocument(record:LegalRecord,text:string,reviewer:string|null=null){
 if(!officialUrl(record.url))throw Error('Only registered official HTTPS source hosts are accepted.');
 const d=database||legalIndex(),hash=createHash('sha256').update(JSON.stringify(record)+text).digest('hex');const old=d.prepare('SELECT hash FROM legal_documents WHERE id=?').get(record.id) as {hash:string}|undefined;if(old?.hash===hash)return;
 d.exec('BEGIN IMMEDIATE');try{d.prepare('INSERT INTO legal_documents VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,metadata=excluded.metadata,hash=excluded.hash,status=excluded.status,reviewer=excluded.reviewer').run(record.id,record.version,JSON.stringify(record),hash,record.status,reviewer);d.prepare('DELETE FROM legal_chunks WHERE documentId=?').run(record.id);for(const chunk of chunkText(text))d.prepare('INSERT INTO legal_chunks VALUES(?,?)').run(record.id,chunk);d.exec('COMMIT');}catch(e){d.exec('ROLLBACK');throw e;}
}
export function searchIndexedKnowledge(query:string,limit=4){const terms=[...new Set(tokens(query))].slice(0,20);if(!terms.length)return [];const rows=legalIndex().prepare(`SELECT d.metadata,c.text,bm25(legal_chunks) AS rank FROM legal_chunks c JOIN legal_documents d ON d.id=c.documentId WHERE legal_chunks MATCH ? AND d.status IN ('reviewed','needs-review') ORDER BY rank LIMIT ?`).all(terms.map(t=>'"'+t+'"').join(' OR '),Math.min(limit*3,30)) as unknown as {metadata:string;text:string}[];const found=new Set<string>();return rows.map(row=>({record:JSON.parse(row.metadata) as LegalRecord,excerpt:row.text})).filter(row=>{if(found.has(row.record.id))return false;found.add(row.record.id);return true}).slice(0,limit);}
