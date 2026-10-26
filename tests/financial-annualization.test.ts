import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {fictionalFinancialLedger} from '../lib/financial/demo';
import {boundaryStatementCSV} from '../lib/financial/fixtures';
import {parseStatement} from '../lib/financial/parser';
import {reviewTransactions} from '../lib/financial/reviews';
import {analyzeFinancials} from '../lib/financial/analytics';
import type {Category} from '../lib/financial/types';
import {demoWorkspace} from '../lib/workspace';
import {FinancialResult} from '../components/financial-summary';
const workspace=demoWorkspace('judge'),asOf='2026-10-26';
function confirmedSample(){const ledger=fictionalFinancialLedger(),record=ledger.imports[0];record.from='2026-04-03';record.to='2026-09-28';ledger.transactions=parseStatement(boundaryStatementCSV(),record.account).map(t=>({...t,importIds:[record.id]}));record.transactionIds=ledger.transactions.map(t=>t.id);return reviewTransactions(ledger,record.id,ledger.transactions.map(t=>({id:t.id,category:(t.description.includes('AMBIGUOUS-A')?'Owner investment':t.description.includes('AMBIGUOUS-B')?'Owner withdrawal':t.category) as Category})),true);}
test('four complete months annualize the requested May–August receipts to exactly INR 42,75,000 without modifying records',()=>{
 const ledger=confirmedSample(),before=JSON.stringify(ledger),profileBefore=JSON.stringify(workspace),s=analyzeFinancials(ledger,workspace,asOf);
 assert.deepEqual(s.projection.monthsUsed,['2026-05','2026-06','2026-07','2026-08']);assert.deepEqual(s.projection.missingMonths,['2026-04','2026-09']);
 assert.deepEqual(s.months.filter(m=>m.complete).map(m=>m.salesReceipts),['350000.00','350000.00','350000.00','375000.00']);
 assert.equal(s.projection.salesToDate,'1425000.00');assert.equal(s.projection.monthlyRunRate,'356250.00');assert.equal(s.projection.projectedSales,'4275000.00');
 assert.equal(s.projection.status,'provisional');assert.equal(s.projection.basis,'annualized-run-rate');assert.equal(s.projection.method,'average');assert.ok(s.projection.dataQualityWarning.includes('not verified annual turnover'));
 assert.equal(s.ownerDeclaredTurnover,'1800000.00');assert.equal(JSON.stringify(ledger),before);assert.equal(JSON.stringify(workspace),profileBefore);
 assert.ok(s.warnings.some(w=>w.ruleId==='GST'&&w.message.includes('provisional annualized')));assert.ok(s.warnings.every(w=>w.message.includes('not confirmed statutory turnover')));
 const html=renderToStaticMarkup(React.createElement(FinancialResult,{summary:s}));for(const text of ['Provisional annual sales estimate','₹42,75,000','Months used:','May 2026','August 2026','Calculation method:','Missing or incomplete months:','April 2026','September 2026','Data-quality warning:'])assert.ok(html.includes(text),text);
});
test('annualized estimate excludes boundary receipts non-sales unreviewed months and incomplete account coverage',()=>{
 const ledger=confirmedSample();for(const t of ledger.transactions)if(t.date.startsWith('2026-04')||t.date.startsWith('2026-09'))t.credit=t.credit==='0.00'?'0.00':'9999999.00';
 assert.equal(analyzeFinancials(ledger,workspace,asOf).projection.projectedSales,'4275000.00');
 ledger.transactions.find(t=>t.date.startsWith('2026-08'))!.reviewed=false;assert.equal(analyzeFinancials(ledger,workspace,asOf).projection.projectedSales,null);
 const unconfirmed=confirmedSample();unconfirmed.imports[0].confirmed=false;assert.equal(analyzeFinancials(unconfirmed,workspace,asOf).projection.projectedSales,null);
 const noCoverage=confirmedSample();noCoverage.imports[0].coverageConfirmed=false;assert.equal(analyzeFinancials(noCoverage,workspace,asOf).projection.projectedSales,null);
});
test('weighted selection explicitly falls back to a simple provisional rate and future/current months are excluded',()=>{
 const ledger=confirmedSample(),s=analyzeFinancials(ledger,workspace,asOf,'weighted');assert.equal(s.projection.projectedSales,'4275000.00');assert.equal(s.projection.method,'average');assert.equal(s.projection.requestedMethod,'weighted');assert.ok(s.projection.assumptions.some(a=>a.includes('not a weighted forecast')));
 assert.equal(analyzeFinancials(ledger,workspace,'2026-08-20').projection.projectedSales,null);assert.equal(analyzeFinancials(ledger,workspace,'2027-04-01').projection.projectedSales,null);
});
test('annualization rounds the annual ratio once instead of multiplying an already rounded monthly rate',()=>{
 const ledger=confirmedSample();for(const t of ledger.transactions)if(t.category==='Customer sales receipt')t.credit='0.00';ledger.transactions.find(t=>t.date==='2026-05-03')!.credit='0.01';const s=analyzeFinancials(ledger,workspace,asOf);assert.equal(s.projection.monthlyRunRate,'0.00');assert.equal(s.projection.projectedSales,'0.03');
});
