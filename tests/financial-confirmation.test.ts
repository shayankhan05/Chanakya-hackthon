import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {fictionalFinancialLedger} from '../lib/financial/demo';
import {reviewTransactions} from '../lib/financial/reviews';
import {analyzeFinancials} from '../lib/financial/analytics';
import type {Category} from '../lib/financial/types';
import {demoWorkspace} from '../lib/workspace';
import FinancialSnapshot from '../components/financial-summary';

test('demo confirmation changes the dashboard financial outlook using the same reviewed ledger',()=>{
 const workspace=demoWorkspace('judge'),ledger=fictionalFinancialLedger();
 const render=(summary:ReturnType<typeof analyzeFinancials>)=>renderToStaticMarkup(createElement(FinancialSnapshot,{workspace,demoSummary:summary,onOpen:()=>{}}));
 assert.match(render(analyzeFinancials(ledger,workspace,'2026-10-26')),/Insufficient data for a reliable estimate/);
 const changes=ledger.transactions.map(t=>({id:t.id,category:(t.description.includes('AMBIGUOUS-A')?'Owner investment':t.description.includes('AMBIGUOUS-B')?'Owner withdrawal':t.category) as Category}));
 const confirmed=reviewTransactions(ledger,ledger.imports[0].id,changes,true);
 const summary=analyzeFinancials(confirmed,workspace,'2026-10-26'),html=render(summary);
 assert.equal(summary.projection.projectedSales,'4200000.00');
 assert.match(html,/4200000.00/);
 assert.match(html,/0 unconfirmed statements/);
 assert.match(html,/Fictional demo/);
 const tasks=renderToStaticMarkup(createElement(FinancialSnapshot,{workspace,demoSummary:summary,onOpen:()=>{},reviewTasksOnly:true}));assert.match(tasks,/Review GST turnover evidence/);assert.match(tasks,/Review financial evidence/);assert.match(tasks,/not confirmed filing or registration duties/);
 assert.ok(!html.includes('Insufficient data for a reliable estimate'));
 assert.equal(workspace.profile.turnover,1800000);
 assert.equal(ledger.imports[0].confirmed,false);
});

test('confirmation requires ambiguous demo rows to be resolved and coverage to enable a forecast',()=>{
 const workspace=demoWorkspace('judge'),ledger=fictionalFinancialLedger(),id=ledger.imports[0].id;
 assert.throws(()=>reviewTransactions(ledger,id,ledger.transactions.map(t=>({id:t.id,category:t.category})),true),/uncertain transaction/);
 const changes=ledger.transactions.map(t=>({id:t.id,category:(t.description.includes('AMBIGUOUS-A')?'Owner investment':t.description.includes('AMBIGUOUS-B')?'Owner withdrawal':t.category) as Category}));
 const confirmed=reviewTransactions(ledger,id,changes,false),summary=analyzeFinancials(confirmed,workspace,'2026-10-26');
 assert.equal(confirmed.imports[0].confirmed,true);
 assert.equal(summary.months[0].salesReceipts,'350000.00');
 assert.equal(summary.projection.projectedSales,null);
});
