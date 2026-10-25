# Indian legal intelligence and calculation upgrade

Implemented and tested on 25 October 2026 in the existing ComplianceCopilot application. Open the dashboard's **Tax & Contribution Calculator**, or the sample screen at http://127.0.0.1:3001/demo#calculator.

## Repository audit and implementation

The application uses Next.js 15 App Router, TypeScript, Tailwind, existing shadcn-style controls and NextAuth credentials sessions. The active repository adapter uses Node SQLite and stores authorized business workspace payloads in `.data/compliance.sqlite`. Prisma retains the optional PostgreSQL path. No migration, account deletion, database reset or replacement of the existing business engine was performed.

The upgrade adds a separate legal corpus and index, deterministic calculator services, a server-validated calculation endpoint, a simple calculator view and chatbot calculation routing. Existing onboarding, growth simulation/history, tasks, certificates, uploads, reports and authentication remain in place. Tests create synthetic accounts and business records; existing records are preserved.

Architecture: authorized business records + existing deterministic applicability engine + curated legal retrieval + exact financial arithmetic + optional OpenAI Responses language/tool integration. No foundation model was trained.

## What is complete

- GST calculator: multiple supply lines and different user-supplied rates; inclusive/exclusive pricing; ordinary CGST/SGST, CGST/UTGST or IGST split; eligible head-wise credit allocation; remaining credit; invoice total and estimated cash liability.
- Separate income-tax screen: numerical estimates only for ordinary-income partnership firms and LLPs for FY 2025–26 / AY 2026–27. Other types and years return a review message.
- Conditional employee contribution estimators: EPF employee/employer and EPS split, or ESI employee/employer contributions, using explicitly confirmed bases and eligibility.
- Natural-language GST arithmetic, missing-rate questions and multi-turn amount/rate follow-ups. Profit questions distinguish GST from income tax. EPF/ESI chat asks for required wage facts and links to the complete form.
- Source register with searchable topic cards, provision/version metadata, review status, official links and information gaps.
- Server-side public legal full-text index and an administrator CLI for authorized document ingestion/review. There is no public financial-document upload or new external scraping service.
- Calculation export as JSON, containing the input snapshot, breakdown, assumptions and sources. Calculations do not write business facts or payroll records.

## Legal coverage and verification

The source registry contains **24 records over 22 distinct indexed official URLs**. **15 records have `reviewed` status; 9 explicitly require current-provision or jurisdiction review.** “Reviewed” means the stated bounded summary was checked; it does not certify every amendment or the user's applicability. Previously existing source records retain their 24 October 2026 review date; new source reviews are dated 25 October 2026. Unknown publication/effective dates are null, rather than fabricated.

Topics include GST registration and valuation, HSN/SAC and rate review, ITC utilization, zero rating/export conditions, return/special-treatment review, ordinary firm income tax and year transition, EPF/EPS, ESI, labour-code transition, POSH, MSME/Udyam, delayed-payment review, LLP Form 8, food licensing and phased data-protection review. Existing state professional-tax and workplace records remain conditional.

Authorities indexed: CBIC, GST Council, India Code, Income Tax Department, EPFO, ESIC, Ministry of Labour, Ministry of MSME/Udyam, DGFT, MCA, FSSAI, MeitY and the previously supported Maharashtra departments. Key arithmetic references:

