# Financial import repair and verification report

Date: 26 October 2026. Scope: existing financial import, review, manual figures, calculations, forecasts and provisional compliance integration. No sidebar redesign, provider switch, business reset or live deployment.

## Verification status

The local production application has been rebuilt and restarted on port 3001. Real authenticated financial API uploads, review/confirmation, downloads, deletion and fresh-login persistence passed. Component interaction tests exercised the form controls and handlers. **The mandatory real-browser workflow has not been completed. Do not describe this as fully browser-verified.**

The browser tool refused access to `http://127.0.0.1:3001` with: “A saved user permission setting blocks this action.” The origin approval gate did not grant access. No alternate browser, raw CDP, browser commands or other workaround was used. Browser console inspection is also blocked. Enable access to this origin in the app's browser permissions before repeating the browser checklist below. An asynchronous request for this access was sent during implementation.

## What was broken and why

| Problem | Root cause | Repair |
|---|---|---|
| Categories reset when switching forecast method | Method changes triggered another GET, replacing the view and resetting review form state | Calculate both methods from the same already-loaded authorized records; method changes no longer fetch/reset category edits |
| Coverage disappeared after Save corrections | Every refreshed view cleared coverage and the owner declaration | Reset these controls on statement selection/upload/deletion, not on every save or method change |
| A successful save could appear to fail | UI performed an unnecessary second GET after every successful write; that GET could fail after the write succeeded | Use the authoritative mutation response directly and notify dashboard summaries after success |
| Separate reviewed figures used an unexpected year | The form silently used the business profile's financial year | Add an editable financial-year field, validate consecutive years and restore saved amount/year/definition/reference on reopening |
| Saving a separate figure discarded category work | Replacing the response reset all category choices | Preserve unsaved choices for matching transaction IDs; switching statements explicitly asks before discarding edits |
| Large CSVs uploaded but could not be confirmed | The importer accepted 2,000 rows, but their review JSON exceeded the generic 200 KB limit | Financial-specific streamed JSON reader permits up to 400 KB, still bounds requests and returns 413 for oversized bodies |
| An unchanged partial overlap could remove a valid forecast | Confirmation invalidated all related statements even when their classifications had not changed | Invalidate shared confirmations only when category/review status actually changes; a genuine correction still invalidates affected statements |
| Common bank exports were rejected | Limited header aliases/date formats and reliance on a nonempty browser MIME | Add known Indian export headers and unambiguous date formats; unknown MIME is accepted only after extension/signature/content validation |
| Invalid account labels showed a generic error | Account was validated as a standalone string, leaving no field path for the error mapper | Validate a named account field and show a field-specific explanation |
| Forecast warnings had no associated action in Tasks | Only a warning snapshot existed | Generate stable, derived evidence-review tasks from the same confirmed-data screening warnings and show them in Tasks & deadlines |
| Anonymous demo appeared to be persistent storage | It intentionally uses an in-memory fictional fixture, unlike authenticated imports | Explain the page-session limitation and link to sign-in for genuine saved uploads; private anonymous bank uploads remain disabled |

The earlier confirmation visibility fix remains: results/errors scroll into view, and fictional demo financial state survives closing the profile modal within the same page session. Refreshing anonymous `/demo` clears that fictional state by design. Real signed-in records persist in encrypted storage.

## Inputs and formats

Text, account label, statement dates, file selection, consent, category selectors, forecast selector, review declarations and manual figure controls are functional in the component interaction tests. Account labels allow 2–40 letters, numbers, spaces or hyphens. Invalid values receive errors. All category choices are validated against cash direction by the server.

Supported CSV layouts:

- Date/description plus separate debit and credit columns.
- Date/description plus amount and an explicit CR/DR or Credit/Debit direction.
- Known aliases such as Txn Date, Value Date, Posting Date, Narration, Particulars, Remarks, Withdrawal Amt., Deposit Amt., Credit Amount, Debit Amount, Chq./Ref.No., Ref No./Cheque No., and currency-qualified amount/balance columns.
- Where one transaction/posting date and Value Date both exist, the former is selected. Multiple ambiguous primary date columns are rejected.
- YYYY-MM-DD, day/month/four-digit-year with one or two digit day/month, and DD-MMM-YYYY such as 01-Apr-2026. No guessing of two-digit years or US month-first dates.
- Canonical values, valid Indian grouping, rupee prefixes, zero figures and at most two decimal places. `.50` is normalized to `0.50`. A transaction must still have exactly one nonzero money direction; a zero-only row is not a payment.

