import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {act,create,type ReactTestInstance,type ReactTestRenderer} from 'react-test-renderer';
import FinancialRecords from '../components/financial-records';
import {fictionalFinancialLedger} from '../lib/financial/demo';
import {analyzeFinancials} from '../lib/financial/analytics';
import {reviewTransactions} from '../lib/financial/reviews';
import {emptyLedger} from '../lib/financial/types';
import {demoWorkspace} from '../lib/workspace';
import {paise,rupees} from '../lib/financial/money';
import {readFinancialResponse,statementSelectionError} from '../lib/financial/http';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});

test('financial inputs retain edits across method changes, correction saves, figure saves and remount',async()=>{
 const originalFetch=globalThis.fetch,windowDescriptor=Object.getOwnPropertyDescriptor(globalThis,'window');
 Object.defineProperty(globalThis,'window',{configurable:true,value:{dispatchEvent(){},confirm(){return true;}}});
 const workspace={...demoWorkspace('judge'),demo:false};let ledger=fictionalFinancialLedger(),revision=1,gets=0;
 const requests:Record<string,unknown>[]=[];
 const response=()=>({revision,imports:ledger.imports.map(({file:_,...i})=>i),transactions:ledger.transactions,summary:analyzeFinancials(ledger,workspace,'2026-10-26'),audit:ledger.audit});
 globalThis.fetch=async(_url,options)=>{
  if(!options?.method){gets++;return Response.json(response());}
  const request=JSON.parse(String(options.body));requests.push(request);
  if(request.action==='correct'||request.action==='confirm')ledger=reviewTransactions(ledger,request.importId,request.changes,request.coverageConfirmed,request.action==='confirm');
  else if(request.action==='figure')ledger={...ledger,confirmedFigure:{amount:rupees(paise(request.amount)),financialYear:request.financialYear,definition:request.definition,reference:request.reference,at:'2026-10-26'}};
  revision++;return Response.json(response());
 };
 let renderer:ReactTestRenderer|undefined;
 const mount=async()=>{await act(async()=>{renderer=create(React.createElement(FinancialRecords,{workspace,demoLedger:emptyLedger(),onDemoChange:()=>{},onExplain:()=>{}}));});};
 const field=(name:string)=>renderer!.root.findAll(n=>typeof n.type==='string'&&n.props['aria-label']===name)[0];
 const button=(name:string)=>renderer!.root.findAllByType('button').find(b=>b.children.some(c=>typeof c==='string'&&c===name))!;
 const checkbox=(label:string)=>renderer!.root.findAllByType('label').find(l=>l.children.some(c=>typeof c==='string'&&c.includes(label)))!.findByType('input');
 const change=async(node:ReactTestInstance,value:string)=>act(async()=>{node.props.onChange({target:{value}});});
 try{
  await mount();assert.equal(gets,1);
  const a=ledger.transactions.find(t=>t.description.includes('AMBIGUOUS-A'))!,b=ledger.transactions.find(t=>t.description.includes('AMBIGUOUS-B'))!;
  await change(field('Category for '+a.reference),'Owner investment');
  await change(field('Sales forecast method'),'weighted');
  assert.equal(field('Category for '+a.reference).props.value,'Owner investment');assert.equal(gets,1,'method changes must not reload and wipe drafts');
  await change(field('Category for '+b.reference),'Owner withdrawal');
  await act(async()=>checkbox('This statement covers').props.onChange({target:{checked:true}}));
  await act(async()=>checkbox('I reviewed every category').props.onChange({target:{checked:true}}));
  await act(async()=>button('Save corrections').props.onClick());
  assert.equal(checkbox('This statement covers').props.checked,true);
  assert.equal(checkbox('I reviewed every category').props.checked,true);
  await act(async()=>button('Confirm reviewed summary').props.onClick());
  assert.equal(requests.at(-1)?.coverageConfirmed,true);
  assert.equal(analyzeFinancials(ledger,workspace,'2026-10-26').projection.projectedSales,'4200000.00');
  const customer=ledger.transactions.find(t=>t.category==='Customer sales receipt')!;
  await change(field('Category for '+customer.reference),'Loan received');
  await change(field('Reviewed supply amount'),'0');
  await change(field('Reviewed figure financial year'),'2025-26');
  await change(field('Turnover definition'),'Owner reconciled supplies');
  await change(field('Reviewed figure reference'),'Fictional invoice evidence');
  assert.equal(button('Save separate reviewed figure').props.disabled,false);
  await act(async()=>button('Save separate reviewed figure').props.onClick());
  assert.equal(requests.at(-1)?.financialYear,'2025-26');assert.equal(ledger.confirmedFigure?.amount,'0.00');
  assert.equal(field('Category for '+customer.reference).props.value,'Loan received','saving a separate figure must preserve category drafts');
  await act(async()=>renderer!.unmount());await mount();
  assert.equal(field('Reviewed supply amount').props.value,'0.00');
  assert.equal(field('Reviewed figure financial year').props.value,'2025-26');
  assert.equal(field('Category for '+customer.reference).props.value,'Customer sales receipt','unsaved edits must not persist as confirmed data');
  assert.equal(ledger.imports[0].confirmed,true);assert.equal(workspace.profile.turnover,1800000);
 }finally{if(renderer)await act(async()=>renderer!.unmount());globalThis.fetch=originalFetch;if(windowDescriptor)Object.defineProperty(globalThis,'window',windowDescriptor);else Reflect.deleteProperty(globalThis,'window');}
});