- [CBIC valuation section 15](https://taxinformation.cbic.gov.in/content-page/explore-act/1000284/1000001).
- [CBIC Circular 98/17/2019-GST, credit utilization](https://cbic-gst.gov.in/pdf/Circular-98-17-2019-GST.pdf).
- [IGST section 16, zero-rated supplies](https://taxinformation.cbic.gov.in/content-page/explore-act/1000624/1000001/section%2016/ACTS).
- [Income Tax Department firm/LLP AY 2026–27](https://www.incometax.gov.in/iec/foportal/help/partnership-firm-llp), [section 288A](https://www.incometaxindia.gov.in/w/section-288a-62), [section 288B](https://www.incometaxindia.gov.in/w/section-288b-58).
- [EPFO historical rate table](https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/ContributionRate.pdf) and [current employer portal revision notice](https://unifiedportal-emp.epfindia.gov.in/epfo/?accesscheck=employer_home.php).
- [ESIC budget material with rates and daily-wage exemption](https://www.esic.gov.in/attachments/publicationfile/b830b6c5a968aae81fdbc3a09e9063fb.pdf).

Industries share the existing general business screening. Food businesses gain a source-backed licensing review. Manufacturing/construction use conditional labour guidance, and digital businesses gain privacy review material. Healthcare-specific licensing, comprehensive Companies Act filing schedules, consumer/contract law coverage, exact state payroll schedules and arbitrary industry rules are not implemented as authoritative determinations.

## Exact calculation assumptions

All financial arithmetic uses **BigInt integer paise**. API money and rates are decimal strings; natural-language rupee/lakh/crore parsing also uses integers. Rounding is explicit.

### GST

Exclusive GST = taxable amount × rate / 100. Inclusive tax = invoice amount × rate / (100 + rate). Lines round half-up to paise. Intra-state tax is split into central and state/UT components; tax components sum to the line tax. State selections must be recognized Indian jurisdictions. The legal place of supply is provided by the user, not automatically inferred from a customer address.

Credit allocation uses IGST against IGST first, then central/state liabilities; all usable IGST is consumed before central/state credits. The algorithm directs IGST to head deficits first. CGST offsets CGST then IGST; state/UT credit offsets its own head then IGST. CGST and SGST never offset each other. Excess credit remains credit, **never a claimed cash refund**.

Rates between 0 and 40 with at most two decimals are permitted as arithmetic inputs, not represented as a list of notified rates. HSN/SAC/rate verification is separate. Registration uncertainty produces an explicit arithmetic-only warning. Credit requires an eligibility confirmation. Exempt supplies with credit require review; zero-rated output assumes a valid eligible LUT/bond route. Reverse charge and special/composition schemes are blocked. Cess, blocked-credit determination/reversals, minimum-cash obligations, interest, late fees, refunds and complete return liability are outside scope. Credit-allocation support starts 29 March 2019; future legal changes are not presumed.

### Income tax

Supported scenario: ordinary firm/LLP income, FY 2025–26 only, after the user confirms lawful tax adjustments and no AMT/special-rate income/foreign-credit issues. Tax is 30%, surcharge 12% above ₹1 crore with marginal relief, then cess 4%. Taxable income and final tax use nearest-₹10 rounding. This is annual tax, not remaining tax payable after TDS/TCS, advance tax or interest. Individuals, companies, later years and other regimes return no precise amount.

### Payroll

Supported dates: 21 November 2025 through 25 October 2026, conditional on independently confirmed operative parameters. The calculator does not certify wage definitions or employee eligibility.

EPF uses a confirmed 12% or special 10% category and a confirmed statutory contribution base. EPS uses a separately confirmed eligible base at 8.33%, carved from the employer contribution. Contributions round once to the nearest rupee. The EPFO portal mentions a recent ₹15,000-to-₹25,000 ceiling revision; the complete dated notification and separate EPS conditions were not established from the portal notice. **No automatic current wage ceiling is selected.** Higher-wage options, EDLI, administration charges and exemptions are outside this estimate.

ESI uses employee 0.75%, employer 3.25%, rounded upward to the next rupee. The confirmed average-daily-wage exemption is applied to the employee share at up to ₹176. An ordinary entry wage above ₹21,000 requires continuing-period confirmation; disability and other special cases require separate review. Contributions are not simply capped at the entry ceiling. The applicable April–September or October–March period is shown.

## Verified examples

| Controlled input | Verified output |
| --- | --- |
| ₹10,000 exclusive, assumed 18%, intra-state | GST ₹1,800; CGST ₹900; SGST ₹900; invoice ₹11,800 |
| ₹11,800 inclusive, assumed 18% | Taxable ₹10,000; GST ₹1,800 |
| ₹10,000 exclusive, assumed 18%, ordinary interstate | IGST ₹1,800 |
| Output CGST/SGST ₹900 each; eligible IGST ₹900 and CGST ₹900 | IGST used against state tax; CGST against central tax; estimated cash ₹0 |
| LLP ordinary taxable income ₹10 lakh, FY 2025–26 | Income tax ₹3 lakh; cess ₹12,000; estimated annual tax ₹3,12,000 |
| Confirmed EPF base ₹15,000, 12%, eligible EPS base ₹15,000 | Employee ₹1,800; employer total ₹1,800; EPS ₹1,250; employer EPF ₹550 — conditional arithmetic |
| Confirmed ESI base ₹20,000, no daily-wage exemption | Employee ₹150; employer ₹650 |

## Screen and buttons

The sidebar entry opens three tabs. **Calculate GST** asks for supply facts, item amounts, pricing and rate; **Add another supply** adds a line. Credit and special conditions are collapsed by default. **Estimate Business Income Tax** asks for taxpayer type, year and reconciled taxable income; it initially reflects the saved business structure. **Calculate Employee Contributions** asks for one employee's coverage, eligibility and wages.

**Calculate estimate** validates on the server. Missing or unsupported conditions show a review result. **Supply-by-supply breakdown**, **Credit utilization**, and **Assumptions, inputs and official sources** expand supporting detail. Remaining credits are kept in advanced detail. **Export calculation** downloads a JSON snapshot. **Legal knowledge and source register** expands the source list and filter. Changing form inputs clears a stale result. No calculation changes a saved task, registration or business profile.

## Ingestion, indexing and administrator review

The separate `.data/legal-knowledge.sqlite` holds document metadata, SHA-256 fingerprints, review status/reviewer, and FTS5 text chunks. Runtime seed summaries are curated paraphrases, not bulk-copied pages. Chunks use 1,000 characters with 150-character overlap. A small inverted text index provides initial catalogue matching; FTS5 supports source search and provider retrieval. Embeddings and vector infrastructure were not necessary for this corpus.

Commands from the project terminal:

```powershell
node node_modules/tsx/dist/cli.mjs scripts/legal-knowledge.mts index
node node_modules/tsx/dist/cli.mjs scripts/legal-knowledge.mts search "GST credit"
node node_modules/tsx/dist/cli.mjs scripts/legal-knowledge.mts ingest manifest.json extracted.txt
node node_modules/tsx/dist/cli.mjs scripts/legal-knowledge.mts review DOC-ID reviewed 2026-10-25 reviewer-name
```

Ingestion accepts reviewed local text or HTML extraction. HTML scripts/styles/tags are removed. PDF/OCR extraction is not bundled: use an authorized local extractor and review the extracted text before ingestion. No arbitrary network scraping is performed.

A manifest requires id (`DOC-...`), topic, lawName, provision, jurisdiction, official url, sourceTitle, publicationDate and effectiveDate (nullable), industries, requiredFacts, exceptions, explanation, version, keywords and accessRights equal to `Authorized public material or permission obtained`. Drafts are excluded from retrieval. A local administrator must review authority, content accuracy, commencement and exceptions before recording `reviewed` or `needs-review`; `superseded` records are excluded. Local CLI access is the administration boundary; there is no new web admin role. Newly approved documents do not silently replace calculator parameters. Do not ingest private financial/payroll documents into this public legal corpus.

## AI status, security and configuration

OPENAI_API_KEY remains absent by the user's explicit choice. **No live LLM call succeeded or was attempted in this verification.** Existing OpenAI Responses support now includes a validated calculation tool and indexed legal retrieval. Recognized calculation requests are answered directly by the deterministic service. When a model invokes the tool, the numerical breakdown is rendered directly rather than accepting independent model arithmetic. Other model explanations still require monitoring/evaluation once a key is supplied.

No key is needed for supported local guidance or calculators. Set LEGAL_INDEX_PATH only to relocate the separate index. Later, set OPENAI_API_KEY privately on the server and optionally OPENAI_MODEL and OPENAI_WEB_SEARCH; restart to apply. Do not use NEXT_PUBLIC_ for credentials. Live auth, quota, model access and remote tool behavior remain unverified.

Calculation POST requests use existing same-origin checks and business authorization. Anonymous calculation is available only as an explicit public demo with caller-supplied inputs and no business retrieval. Real calculation requests never trust a supplied profile to authorize business access. Payroll form inputs are validated server-side, not logged, not saved and not sent to an external model. Chat conversations retain their existing persistence behavior.

## Executed checks

- `npm run typecheck`: passed.
- `node node_modules/next/dist/bin/next build`: production compilation, type checks and page generation passed for the final implementation. The development server was restored on port 3001 afterward.
- `npm test`: 55 unit/repository checks passed, including 22 new calculator/chat tests and 3 full-text ingestion/index tests.
- `scripts/test-tax-e2e.mts`: authenticated GST exclusive/inclusive, IGST, credit, income-tax, EPF/ESI, authorization/validation, indexed source retrieval and 12 requested chatbot questions/follow-ups passed. Saved business records remained unchanged.
- `scripts/test-assistant-e2e.mts`: all 32 existing authenticated question checks and isolation/history/idempotency assertions passed.
- `scripts/test-http.mjs`: all 16 existing application HTTP regression checks passed, including authentication, onboarding, cross-business denial, growth/events, simulation, tasks/reports, evidence, notifications and account recovery.
- Browser: submitted the actual GST form, verified ₹10,000 / ₹1,800 / ₹11,800 and ₹900 central/state split. Screenshot: `docs/tax-calculator-verified.png`.

## Files changed

Added: `lib/calculators.ts`, `lib/calculation-chat.ts`, `lib/legal-knowledge.ts`, `lib/legal-index.ts`, `app/api/calculations/route.ts`, `app/api/legal-sources/route.ts`, `components/tax-calculator.tsx`, `scripts/legal-knowledge.mts`, `scripts/test-tax-e2e.mts`, `tests/calculators.test.ts`, `tests/legal-index.test.ts`, this report and the verification screenshot.

Updated: `lib/assistant.ts`, `lib/assistant-context.ts`, `lib/chat-provider.ts`, `lib/legal-catalogue.ts`, `app/api/chat/route.ts`, `components/dashboard.tsx`, `.env.example`.

This is bounded, explainable guidance and illustrative calculation support. It is not exhaustive Indian legal coverage, an unrestricted legal AI, an automatic GST classifier, a complete payroll system or a government-certified assessment.
