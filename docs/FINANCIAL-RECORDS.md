# Reviewed financial records and sales forecasting

Implemented for the final jury feedback on 26 October 2026. This extends the existing app and its six-section navigation; it does not replace authentication, the compliance engine, calculators, optimizer, chat or business storage.

## Where to find the feature

Open the initials/account menu → Business Profile & Settings → Financial Records. A Financial Records shortcut is also present in the account menu. The overview and Growth planner show a compact financial outlook. Risks & alerts shows provisional financial growth warnings when supported by the reviewed data.

Business details remains the existing profile form. Its annual `turnover` field and financial year remain owner-declared facts. Statement imports and forecasts never overwrite that field, never append actual business-growth events, and never mark tasks completed or create legally definitive registration tasks.

## Import and review workflow

1. Select an account label such as Operating account. Keep the same label for overlapping statements from the same account; do not enter an account number or credentials.
2. Enter the actual statement coverage start/end dates. The end cannot be in the future. Every parsed transaction must fall inside that interval.
3. Choose a supported CSV or text PDF and explicitly authorize processing and private storage.
4. Select Extract transactions. Parsed data is displayed for review; nothing is automatically confirmed as revenue.
5. Review each category. Ambiguous rows say Please confirm what this transaction is for. Correct them manually.
6. Save corrections if work is incomplete. Corrections become suggestions on subsequent matching descriptions but still require review.
7. Confirm the complete-period checkbox only if the entire selected account period is represented. It does not certify that every business account, invoice or cash transaction has been provided.
8. Confirm that every category was reviewed, then select Confirm reviewed summary.
9. Inspect monthly cash flow, reviewed customer receipts, operating payments, the forecast, missing months and assumptions.
10. A separate optional form stores an owner-reviewed supply/turnover figure with its definition, financial year and source reference. It does not label that figure independently audited or apply it automatically to the business profile.

To update actual turnover later, reconcile the legally applicable figure and year, then explicitly save it using Business details. The existing profile-save/reconciliation pipeline handles that actual change and its compliance assessment.

## Supported files

CSV is UTF-8, at most 500 KB and 2,000 transactions per file. Column order may vary. Supported header synonyms include Date/Transaction Date/Txn Date/Value Date; Description/Narration/Particulars/Transaction Details; Credit/Credit Amount/Deposit/Deposit Amount; Debit/Debit Amount/Withdrawal/Withdrawal Amount; optional Balance/Running Balance/Closing Balance and Reference/Transaction ID/UTR.

An alternative CSV layout uses Date, Description, Amount and Type, where Type explicitly states CR/Credit or DR/Debit. An unsigned Amount column without direction is rejected. Amounts can contain an INR/Rs/rupee prefix and valid Indian or international comma grouping; CSV amounts containing commas must be quoted. Precision is limited to two decimal places. Dates are YYYY-MM-DD or DD/MM/YYYY, without guessing ambiguous US-style dates.

PDF support is deliberately narrow: unencrypted text PDFs, at most 2 MB and 12 pages, whose extracted lines form a pipe-separated transaction table. The downloadable PDF example shows the supported structure. Scanned/image-only documents, password-protected documents and unsupported layouts are rejected. There is no OCR and no claim of universal bank-PDF support.

The worker has a 128 MB old-generation memory limit, a ten-second processing timeout and a 200,000-character text limit. It disables JavaScript evaluation/font rendering through the parser configuration and extracts only text. The ledger supports at most 15 imports, 5,000 transactions and approximately 10 MB of encrypted original-file storage. Oversized multipart bodies are bounded while reading, including requests without a Content-Length.

## Classification

The deterministic categories are Customer sales receipt, Business expense, Salary expense, Rent, Tax payment, Loan received, Loan repayment, Transfer between own accounts, Owner investment, Owner withdrawal, Refund or reversal, and Other / Needs review.

Explicit description terms provide a visible suggestion and reason. Direction conflicts fall back to review. Every imported row begins unreviewed, including recognizable suggestions and remembered corrections. An owner confirmation is required before those classifications support reviewed sales or operating-payment totals. Other / Needs review cannot be silently accepted as a confirmed business category.

Loans, owner capital, own-account transfers and refunds are not automatically sales. Loan repayments, tax payments and owner movements are not automatically operating expenses. Refunds remain separate because their effect on sales requires reconciliation with the underlying invoices.

