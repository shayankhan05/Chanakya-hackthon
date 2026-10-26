// Architecture only. No provider is registered and no bank credentials are accepted.
export type BankConsent={id:string;status:'pending'|'active'|'expired'|'revoked'|'failed';expiresAt:string;scope:{accounts:string[];from:string;to:string;purpose:string}};
export interface AuthorizedBankProvider {
 initiateConsent(request:{businessId:string;returnUrl:string;scope:BankConsent['scope']}):Promise<BankConsent>;
 consentStatus(consentId:string):Promise<BankConsent>;
 transactions(consentId:string):Promise<{date:string;description:string;credit:string;debit:string;reference:string}[]>;
 revoke(consentId:string):Promise<void>;
 normalizeError(error:unknown):{code:string;message:string;retryable:boolean};
}
export const bankConnectionStatus={enabled:false,label:'Coming later',reason:'Requires a legitimate consent-based Account Aggregator/FIU or authorized partner arrangement. ComplianceCopilot is not represented as a licensed AA or regulated FIU.'} as const;
