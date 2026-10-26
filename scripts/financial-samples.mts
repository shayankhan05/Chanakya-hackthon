import {mkdir,writeFile} from 'node:fs/promises';
import {fictionalStatementCSV,boundaryStatementCSV,textStatementPDF,pdfExampleLines} from '../lib/financial/fixtures';
await mkdir('public/samples',{recursive:true});
await mkdir('test-data/financial',{recursive:true});
await writeFile('test-data/financial/fictional-partial-months-2026.csv',boundaryStatementCSV());
await writeFile('test-data/financial/fictional-six-month-bank-statement.csv',fictionalStatementCSV());
await writeFile('public/samples/fictional-six-month-bank-statement.csv',fictionalStatementCSV());
await writeFile('public/samples/supported-statement.pdf',textStatementPDF(pdfExampleLines));
console.log('Created fictional CSV and supported text-PDF examples. No accounts or business data changed.');