## Duplicate control

Duplicate file hashes within one business return the existing import without changing the revision, including a retry with the old upload revision. Files belonging to different businesses are not exposed or cross-deduplicated.

Transactions use account/date/description/direction/amount/reference fingerprints and occurrence indices, retaining multiple legitimate same-day rows. Overlapping exports reuse matching rows. A uniquely matching row can be reused when a reference column is omitted. Ambiguous overlaps without a unique reference/balance are rejected rather than guessed. Different account labels remain separate; unstable labels, references or changed narration may require owner reconciliation. No universal fuzzy bank-transaction identity is claimed.

Deleting one import removes its encrypted original and unshared rows/corrections. Shared rows remain while another import references them. Deleting an individual transaction invalidates the affected statements' confirmation and coverage; the owner must review again before a forecast can rely on them. Delete all removes the ledger, originals, transactions, remembered corrections, reviewed figure and financial audit records from the active application database. Infrastructure backups have their own retention policies.

## Exact calculations

All parsed monetary values are stored as canonical rupee decimal strings. Arithmetic uses BigInt integer paise. JSON/Prisma never serializes a floating-point financial total. Conversion into the legacy rule engine's numeric turnover input is used only for hypothetical threshold screening; it is never persisted as business turnover.

- Money received = all extracted credit amounts for the month, including financing and transfers.
- Money paid out = all extracted debit amounts for the month.
- Net cash movement = money received minus money paid out.
- Reviewed customer receipts = credits classified as Customer sales receipt, with owner review in a confirmed statement.
- Reviewed operating payments = reviewed Business expense, Salary expense and Rent debits in a confirmed statement.
- Estimated operating cash surplus = reviewed customer receipts minus reviewed operating payments.

Raw money in/out is visible separately from reviewed classifications. Cash surplus is not accounting profit. There is no invoice/accrual module in this increment, so accounting revenue, accounting expenses and accounting profit remain explicitly unavailable/null rather than being invented from statement movements.

## April to March forecasts

Forecasts use the India financial year containing the analysis date. The live/private flow uses the actual server India date. The isolated fictional browser demonstration uses the visibly disclosed fixed date 26 October 2026 so the jury sample remains reproducible.

The forecast uses completed months through the last completed month end. The current partial month is excluded from projection inputs to avoid double counting it. Every elapsed FY month must have complete owner-confirmed statement coverage for every represented account, with no unresolved transaction classification for that month. Fully covered zero-activity months count as zero; absent months never become invented zeroes.

Average method: at least three complete FY months and no missing elapsed FY months. Monthly run-rate is reviewed receipts divided by complete months, rounded to paise.

Weighted method: at least six complete FY months and no missing elapsed FY months. The last three complete monthly receipt totals use weights 1, 2 and 3, newest highest, divided by six and rounded to paise.

Projected FY customer receipts = reviewed receipts in completed FY months + rounded monthly run-rate × remaining FY months.

Both methods expose the cutoff, month count, missing months, outstanding review and assumptions. They do not invent confidence percentages. Insufficient coverage produces Insufficient data for a reliable estimate. The displayed sales projection is a bank-receipt-based proxy, not actual accounting sales, GST aggregate turnover or a guaranteed outcome. Cash sales, other accounts, unpaid invoices, GST amounts and export/accrual adjustments remain important gaps.

## Provisional legal integration

The analytics module invokes the existing `evaluateBusiness`, `classify` and `rulesForState` functions using a temporary hypothetical profile. It does not introduce a new independent legal threshold list. GST's screening threshold is obtained from the engine's result; Udyam uses its existing effective-date/investment/turnover classification.

A GST proximity warning starts at 80% of the supported threshold. This is an advisory product setting, not a legal requirement. Crossing a threshold or changing the MSME screening band prompts provisional review, with rule version, official source, triggering projection and missing facts. No warning states that a bank forecast confirms registration liability. Warning IDs are stable by financial year/domain/rule version and are derived from current data rather than appended repeatedly, preventing duplicate notices.

Original workspace findings, declared turnover, actual business events, task records and completed work are preserved. The separate reviewed supply figure also stays separate until the owner explicitly changes actual business facts through the existing form.

## Storage and migration

