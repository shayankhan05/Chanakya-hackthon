# ComplianceCopilot — refinement and verification report

25 October 2026 · Srujana Chanakya hackathon · LS-01, The Growth Trap

## Current result

The existing app is running at **http://127.0.0.1:3001**, using `npm run dev -- --port 3001`. Next.js serves the frontend and authenticated backend routes. Persistent SQLite remains in use; the PostgreSQL/Prisma adapter remains available. No database reset, schema migration, owner-record deletion or framework replacement was performed. Tests added synthetic accounts and records.

The production build passed, including Prisma Client generation and all 20 static pages. The final running server is development mode so testing can continue. The local authentication URL was corrected to port 3001.

This is not a claim of 100% production or legal correctness. Two requested checks remain blocked:

- **No `OPENAI_API_KEY`:** zero actual model responses were generated. Provider credentials, quota, model access, natural-language quality and Hindi conversation remain unverified. The user previously chose to continue without a key. Local responses are explicitly labeled.
- **Browser permission denied:** the browser gate refused the local application. No alternate browser or hidden driver was used. Desktop/mobile appearance, hydration and browser click flows have not been visually verified. Real HTTP and server-rendered checks are not a substitute for this.

## Baseline and architecture audit

Before edits, 77 unit tests and TypeScript passed. Inspected pages, components, API routes, authentication, repository/storage adapters, legal rules, deadline/consequence services, calculators, source index, uploads, provider integration and tests. Secret presence was checked without displaying secret values.

Retained Next.js 15.5.28, React 19, TypeScript, Tailwind, shared Radix/CVA controls, NextAuth credentials/JWT authentication, Prisma 6 and the official OpenAI SDK. Existing ownership checks, optimistic revisions, password hashing, recovery, persistence and private attachments remain in place.

`components/dashboard.tsx` coordinates the workspace UI. `lib/repository.ts` handles persistence/ownership; `lib/engine.ts` handles deterministic screening, saved growth and read-only simulations. Deadline/consequence calculations are shared by APIs, reports and chat. `app/api/chat/route.ts` authorizes requests and stores history; `lib/chat-provider.ts` runs the official Responses tool loop.

## Six primary sections

| Section | Result |
| --- | --- |
| Overview | Business facts, task/review counts, urgent verified-date banner, next verified future deadline, recent change and a clear action |
| Laws for My Business | Definition, personalized reason, next step, unknowns, simple applicability labels and expandable sources |
| What I Need to Do | Action list, calendar, registrations/licenses, documents and separate completion flow |
| Important Warnings | Issues sorted by urgency; task-linked notices are not repeated below the same issues |
| Plan My Growth | Compact employee-total, turnover, branch and export form; detailed options remain expandable |
| Ask AI | Embedded conversation, actual response-mode label, history, loading/retry/copy, optional full guidance and source details |

Calendar and certificates are secondary task tabs. Calculators are beside Ask AI. Business profile/settings, saved history, reports and account controls are in the top-right menu. CSV tools remain in the footer. Deadline demonstration has its own `/demo/deadlines` route and sample-only link. Old hashes for deadlines, registrations, events, calculator and deadline demo still resolve. No working API route was deleted.

The complete feature/button guide is [PRODUCT-GUIDE.md](PRODUCT-GUIDE.md).

## Exact problems found and repaired

1. **Live AI availability:** absent server credentials are the external blocker. Changing an error message cannot connect a model. Local mode remains honest and bounded.
2. **Model bypass:** recognized calculations could skip online reasoning, and a calculator tool could return before the model explained its result. Configured authenticated requests now enter the model, and results continue through the tool loop.
3. **Target versus addition:** “employees increase from 10 to 50” and “grow to 100” now resolve as target totals. Adding 20 remains an addition. Impossible reductions ask for clarification.
4. **Conversation recall:** recalling a discussion about hiring 50 was being mistaken for a fresh hiring request. Recall now resolves the earlier scenario.
5. **Deadline relevance:** abbreviated answers could show an unverified preparation task before an actual overdue obligation. Guidance now filters real overdue issues and selects an upcoming verified date, or explicitly says none is recorded.
6. **Fallback relevance:** GST declaration, branch count, missing profile facts, ambiguous business size, unknown laws, unspecified registration and missing payroll-cost inputs receive bounded factual answers/clarifications instead of unrelated source hits.
7. **Long guidance:** shorter local answers retain complete explanations under More details. The live prompt targets 40–80 words with at most one follow-up. Complex local replies can exceed the target to preserve material qualifications; actual word counts are recorded in the evaluation output.
8. **Source jurisdiction:** Karnataka Professional Tax and workplace findings could show Maharashtra references. State-specific source selection now uses Karnataka sources, keeps uncertainty visible and leaves unsupported state sources blank. Access-time monitoring refreshes generated source metadata without deleting records or replacing trusted deadline reviews.
9. **UI complexity:** crowded navigation, table-based task lists, repeated notices, full-profile growth forms and exposed internal task fields were simplified while preserving their services.

