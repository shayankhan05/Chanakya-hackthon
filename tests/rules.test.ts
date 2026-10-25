import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,detectEvents} from '../lib/rules';
import {initialProfile} from '../lib/data';
test('employee thresholds include boundary and exclude below boundary',()=>{for(const [n,posh,epf] of [[9,false,false],[10,true,false],[19,true,false],[20,true,true]] as const){const codes=evaluate({...initialProfile,employees:n}).map(r=>r.code);assert.equal(codes.includes('POSH'),posh);assert.equal(codes.includes('EPF'),epf)}});
test('turnover threshold is strict and exports add IEC review',()=>{assert.equal(evaluate({...initialProfile,turnover:2000000}).some(r=>r.code==='GST'),false);assert.equal(evaluate({...initialProfile,firstExport:true}).some(r=>r.code==='IEC'),true)});
test('event detection only emits changed business attributes',()=>{assert.deepEqual(detectEvents(initialProfile,initialProfile),[]);assert.equal(detectEvents(initialProfile,{...initialProfile,employees:30,branches:2,firstExport:true}).length,3)});