PostgreSQL/Neon: one additive `FinancialLedger` table related to `BusinessWorkspace`, with business ID, revision, ciphertext and update time. It stores an encrypted aggregate ledger rather than new plaintext transaction/file tables. SQLite: the corresponding `financial_ledgers` table is created additively on first authorized financial access. Existing account/workspace tables and JSON payloads are not rewritten or reseeded.

The PostgreSQL migration is `prisma/migrations/202610260001_financial_ledger/migration.sql`. No existing column is removed or converted. Prisma Client must be regenerated during build, which the existing build script already does.

For the existing Neon deployment originally initialized using `prisma db push`, do not blindly run all historical migrations against already-created tables. Back up first. Apply only this new additive SQL once using the Neon SQL Editor, or properly baseline existing Prisma migration history before using migrate deploy. Do not reset the database. If this feature's table was already created through a reviewed schema push, do not reapply the same CREATE TABLE migration without reconciling migration history.

The developer implementation and tests do not apply this migration to the live Neon database or publish a Vercel deployment. Commit/push the changes and perform the migration/redeploy through the established release process. The existing cloud environment variables remain valid. Financial originals no longer need local upload disk; this does not change the older task-evidence upload feature, which still has its separate cloud-storage limitation.

## Encryption and privacy

Original files are encrypted before being added to the in-memory ledger. The entire ledger, including descriptions, references, categories and corrections, is then encrypted again for storage with AES-256-GCM. Each encryption has a random 96-bit IV, authenticated business/purpose context and an authentication tag. A different business or purpose cannot decrypt the payload.

Preferred production configuration: set a dedicated stable `FINANCIAL_DATA_KEY` containing exactly 32 random bytes encoded as base64 before the first import. If absent, a separate-purpose key is derived from the existing stable `NEXTAUTH_SECRET` using HKDF-SHA256. The auth secret must be at least 32 characters. A missing/changed key fails explicitly; it never resets encrypted records.

Generate a dedicated key privately with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. Store it only in private server configuration. Changing between fallback and dedicated keys, or rotating a key after imports exist, requires a controlled decrypt/re-encrypt migration; simply replacing the variable makes old data unreadable.

All upload, read, download, correction, confirmation and deletion operations require a signed-in user and server-side business authorization. Writes require same-origin checks and revision validation; uploads/reviews/deletions have rate limits. File bytes and descriptions are not logged, sent to analytics, written to public directories or passed to the AI API. Original downloads require ownership and use no-store/attachment headers. Parser errors are sanitized.

These are application protections, not a bank-grade certification or an external security audit. Account control, cloud access, key backups, database backups and operator practices still matter.

## AI explanation

The assistant has a read-only `read_financial_summary` tool. Authorized aggregates can be loaded for a financial question. The tool excludes bank transactions, descriptions, account labels, raw statement bytes and free-text reviewed-figure references/definitions. It returns exact mathematical results and their limitations. The model cannot change financial rows, confirmations, projections, declared turnover or rules. Financial calculations work with all AI keys absent.

## Future bank connection

`lib/financial/bank-provider.ts` defines an inactive adapter contract for consent initiation, status, expiry, scoped access, transaction retrieval, revocation and sanitized errors. No provider, credential flow, scraping or automated bank connection is enabled. The UI says Coming later.

The Government of India's Account Aggregator framework description states that sharing requires explicit consent and that an FIU is registered with and regulated by a financial sector regulator. A standalone compliance SaaS must not assume FIU eligibility or advertise itself as a licensed AA. A legitimate authorized provider/partner arrangement and eligibility/legal review are prerequisites.

Sources checked for architecture on 26 October 2026:
- Department of Financial Services AA framework: https://financialservices.gov.in/node/4278
- RBI notification on FIU/FIP participation, 26 October 2023: https://www.rbi.org.in/scripts/FS_Notification.aspx?Id=12557&Mode=0&fn=14
- RBI Account Aggregator directions should be checked for the applicable current version before enabling any integration.
- Parser documentation: https://github.com/unjs/unpdf

## Fictional jury demonstration

Sample: `public/samples/fictional-six-month-bank-statement.csv` (April to September 2026, 36 rows). Text PDF: `public/samples/supported-statement.pdf` (two small fictional rows illustrating only the supported layout).