## Online advisor integration

The official OpenAI Responses SDK remains server-side. Tools can read the authorized profile, findings, computed task deadlines/consequences, certificates, history and warnings; retrieve source excerpts; simulate growth; review a proposed state move; calculate supported taxes/contributions; and estimate additional gross wages from explicit employee count and average pay.

Gross wage arithmetic uses exact paise and excludes unconfirmed statutory contributions, benefits and recruitment costs. Tools cannot execute arbitrary SQL or write business records. Live search, when enabled, is restricted to official domains. Logs record request identifiers, mode, status/category and duration without logging keys, prompts or private payroll notes.

Privately configure `OPENAI_API_KEY` in `.env.local`, confirm provider billing/model access, and restart to test live AI. Do not paste a key into chat or use a `NEXT_PUBLIC_` variable. The configured model defaults to `gpt-4.1-mini`; its actual account access has not been verified. `OPENAI_WEB_SEARCH=true` enables the optional official-site search tool. Public demo mode always remains local; use an authenticated account for online testing.

The evaluator refuses metered requests unless `RUN_LIVE_EVAL=true` is explicitly set when a key is configured. That was not done here.

## Sources and legal limits

Checked official sources for the state correction:

- [Karnataka Commercial Taxes Department FAQ](https://ptax.karnataka.gov.in/FAQ): PT scope and employer responsibilities; current schedule/exemptions still need checking.
- [Karnataka employer portal](https://ptax.karnataka.gov.in/ptemployer): period-specific notice illustrates why a permanent blanket monthly rate would be unsafe. No new PT rate was hardcoded.
- [India Code: Karnataka Shops and Commercial Establishments Act](https://www.indiacode.nic.in/bitstream/123456789/7609/1/8_of_1962_%28e%29.pdf): section 4 registration framework. Amendments, exemptions and actual case dates remain necessary before asserting a due date.
- [OpenAI function calling documentation](https://developers.openai.com/api/docs/guides/function-calling): Responses function-call/output orchestration.

The existing national catalogue and calculation sources remain. This is not a complete review of every Indian amendment. Branches require their own state review. EPF/ESI bases, eligibility, applicable notifications and current ceilings must be confirmed; no old ceiling was silently selected.

Only the existing reviewed conditional **central nil-tax GSTR-3B** late-fee formula is supported. It is not a total GST penalty engine. Other return types, state charges, interest, discretionary penalties and imposed government amounts are not invented. Monitoring runs on workspace access/update. The protected scheduled endpoint needs an independently configured scheduler; no continuous monitoring or email service is claimed.

## Actual verification results

| Check | Result |
| --- | --- |
| Baseline unit tests | 77 passed |
| Final unit tests | 86 passed |
| ESLint and TypeScript, including `.mts` scripts | Passed |
| Production build | Passed |
| Production dependency audit | npm reported 0 vulnerabilities at test time |
| Core authenticated HTTP suite | 16 groups passed |
| Authenticated assistant suite | 32 questions passed, plus isolation, idempotency and conversation reset checks |
| Tax suite | GST/credits, supported income tax, EPF/ESI, authorization/source checks and 12 chat questions passed |
| Deadline suite | 12 groups passed: automatic warning, late proof, private downloads, review stages and related invariants |
| New owner/growth journey | 9 groups passed: signup, six rendered nav buttons, saved 8→24, read-only 50 scenario, exact EPF why-question and logout/login persistence |
| Requested evaluation dataset | 50 executed: **49 local checks passed, 0 failed, 1 blocked** for Hindi translation |
| Real model evaluations | **0**, missing key |
| Visual desktop/mobile checks | Blocked by browser permission; not claimed as passed |

The fixture defines profiles, questions, expected facts, required tools, legal checks, response traits, prohibited mistakes and follow-up needs. Production code does not load it. [Actual outputs and word counts](advisor-evaluation-results.json) are saved separately.

Evaluation checks cover HTTP status, defined response facts/clarifications, saved-data immutability and honest local/live labeling. They are not a comprehensive human legal assessment or proof of actual model tool selection. Expected tools are a rubric. Injected-transport tests verify orchestration without pretending to be real model evaluations.

The larger run exposed the recall and deadline-ordering bugs above; both were fixed and rerun. Harness issues were also repaired: one-workspace-per-account isolation, a logout-variable typo and an old port-3000 test default. `.mts` files now participate in TypeScript checking.

Informational build warnings remain: Prisma package-level configuration is deprecated for a future major, and the dedicated Next ESLint plugin is not installed. Explicit ESLint checks and Next type/build checks passed.

## Reproduce and run

From the project directory in PowerShell:

```powershell
npm run lint
npm run typecheck
npm test
npm audit --omit=dev
node scripts/test-http.mjs
npx tsx scripts/test-assistant-e2e.mts
npx tsx scripts/test-tax-e2e.mts
npx tsx scripts/test-deadline-e2e.mts
npx tsx scripts/test-product-journey.mts
npm run evaluate:advisor
npm run build
npm run dev -- --port 3001
```

Stop the relevant server before building or binding its port. Do not build concurrently with development against the same `.next`. HTTP tests add synthetic records; use a separate test installation outside this hackathon workspace. Do not reset or seed the existing database merely to restart.

## Changed files

UI: `components/dashboard.tsx`, `chat-panel.tsx`, `growth-simulator.tsx`, `profile-form.tsx`, `task-editor.tsx`, `deadline-summary.tsx`; `app/globals.css`; `app/demo/page.tsx`; new `app/demo/deadlines/page.tsx`.

Services: `app/api/chat/route.ts`; `lib/assistant.ts`, `chat-provider.ts`, `chat-scenarios.ts`, `assistant-context.ts`, `legal-catalogue.ts`, `engine.ts`, `deadline-guidance.ts`, `domain.ts`, `workspace.ts`. Optional chat details are backward-compatible JSON data; no database schema change was necessary.

Quality: new `tests/product-refinement.test.ts`, `tests/fixtures/advisor-evaluation.json`, `scripts/evaluate-advisor.mts`, `scripts/test-product-journey.mts`; updated assertions/default origin in `scripts/test-assistant-e2e.mts`, `test-deadline-e2e.mts`, `test-http.mjs`; `eslint.config.mjs`, `package.json`, `package-lock.json`, `tsconfig.json`.

Documentation: `README.md`, `docs/PRODUCT-GUIDE.md`, this report and `docs/advisor-evaluation-results.json`. Local configuration: only `NEXTAUTH_URL` was corrected to port 3001 in the private `.env.local`; secrets were not printed or added to source control.

## Recommended judge story

1. Open `/demo`; select/reset **only the Phoenix sample** if previous browser-local demo edits exist. Confirm Bengaluru, 8 employees and ₹18 lakh turnover.
2. Show Laws for My Business: explain conditional results, missing facts and an expandable official source.
3. Use the account menu → Business Profile & Settings. Change actual employees 8→24, retain a single workplace at 24 and save the final step. Show EPF/POSH changes and saved history. Hiring alone does not alter the GST trigger.
4. Review a task. Show the next action and the separate progress versus Submit completion controls.
5. In Plan My Growth, enter **total 50**, compare and show the readiness plan. Return to saved facts: employees remain 24.
6. Ask POSH, EPF, why EPF applies, hiring versus GST, and a follow-up. Point out the actual local-mode label until a valid key has been configured.
7. Open `/demo/deadlines`. Use its fictional dates to show overdue detection and conditional fees; then show on-time action with later proof upload. These are sample records, not a real filing or government due date.
8. With a synthetic authenticated account, sign out/in and confirm persistence. A fresh real account starts empty; uploads remain private.

Before public production use, connect and evaluate a real model, complete permitted desktop/mobile browser QA, obtain jurisdiction-specific legal review and configure appropriate deployment secrets, backups and any actual scheduler/email services.