test('upload controls send the selected file dates account and consent and retain inputs on errors',async()=>{
 const originalFetch=globalThis.fetch,windowDescriptor=Object.getOwnPropertyDescriptor(globalThis,'window');let changed=0;
 Object.defineProperty(globalThis,'window',{configurable:true,value:{dispatchEvent(){changed++;},confirm(){return true;}}});
 const workspace={...demoWorkspace('judge'),demo:false};let ledger=emptyLedger(),rejectUpload=false;
 globalThis.fetch=async(_url,options)=>{
  if(options?.method==='POST'){
   const body=options.body as FormData;assert.equal(body.get('account'),'Fictional editable account');assert.equal(body.get('from'),'2026-04-01');assert.equal(body.get('to'),'2026-09-30');assert.equal(body.get('consent'),'yes');assert.ok(body.get('file') instanceof File);
   if(rejectUpload)return Response.json({error:'Unsupported PDF layout. Use the supported CSV export.'},{status:400});ledger=fictionalFinancialLedger();
   return Response.json({revision:1,added:36,duplicate:false,importId:ledger.imports[0].id,imports:ledger.imports,transactions:ledger.transactions,audit:ledger.audit,summary:analyzeFinancials(ledger,workspace,'2026-10-26')});
  }
  return Response.json({revision:0,imports:[],transactions:[],audit:[],summary:analyzeFinancials(ledger,workspace,'2026-10-26')});
 };
 let renderer:ReactTestRenderer|undefined;
 try{
  await act(async()=>{renderer=create(React.createElement(FinancialRecords,{workspace,demoLedger:emptyLedger(),onDemoChange:()=>{},onExplain:()=>{}}));});
  const field=(name:string)=>renderer!.root.findAll(n=>typeof n.type==='string'&&n.props['aria-label']===name)[0];
  const extract=()=>renderer!.root.findAllByType('button').find(b=>b.children.includes('Extract transactions'))!;
  assert.equal(extract().props.disabled,true);
  for(const [name,value] of [['Account label','Fictional editable account'],['Statement period from','2026-04-01'],['Statement period to','2026-09-30']])await act(async()=>field(name).props.onChange({target:{value}}));
  const consent=()=>renderer!.root.findAllByType('input').find(n=>n.props.type==='checkbox')!;
  const choose=async(name:string,type:string)=>act(async()=>field('Upload bank statement').props.onChange({target:{files:[new File(['fictional sample'],name,{type})],value:name}}));
  await choose('fictional.csv','text/csv');assert.equal(extract().props.disabled,true);
  await act(async()=>consent().props.onChange({target:{checked:true}}));assert.equal(extract().props.disabled,false);
  await act(async()=>extract().props.onClick());assert.equal(changed,1);assert.equal(ledger.transactions.length,36);
  assert.ok(renderer!.root.findAllByType('select').some(n=>n.props['aria-label']==='Category for FICTIONAL-1'));
  rejectUpload=true;await choose('unsupported.pdf','application/pdf');await act(async()=>consent().props.onChange({target:{checked:true}}));
  await act(async()=>extract().props.onClick());
  assert.equal(field('Account label').props.value,'Fictional editable account');assert.equal(field('Statement period from').props.value,'2026-04-01');assert.equal(field('Statement period to').props.value,'2026-09-30');
  assert.equal(renderer!.root.findAll(n=>typeof n.type==='string'&&n.props.role==='alert')[0].children.join(''),'Unsupported PDF layout. Use the supported CSV export.');assert.equal(changed,1);
 }finally{if(renderer)await act(async()=>renderer!.unmount());globalThis.fetch=originalFetch;if(windowDescriptor)Object.defineProperty(globalThis,'window',windowDescriptor);else Reflect.deleteProperty(globalThis,'window');}
});

test('bodyless or non-JSON HTTP rejections show clear errors and oversized files are caught before upload',async()=>{
 await assert.rejects(readFinancialResponse(new Response(null,{status:413})),/too large/);
 await assert.rejects(readFinancialResponse(new Response('<html>proxy error</html>',{status:503})),/could not be completed/);
 await assert.rejects(readFinancialResponse(new Response(null,{status:401})),/sign in again/);
 await assert.rejects(readFinancialResponse(new Response(null,{status:200})),/incomplete financial response/);
 assert.deepEqual(await readFinancialResponse(Response.json({revision:1})),{revision:1});
 assert.match(statementSelectionError({name:'large.csv',size:500001})!,/500 KB/);
 assert.match(statementSelectionError({name:'large.pdf',size:2097153})!,/2 MB/);
 assert.match(statementSelectionError({name:'empty.csv',size:0})!,/empty/);
 assert.match(statementSelectionError({name:'script.html',size:10})!,/CSV or supported text PDF/);
 assert.equal(statementSelectionError({name:'sample.csv',size:500000}),null);
});
