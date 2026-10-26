import type {Category,FinancialTransaction} from './types';
export function correctionKey(t:Pick<FinancialTransaction,'account'|'description'|'credit'>){return JSON.stringify([t.account,t.description.toLowerCase().replace(/\b\d+\b/g,'#').replace(/\s+/g,' ').trim(),t.credit!=='0.00'?'credit':'debit']);}
export function suggest(description:string,credit:boolean):{category:Category;reason:string}{
 const q=description.toLowerCase();const options:[RegExp,Category,string][]=[[/refund|reversal|reversed|chargeback/,'Refund or reversal','Refund/reversal wording; determine its commercial treatment.'],[/own account|self transfer|internal transfer/,'Transfer between own accounts','Explicit own-account transfer wording.'],[/owner investment|capital introduced|capital contribution/,'Owner investment','Explicit owner-capital wording.'],[/owner withdrawal|drawings/,'Owner withdrawal','Explicit owner-withdrawal wording.'],[/loan (?:received|disburs)|loan credit/,'Loan received','Loan receipt wording is financing, not sales.'],[/loan repay|loan emi|\bemi\b/,'Loan repayment','Loan repayment needs principal/interest separation.'],[/salary|payroll|wages/,'Salary expense','Salary/payroll wording.'],[/\brent\b/,'Rent','Rent wording.'],[/\bgst\b|\btds\b|tax payment|income tax/,'Tax payment','Tax payment is kept separate from operating costs.'],[/customer|sales receipt|invoice payment/,'Customer sales receipt','Customer/invoice wording suggests a receipt, not verified revenue.'],[/supplier|utilities|electricity|internet bill|business expense/,'Business expense','Explicit operating-payment wording.']];
 for(const [match,category,reason] of options)if(match.test(q)){
  const incoming=['Customer sales receipt','Loan received','Owner investment'].includes(category);
  const either=['Transfer between own accounts','Refund or reversal'].includes(category);
  if(!either&&incoming!==credit)return {category:'Other / Needs review',reason:'Description and money direction conflict. Please confirm what this transaction is for.'};
  return {category,reason:reason+' Owner review is required.'};
 }
 return {category:'Other / Needs review',reason:'Please confirm what this transaction is for.'};
}