Offline isolated browser demo:
1. Open `/demo` and select the Hackathon growth story for Phoenix Tech Solutions.
2. Show its declared INR 1,800,000 turnover.
3. Open Business Profile & Settings → Financial Records.
4. Select Load fictional jury statement. This loads the known fictional fixture in memory only; anonymous users cannot upload arbitrary statements.
5. Inspect loans, own-account transfer, owner investment and refund categories. Correct ambiguous A to Owner investment and ambiguous B to Owner withdrawal.
6. Confirm full statement-period coverage and the owner-review declaration, then Confirm reviewed summary.
7. Show monthly cash movement and operating cash surplus. Show the FY forecast and provisional GST review warning.
8. Switch between average and weighted methods. All six sample months have the same reviewed receipts, so both project the same figure; this is expected.
9. Show that declared turnover and saved business records did not change. Explain that these are deterministic calculations, not Gemini output.

Actual upload demo: create a separate authenticated fictional jury business named Phoenix Tech Solutions, with eight employees, Karnataka/services and declared turnover INR 1,800,000. Download the fictional CSV, choose account label Fictional operating, enter 1 April–30 September 2026, consent, and Extract transactions. Review/confirm as above. Use a separate account; never upload the sample into a real customer's workspace. Real import/download/deletion occurs only in that authorized fictional account. Anonymous demo state is not written to localStorage or the database.

Hand-calculated expected results:
- Each month reviewed receipts INR 350,000; salary/rent/operating payments INR 185,000; operating cash surplus INR 165,000.
- April raw credits INR 650,000 include INR 300,000 owner investment; cash movement INR 465,000.
- Six months raw credits INR 3,025,000; raw debits INR 1,125,000; net cash movement INR 1,900,000.
- Six months reviewed customer receipts INR 2,100,000; reviewed operating payments INR 1,110,000; operating cash surplus INR 990,000.
- Monthly sales proxy INR 350,000; projected FY customer receipts INR 4,200,000. Declared turnover remains INR 1,800,000.
- These figures do not claim accounting profit, GST aggregate turnover or an automatic registration obligation.

