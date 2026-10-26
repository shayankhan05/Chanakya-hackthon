export function paise(raw:string):bigint{
 let s=raw.trim().replace(/^(?:₹|INR|Rs\.?)\s*/i,'').trim();
 if(s.startsWith('.'))s='0'+s;
 if(!/^(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,2}(?:,\d{2})*,\d{3})(?:\.\d{1,2})?$/.test(s))throw Error('Amounts must be nonnegative rupees with at most two decimal places.');
 s=s.replaceAll(',','');const [whole,fraction='']=s.split('.');const n=BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));if(n>1000000000000000n)throw Error('Amount exceeds the supported limit.');return n;
}
export function rupees(n:bigint){return `${n<0n?'-':''}${(n<0n?-n:n)/100n}.${String((n<0n?-n:n)%100n).padStart(2,'0')}`;}
export const roundedDivide=(n:bigint,d:bigint)=>(n+d/2n)/d;