The selected header mapping is stored with the encrypted import and shown in its review interface. Unsupported layouts are rejected with a template explanation. Existing file/page/row/worker/storage limits remain enforced. CSV is limited to 500 KB and 2,000 transactions.

PDF support remains deliberately limited to the supplied text-based pipe-separated table layout: no OCR, encrypted/scanned PDFs or arbitrary bank layout inference. Real PDF worker extraction and unsupported-format rejection passed the endpoint suite.

## Calculations and compliance

Money is calculated using integer paise. Reviewed receipts are confirmed customer sales receipts, excluding loans, own transfers, owner money and refunds. Reviewed operating payments include business expense, salary and rent. Net cash movement is all extracted money in minus all extracted money out. Operating cash surplus is reviewed receipts minus reviewed operating payments; it is not accounting profit.

The April–March forecast uses complete owner-confirmed months, a minimum of three months for average or six for recent weighted forecasting, and no missing elapsed FY months. Weighted monthly rate uses the last three complete months with weights 1:2:3. The projected total is completed-month receipts plus rounded monthly rate times remaining months. Missing coverage withholds a forecast rather than inventing it.

For the six-month sample as of October 2026:

| Figure | Expected result |
|---|---:|
| Monthly customer receipts | INR 350,000.00 |
| Monthly operating payments | INR 185,000.00 |
| Monthly operating surplus | INR 165,000.00 |
| Six-month reviewed receipts | INR 2,100,000.00 |
| Six-month operating surplus | INR 990,000.00 |
| All bank credits, including non-sales | INR 3,025,000.00 |
| All bank debits | INR 1,125,000.00 |
| Net bank cash movement | INR 1,900,000.00 |
| Average/weighted annual sales proxy | INR 4,200,000.00 |
| Original declared turnover | INR 1,800,000.00, unchanged |

Confirmed records feed the existing effective-date/state rule engine through a hypothetical financial screening profile. A relevant GST/MSME screening change produces a provisional warning, supporting source, missing facts and a stable review task. These tasks are derived from persisted reviewed records, reappear after fresh login and disappear when the supporting forecast/warning is no longer valid. They are displayed separately from definitive filing tasks; they do not change the legal health score or silently create registration obligations. Their Review financial evidence button opens Financial Records.

Owner-declared turnover, separately owner-reviewed supply figures and forecasts remain distinct. Accounting profit remains unavailable without invoice/accrual support. No Gemini call is needed for calculations; the AI only receives authorized aggregates to explain.

## Tests actually executed

- `npm test`: **172 passed, 0 failed**, including existing legal, deadline, growth and optimizer regressions.
- Component interaction tests: changing category and forecast method, saving corrections without losing coverage, confirming, saving zero/manual year, preserving category drafts during figure save, remount loading, date/text edits, file selection, consent-gated upload, multipart payload values and retaining inputs on upload errors. These use React's component renderer and mocked network responses; they are not browser tests.
- `npx tsx scripts/test-financial-http.mts`: **31 passed** against the rebuilt local production server. Real multipart CSV/PDF, persisted encrypted records, actual review writes, fresh session login/reload, dashboard summary, financial warnings/tasks, validation errors, duplicates/overlaps, private downloads/deletion, ownership and 2,000-row confirmation were exercised. Evidence: `docs/financial-http-check.json`.
- `npm run typecheck`, `npm run lint`, `npm run build`: passed.
- AI-off deterministic calculation tests: passed. No live Gemini response is claimed.
- Server terminal output was checked after endpoint execution; no application error output appeared for the tested requests. Browser console inspection was blocked.
- One expanded endpoint run initially failed on the account-label error-message assertion. The cause was corrected and the entire expanded suite passed on rerun. During new unit test development, header normalization and a test-fixture replacement issue were also corrected before the successful full regression run.

The HTTP test used three isolated fictional accounts and removed their financial fixtures at the end. Existing business profile, tasks and change history were compared before/after and remained unchanged. Test accounts remain isolated; no real customer financial data was used.

## Real-browser checklist — pending permission

None of the following are claimed as passed by browser automation:

1. Sign into a separate fictional test account; select/create Phoenix Tech Solutions with eight employees, Karnataka services, declared turnover INR 1,800,000.
2. Open the account menu → Business Profile & Settings → Financial Records.
3. Choose `test-data/financial/fictional-six-month-bank-statement.csv` (or download its identical copy from the interface).
4. Set account label Fictional operating, dates 2026-04-01 to 2026-09-30; consent and select Extract transactions.
5. Verify 36 rows, dates, money directions and detected header mapping.
6. Change ambiguous A to Owner investment and B to Owner withdrawal.
7. Switch forecast methods before saving and verify the category edits remain.
8. Tick complete-period coverage and the review declaration. Save corrections; verify the checkboxes retain their values. Confirm reviewed summary.
9. Verify the monthly values above and the INR 4,200,000 sales proxy on the October 2026 clock. Coverage/missing months must be considered on later live dates.
10. Close the modal; verify Overview, Risks & alerts and Tasks & deadlines show consistent figures, provisional warning and evidence-review task. Follow its review action back to Financial Records.
11. Refresh, then sign out/in; verify confirmed records/history and the original declared turnover remain.
12. Reimport the same CSV and verify it adds no duplicate rows.
13. Try invalid figure/financial-year/account values and unsupported PDF/CSV files; check readable errors and retained input values.
14. Inspect browser console and server terminal. This step still needs browser permission.

## Files changed for this repair

- UI: `components/financial-records.tsx`, `components/financial-summary.tsx`, `components/dashboard.tsx`.
- Backend: `app/api/financial-records/route.ts`.
- Financial domain: `lib/financial/types.ts`, `analytics.ts`, `parser.ts`, `money.ts`, `files.ts`, `ledger.ts`, `reviews.ts`.
- Fixtures/scripts: `scripts/financial-samples.mts`, `scripts/test-financial-http.mts`, `test-data/financial/fictional-six-month-bank-statement.csv`, `test-data/financial/README.md`. Public samples were regenerated from the same fictional fixture.
- Tests: `tests/financial-records.test.ts`, `tests/financial-confirmation.test.ts`, `tests/financial-inputs.test.ts`.
- Test dependencies: `package.json`, `package-lock.json` add React's component test renderer and its types as development dependencies.
- Documentation/evidence: this report, `docs/FINANCIAL-RECORDS.md`, `docs/financial-http-check.json`.

No new database table/column migration is needed for this repair; additional optional header mapping is inside the existing encrypted ledger JSON. The initial feature's additive FinancialLedger migration is still required on any PostgreSQL deployment where it has not yet been applied. No live Neon data, `.env.local`, AI credentials or Vercel deployment was changed.

## Follow-up: permission guidance and oversized-response repair

Official OpenAI documentation confirms the desktop permission path is **Settings → Browser → Agent permissions**, where per-website exceptions can be removed to restore defaults. Browser is not available inside the Codex IDE extension. The project may remain open in VS Code; the blocked origin permission belongs to the desktop app hosting the built-in browser. Review the exact origin `http://127.0.0.1:3001`, remove its saved blocking exception, then approve the local site when prompted. Organization policies can restrict this control. No project code, VS Code workspace setting, credential, or broad permission change is needed.

Sources checked:
- https://learn.chatgpt.com/docs/browser?surface=app
- https://developers.openai.com/training/walkthroughs/using-your-computer-and-browser

The current Browser documentation also states that built-in browser file uploads cannot be automated. Even after origin access is enabled, selecting a file may require direct user interaction; backend multipart uploads remain independently testable. Real browser clicks, layout and console checks are still unverified.

A follow-up API rerun encountered an empty response body when an oversized multipart request was rejected. The client previously assumed every error response contained JSON, causing an unhelpful JSON parse error. `lib/financial/http.ts` now handles empty/non-JSON error responses with a status-specific explanation, and validates file extension/empty files/500 KB CSV/2 MB PDF size before upload. Server content validation remains authoritative. `components/financial-records.tsx` uses that response handler for load/upload/save. The HTTP test harness now correctly recognizes a bodyless 413 and strictly requires status 413 for the oversized-file test.

Latest executed verification after this follow-up: **45 focused financial tests passed**, including response/selection edge cases and component interactions; **31 real production-server API checks passed** on rerun; TypeScript and ESLint passed. The broader 172-test full-suite result above predates the additional response test. No real browser verification is claimed. Additional changed files: `lib/financial/http.ts`, `components/financial-records.tsx`, `tests/financial-inputs.test.ts`, `scripts/test-financial-http.mts`, this report and the updated endpoint evidence JSON.
