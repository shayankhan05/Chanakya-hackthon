import {test} from 'node:test';
import assert from 'node:assert/strict';
import {legalIndex,searchIndexedKnowledge} from '../lib/legal-index';
test('Vercel rebuilds public legal index in memory without writing a local database',()=>{
 process.env.VERCEL='1';process.env.LEGAL_INDEX_PATH='/invalid/read-only/location/knowledge.sqlite';
 const databases=legalIndex().prepare('PRAGMA database_list').all() as {name:string;file:string}[];
 assert.equal(databases.find(d=>d.name==='main')?.file,'');
 assert.ok(searchIndexedKnowledge('GST credit').length>0);
});
