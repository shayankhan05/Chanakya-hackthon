import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFinancialBody,FinancialBodyError} from '../lib/financial/request-body';
test('financial body returns exact allowed content and drains a modest known oversize before 413',async()=>{
 const body='fictional review';assert.equal((await readFinancialBody(new Request('http://local.test',{method:'POST',body}),body.length)).toString(),body);
 const request=new Request('http://local.test',{method:'POST',headers:{'content-length':'400015'},body:'x'.repeat(400015)});
 await assert.rejects(readFinancialBody(request,400000),(e:unknown)=>e instanceof FinancialBodyError&&e.status===413);
 assert.equal(request.body?.locked,false);assert.equal(request.bodyUsed,true);
});
test('unknown-length excess is discarded with a hard drain cap and huge declared input is rejected immediately',async()=>{
 let cancelled=false;
 const stream=new ReadableStream<Uint8Array>({pull(controller){controller.enqueue(new Uint8Array(600000));},cancel(){cancelled=true;}});
 const request=new Request('http://local.test',{method:'POST',body:stream,duplex:'half'} as RequestInit&{duplex:'half'});
 await assert.rejects(readFinancialBody(request,400000),(e:unknown)=>e instanceof FinancialBodyError&&e.status===413);assert.equal(cancelled,true);
 const huge=new Request('http://local.test',{method:'POST',headers:{'content-length':'9000000'},body:'small'});
 await assert.rejects(readFinancialBody(huge,400000),(e:unknown)=>e instanceof FinancialBodyError&&e.status===413);assert.equal(huge.bodyUsed,false);
});