## Verification and limitations

Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npx tsx scripts/test-financial-http.mts` against the running app. Tests use independently specified sample arithmetic, two isolated authenticated owners, real multipart uploads, text PDF extraction, ownership failures, revisions, duplicate handling and actual deletion. They do not call an online model to produce the calculations.

`docs/financial-http-check.json` records actual endpoint results. The existing compliance/growth/optimizer tests remain in the full regression suite. Production packaging must include the PDF worker and unpdf assets, covered by Next.js output tracing configuration. Browser visual automation is not part of the recorded endpoint verification.

Limitations: no scanned-PDF OCR, no general PDF layout inference, no invoice/accrual accounting engine, no automatic bank integration, no cloud data migration from local SQLite, no proof that every relevant business account/supply is represented, no tax liability calculated from a forecast, no automatic live deployment and no independent bank-grade security certification.

## Executed verification — 26 October 2026

- Full automated regression suite: 164 passed, 0 failed, including financial-record tests and the existing compliance/growth/optimizer tests.
- Authenticated HTTP suite: all 20 checks passed against the local production server on port 3001. The same suite also passed against development. Results are saved in `docs/financial-http-check.json`.
- TypeScript checking, ESLint, production build and Prisma schema validation passed. Prisma validation used a process-only placeholder PostgreSQL URL and did not connect to or modify Neon.
- Production output tracing includes the PDF worker, unpdf parser and PDF.js assets: `docs/financial-packaging-check.json`.
- Exact expected totals were checked independently, including INR 0.10 + INR 0.20 = INR 0.30, six-month reviewed receipts of INR 2,100,000, and the INR 4,200,000 FY sales proxy.
- An injected Gemini tool-loop test verifies aggregate-only explanation inputs. This is a mocked provider test, not a live online AI request. Financial calculations were also tested with AI credentials absent.
- HTTP tests used two isolated fictional authenticated accounts. Imported financial fixture data was deleted at the end; the isolated test accounts remain. Tests verified that the profile, tasks and business-change history were unchanged.
- No automated browser visual inspection, live PostgreSQL migration/test, public Vercel deployment or live financial AI generation is claimed by this report.

### Mandatory scenario evidence

Every requested scenario below is covered by executed tests. “Unit” refers to `tests/financial-records.test.ts`; “HTTP” refers to `scripts/test-financial-http.mts`.

| # | Requested scenario | Executed evidence |
|---|---|---|
| 1 | Valid CSV | Unit reordered/quoted CSV parsing; HTTP multipart extraction |
| 2 | Supported PDF | Actual worker extraction in unit and production HTTP tests |
| 3 | Unsupported PDF | Empty/scanned-style and unsupported text layout rejection; HTTP rejection |
| 4 | Invalid file | MIME/signature, malformed rows, invalid dates/amounts; HTTP false PDF signature |
| 5 | Oversized file | Parser limit and HTTP body rejection |
| 6 | Duplicate statement | Unit duplicate-file detection and HTTP idempotency |
| 7 | Overlapping dates | Shared transaction reuse, repeated same-day multiplicity, ambiguous overlap rejection |
| 8 | Internal transfers | Explainable category suggestion; excluded from reviewed receipts |
| 9 | Loan deposits | Loan suggestion; manual totals distinguish deposits from sales |
| 10 | Owner investment | Suggestion and manually corrected ambiguous owner investment |
| 11 | Customer receipts | Category suggestion and independently expected monthly sales totals |
| 12 | Salary | Salary category and expected operating cash payments |
| 13 | Refunds/reversals | Category and July cash-payment versus operating-payment totals |
| 14 | Incorrect classification | Direction conflicts rejected; uncertain entries cannot confirm |
| 15 | Manual correction | Save without confirmation, confirm after review, later suggestions still unconfirmed |
| 16 | Monthly aggregation | April and July totals and six-month receipts/surplus |
| 17 | FY boundary | March 31/April 1 and exclusion of future months |
| 18 | Rupee/paise accuracy | Integer paise, quoted Indian grouping and exact rounded weighted forecast |
| 19 | Missing months | Missing periods and uncovered accounts withhold forecasts |
| 20 | Sparse forecast | Insufficient full months withhold projections |
| 21 | Verified versus estimated | Owner-reviewed supply, declared turnover and forecast remain separate |
| 22 | Advisory thresholds | Existing catalogue metadata, provisional GST warning and stable warning IDs |
| 23 | No definitive GST conclusion | Forecast warning leaves declared profile and definitive findings unchanged |
| 24 | Business isolation | Encrypted repository ownership checks and cross-owner HTTP read/delete denial |
| 25 | Download authorization | Production HTTP private original download and cross-owner denial |
| 26 | Deletion | Statement/shared-row handling, transaction invalidation and HTTP delete-all |
| 27 | Repeated import | Duplicate HTTP retry with stale revision remains idempotent |
| 28 | Compliance regression | Existing compliance regression suite passed in full npm test run |
| 29 | Growth regression | Existing growth/optimizer tests passed; HTTP business-history preservation |
| 30 | AI-off calculations | Exact analytics and read-only explanation tool work without Gemini credentials |

## Changed-file manifest

| Area | Files |
|---|---|
| Financial domain | `lib/financial/types.ts`, `money.ts`, `classification.ts`, `parser.ts`, `files.ts`, `pdf-worker.mjs`, `crypto.ts`, `repository.ts`, `ledger.ts`, `reviews.ts`, `analytics.ts`, `bank-provider.ts`, `demo.ts`, `fixtures.ts` |
| API | `app/api/financial-records/route.ts`; aggregate context wiring in `app/api/chat/route.ts` |
| UI | `components/financial-records.tsx`, `components/financial-summary.tsx`, `components/dashboard.tsx` |
| Assistant types/tools | `lib/domain.ts`, `lib/assistant-tools.ts` |
| Schema | `prisma/schema.prisma`, `prisma/migrations/202610260001_financial_ledger/migration.sql` |
| Dependencies/packaging | `package.json`, `package-lock.json`, `next.config.ts` |
| Configuration/documentation | `.env.example`, `README.md`, `docs/FINANCIAL-RECORDS.md` |
| Evidence | `docs/financial-http-check.json`, `docs/financial-packaging-check.json` |
| Fixtures and scripts | `public/samples/fictional-six-month-bank-statement.csv`, `public/samples/supported-statement.pdf`, `scripts/financial-samples.mts`, `scripts/test-financial-http.mts` |
| Regression coverage | `tests/financial-records.test.ts` |

The only new logical data table is the encrypted per-business financial ledger: `FinancialLedger` in PostgreSQL, `financial_ledgers` in SQLite. `BusinessWorkspace` gains a Prisma relation, not replacement business data. No existing accounts, business tables or profile fields are reset. `.env.local` and AI provider credentials were not edited for this enhancement.

## Confirmation visibility fix — 26 October 2026

Demo financial state now belongs to the dashboard session instead of the profile modal. Closing and reopening Financial Records preserves the fictional review in that page session, and Overview, Growth planner and Risks & alerts receive the same computed summary. Reloading the page still clears fictional financial records; they are not persisted to localStorage or the database.

Confirmation and correction feedback scrolls into view above the results. The review controls show how many categories remain unresolved and explain the review declaration and coverage requirements. Confirming receipts without complete coverage explicitly explains why a forecast is still withheld.

The two ambiguous sample rows must be categorized by the reviewer; confirmation never guesses them. After correcting A to Owner investment and B to Owner withdrawal and confirming complete coverage, the sample projects INR 4,200,000. Declared turnover remains unchanged.

Regression verification: 166 tests passed, including two new tests in `tests/financial-confirmation.test.ts` covering demo summary rendering before/after confirmation, unresolved-entry rejection and withholding a forecast without coverage. TypeScript and ESLint passed. These tests do not claim browser click automation.

## Latest input/import repair

See [FINANCIAL-IMPORT-REPAIR.md](FINANCIAL-IMPORT-REPAIR.md) for the 26 October repair: preserved form drafts/coverage, explicit manual financial year, common bank headers and detected mapping, 2,000-row review bodies, safe unchanged-overlap confirmation, generated financial evidence-review tasks, and the current 172-test/31-endpoint verification. The real-browser upload/refresh checklist remains blocked by the saved localhost browser permission. This newer report supersedes earlier test counts; it does not claim browser verification.

## Provisional annualized estimate for incomplete financial-year coverage

The normal FY forecast remains available under its existing complete-coverage rules. If that forecast is unavailable but at least **four complete, owner-confirmed, closed months in the current April–March FY** exist, a separate provisional annualized run-rate is now displayed. Missing/partial months are excluded, not treated as zero. Customer receipts are counted only from reviewed rows covered by confirmed statements; every represented account must have complete coverage for a month to qualify.

Formula: **sum of confirmed customer receipts in eligible complete months ÷ number of eligible months × 12**. Integer-paise arithmetic rounds the annual ratio once. The display also supplies months used, missing/incomplete elapsed months, calculation method and a data-quality warning about incomplete records, seasonality and unverified turnover definitions. If weighted forecasting was selected but lacks its required coverage, the interface explicitly identifies the fallback as a simple average rather than pretending it is weighted.

For the matching fictional fixture `test-data/financial/fictional-partial-months-2026.csv`, statement coverage is 3 April–28 September 2026. May/June/July each have INR 350,000 receipts and August INR 375,000. Eligible receipts total INR 1,425,000. Dividing by four and multiplying by twelve gives **INR 4,275,000 (₹42,75,000)**. April and September remain incomplete. This is a recreated fixture matching the requested figures, not an edit to the user's imported statement.

The calculation is read-only and derived from the existing encrypted ledger whenever loaded. It does not update confirmation flags, original files, categories, declared turnover, definitive legal findings or business history. No schema migration/reimport/reconfirmation is needed for existing eligible confirmed records. Estimates feed only the existing provisional screening warnings and evidence-review tasks. Bank receipts alone never establish a definitive registration obligation.

New tests in `tests/financial-annualization.test.ts` check the exact result, visible labels, excluded partial months/non-sales, minimum four-month coverage, unreviewed/unconfirmed rejection, explicit weighted fallback, current/future/FY boundaries, input immutability and exact annual rounding. The HTTP suite includes a separate matching fictional import/confirmation plus fresh-login repeated GETs checking the estimate and unchanged transaction/import/audit/revision data. Real browser refresh remains subject to the saved localhost browser permission and is not claimed by backend tests.

Annualization verification completed: **177 full-suite tests**, TypeScript, ESLint and the production build passed. **35 real authenticated endpoint checks** passed on the rebuilt local production server, including the exact INR 4,275,000 response after fresh login/repeated GET and identical confirmed rows/imports/audit/revision. Evidence is recorded in `docs/financial-http-check.json`. Existing user statements were not edited. Automated browser refresh remains unverified due to the saved origin permission restriction.
