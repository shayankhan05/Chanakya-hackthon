import {test} from 'node:test';
import assert from 'node:assert/strict';
import {usesPostgres} from '../lib/storage-config';
import {encryptFinancial,decryptFinancial} from '../lib/financial/crypto';
test('Vercel business storage fails closed for missing DB, SQLite and implicit driver',()=>{
 for(const env of [{VERCEL:'1'},{VERCEL:'1',STORAGE_DRIVER:'sqlite',DATABASE_URL:'postgresql://test'},{VERCEL:'1',DATABASE_URL:'postgresql://test'}])assert.throws(()=>usesPostgres(env),/persistent DATABASE_URL/);
 assert.equal(usesPostgres({VERCEL:'1',STORAGE_DRIVER:'postgres',DATABASE_URL:'postgresql://test'}),true);
 assert.equal(usesPostgres({STORAGE_DRIVER:'sqlite'}),false);
});
test('Encrypted evidence cannot be decrypted as another document or business',()=>{
 process.env.NEXTAUTH_SECRET='isolated-production-storage-test-secret-123456';
 const bytes=Buffer.from('Fictional private evidence'),encrypted=encryptFinancial(bytes,'business-a','evidence:file-a');
 assert.ok(!encrypted.includes(bytes.toString()));
 assert.deepEqual(decryptFinancial(encrypted,'business-a','evidence:file-a'),bytes);
 assert.throws(()=>decryptFinancial(encrypted,'business-b','evidence:file-a'),/decrypted/);
 assert.throws(()=>decryptFinancial(encrypted,'business-a','evidence:file-b'),/decrypted/);
 assert.throws(()=>decryptFinancial(encrypted.slice(0,-4)+'AAAA','business-a','evidence:file-a'),/decrypted/);
});
