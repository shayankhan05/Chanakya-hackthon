import type { Profile } from './data';
export type Rule = { code: string; label: string; field: 'employees'|'turnover'|'branches'|'firstExport'; operator: 'gte'|'gt'|'eq'; value: number; reason: string };
export const rules: Rule[] = [
 {code:'POSH',label:'POSH',field:'employees',operator:'gte',value:10,reason:'10+ employees: review Internal Committee requirements.'},
 {code:'ESI',label:'ESI',field:'employees',operator:'gte',value:10,reason:'10+ employees: confirm notified establishment, area and wage coverage.'},
 {code:'EPF',label:'EPF',field:'employees',operator:'gte',value:20,reason:'20+ employees: review establishment and employee coverage.'},
 {code:'GST',label:'GST',field:'turnover',operator:'gt',value:2000000,reason:'Services turnover exceeds the illustrative ₹20 lakh threshold. State and compulsory-registration exceptions require review.'},
 {code:'IEC',label:'IEC Registration',field:'firstExport',operator:'eq',value:1,reason:'First export: review IEC requirements and exemptions for the goods or services involved.'},
 {code:'PT',label:'Professional Tax',field:'branches',operator:'gte',value:1,reason:'State-specific professional tax review required.'},
 {code:'SHOP',label:'Shops & Establishment',field:'branches',operator:'gte',value:1,reason:'Review the establishment registration requirements in each branch state.'},
];
export function evaluate(p: Profile, input: Rule[] = rules) { return input.filter(r=> { const n=Number(p[r.field]); return r.operator==='gte'?n>=r.value:r.operator==='gt'?n>r.value:n===r.value; }).map(r=>({...r,reviewRequired:true})); }
export function detectEvents(before:Profile,after:Profile) {return [before.employees!==after.employees?'Employee count changed':null,before.turnover!==after.turnover?'Annual turnover changed':null,after.branches>before.branches?'New branch added':null,!before.firstExport&&after.firstExport?'First export recorded':null].filter(Boolean) as string[];}
