# OpenAI restoration status — 25 October 2026

## Final verified state

The approval-review interruption below was resolved after the user authorized a retry. The verified project server was restarted successfully on port 3001 and loaded `.env.local`.

- Active provider: **OpenAI**, selected explicitly with `AI_PROVIDER=openai`.
- API key: **detected** by the running server; no credential was exposed or copied to another file.
- Independent scheduler and authentication secrets: configured and checked distinct from the AI keys and each other.
- Gemini: optional only, through explicit `AI_PROVIDER=gemini`.
- Real server-side provider probe: **failed, upstream HTTP 429, `credit_balance_exhausted`**.
- All four requested authenticated questions: executed; each returned the same upstream billing error with `fallbackUsed: false`. No local answers were substituted, even though the test deliberately passed `requireLive: false` to verify that authenticated fallback cannot bypass the rule.
- Existing business/account data: preserved. The end-to-end test used an isolated saved Phoenix profile, not an impersonated owner account.
- Business-profile context: verified in injected-transport/unit checks. No successful live personalized answer can be claimed while provider billing rejects requests.
- Tests: 99 unit tests passed; TypeScript and ESLint passed, including the final repeat after review availability was restored.

Sanitized actual request results are saved in [live-only-check.json](live-only-check.json). **LIVE AI NOT WORKING** remains the accurate generation status: the application reaches OpenAI, but its account has no available API credits. Available credits/billing must be restored in the account owning the configured key before a live response can succeed. No payment or billing change was made by this agent.

## Applied configuration and code changes

- The active provider is explicitly `AI_PROVIDER=openai` in the private project-root `.env.local`. The existing `OPENAI_API_KEY` is detected. Its value was not printed, committed or copied into another file.
- `lib/ai-provider.ts` selects OpenAI by default and Gemini only when explicitly configured. Each provider uses its own key, model, conversation adapter and sanitized diagnostics.
- The chat route and authenticated provider-check route now use this selection instead of requiring Gemini.
- Authenticated chat requires a live response even if the caller omits or disables `requireLive`. Provider errors return an understandable error; local answers cannot satisfy authenticated live requests. Public demo guidance remains separately labeled.
- The real tool-enabled OpenAI request exposed a rejected calculator schema: nested `oneOf` was not permitted. `lib/openai-schema.ts` converts the discriminated union to supported nested `anyOf` without changing the shared schema or removing server-side validation. A subsequent real request no longer returned that schema error.
- `DEADLINE_JOB_SECRET` was replaced with an independently generated cryptographic secret, distinct from both AI credentials and the authentication secret.
- The placeholder `NEXTAUTH_SECRET` was replaced with another independently generated cryptographic secret. Existing account/password and business records were preserved. Old login sessions require a fresh sign-in after this intentional secret rotation.
- `NEXTAUTH_URL` remains `http://127.0.0.1:3001`. Database configuration was checked unchanged. `.env.local` remains Git-ignored.

## Real provider result

**No live model answer succeeded.** After fixing the tool schema, the actual OpenAI request returned:

```text
HTTP 429
code: credit_balance_exhausted
```

The provider reported that its API credit balance has no credits remaining. This is an external billing blocker, not a missing Gemini key or a temporary rate-limit retry problem. The existing quota/billing diagnostic identifies it accordingly. Account model access and successful answer generation cannot be certified until the billing blocker is resolved and a real request succeeds.

## Verification completed

- 99 unit tests passed, including provider selection, schema compatibility, profile privacy and read-only simulation checks.
- TypeScript and ESLint passed after the provider-selection and schema changes. The final attempted repeat was not executed because approval review failed.
- The SDK input uses the authorized saved business profile and existing typed tools. The profile-passing behavior is verified by injected-transport tests; these are not live-model or final authenticated end-to-end results.
- The requested four-question authenticated test script was prepared. Its final run was not completed because server restart was blocked.

## Earlier restart interruption — resolved

The verified previous Next.js processes on port 3001 were stopped for the requested restart. Starting the corrected process then failed because **automatic approval review hit a Codex usage limit**. The action was not executed. The review explicitly described this as a review failure, not a finding that the action was unsafe, and instructed against bypassing approval.

At that point the server was stopped; no alternate execution path was used to bypass the gate. Following the user's confirmation that review was available again, the restart command below succeeded:

```powershell
npm run dev -- --port 3001
```

The authenticated verification command `npm run test:ai` was then executed. It correctly exited unsuccessfully because each provider call returned the billing error documented above. These tests must receive genuine live-mode answers before success is reported. They create isolated synthetic saved records and preserve existing owners' data.

## Files changed in this restoration

- `.env.local` — provider selection and independently generated secrets; private, ignored by Git.
- `.env.example` — explicit OpenAI default with optional Gemini configuration.
- `lib/ai-provider.ts` — provider selection, dispatch, provider probe and diagnostics.
- `lib/openai-schema.ts` — supported OpenAI tool-schema transformation.
- `lib/chat-provider.ts` — applies the compatible schema to OpenAI tools.
- `app/api/chat/route.ts` — selected provider and mandatory live authenticated responses.
- `app/api/chat/provider-check/route.ts` — checks the selected provider.
- `scripts/verify-ai.mts` — selected-provider probe.
- `scripts/diagnose-ai-schema.mts` — synthetic-profile tool-schema diagnostic with credential redaction.
- `scripts/test-live-only.mts` — the four requested questions and sanitized failure fields.
- `tests/ai-selection.test.ts` — provider-selection and schema regression tests.
- `package.json` — `verify:ai` uses the selected provider.
- `README.md` and this report — current configuration and actual limitations.

The application was not redesigned and no database schema migration or data reset was performed.
