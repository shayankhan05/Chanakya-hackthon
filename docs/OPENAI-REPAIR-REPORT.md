# OpenAI integration repair — 25 October 2026

## Latest strict server-side check

The subsequent urgent connection test restarted the verified project server on port 3001 and called the authenticated `POST /api/chat/provider-check` endpoint. **The running Next.js server itself sent the real OpenAI request. OpenAI returned HTTP 401.** The sanitized category was `missing_api_key`; no credential or business data was sent in that diagnostic prompt.

`requireLive: true` is now supported by the chat request contract. Missing credentials/provider failures return explicit errors without local fallback, and cached local responses cannot satisfy live-only tests. Normal application behavior is unchanged unless this flag is requested.

Using an isolated authenticated Phoenix Tech Solutions fixture with eight saved employees, both “What is my business name?” and the 8-to-50 growth question returned HTTP 503 with `errorCategory: missing_api_key` and `fallbackUsed: false`. **Neither live AI answer passed.** [Raw sanitized results](live-only-check.json) are saved. The live-only test exits with a failure status until genuine provider and model responses succeed.

The exact local key entry is `OPENAI_API_KEY` at `.env.local`, line 12. It is empty; process/user/machine key checks and the running server status all confirm absence. The existing database/authentication settings and Git exclusion remain intact. A valid replacement key must be supplied locally before billing, quota, model access or personalized live generation can be verified.

Additional files: `app/api/chat/provider-check/route.ts`, `lib/chat-contract.ts`, `app/api/chat/route.ts`, `scripts/test-live-only.mts`, `tests/openai-repair.test.ts`, and `docs/live-only-check.json`. Lint and TypeScript passed; all 91 unit tests passed. These checks do not change the result: **LIVE AI NOT WORKING — missing API credentials.**

## Actual status

**The chatbot is not yet genuinely connected to OpenAI.** No API key is available in `.env.local`, the other checked project environment files, or the process/user/machine environment. A real POST to `https://api.openai.com/v1/responses` reached OpenAI and returned **HTTP 401** without credentials. No key was invented or exposed. Billing, quota and account model access cannot be determined without a valid key.

The application is running at http://127.0.0.1:3001 after restarting only its verified Next.js processes. The frontend and backend routes are served by that process.

## Configuration work completed

- `.env.local` already existed. Missing settings were filled from `.env.example`; current database path, storage driver and authentication secret were preserved and checked programmatically.
- `NEXTAUTH_URL` is `http://127.0.0.1:3001`.
- `OPENAI_API_KEY` is present as an empty configuration entry, ready for a valid credential; no placeholder credential was invented.
- `git check-ignore .env.local` confirms the file is excluded. It was not tracked by Git.
- The installed official SDK is `openai` 6.49.0. The existing model remains configurable through `OPENAI_MODEL`, defaulting to `gpt-4.1-mini`. Actual account access remains unverified.

A valid replacement key must be supplied locally through a secure channel. Configuration files are already prepared; there is no need to recreate them. A ChatGPT/Codex login is not used as an API credential. Do not paste a key into chat.

## Code repairs

1. Live authenticated requests now call OpenAI **before** constructing a local fallback. Previously the local source/answer engine ran first, so a local retrieval error could prevent a genuine provider request even when credentials were configured.
2. Model input now includes a sanitized snapshot of the authorized saved profile, including `startDate`. Private payroll notes remain excluded. The instruction asks for a direct saved-field answer to name, employee-count and start-date questions and forbids inventing a missing start date.
3. The local fallback now answers business start-date questions from the actual saved field, including after a legal discussion. Missing dates stay unknown rather than producing unrelated legal material.
4. Server configuration trims key/model whitespace. A whitespace-only key is not reported as live configuration.
5. Missing-key and failed-provider messages are distinct. Provider authentication/quota/model/network error categories remain sanitized; secrets are never returned or logged.

The official Responses tool-call/output flow was checked against [OpenAI function-calling documentation](https://developers.openai.com/api/docs/guides/function-calling). This inspection is not a claim that OpenAI accepted the complete tool schema without an authenticated request.

## Executed tests

All four requested questions were sent through the real authenticated `/api/chat` route using a **synthetic business saved through the application's onboarding API**, not an impersonated existing owner account. Client-supplied conflicting history did not replace server facts.

| Question | Verified answer behavior |
| --- | --- |
| What is my company name? | Returned the fixture's saved company name |
| How many employees do I have? | Returned its saved 10 employees |
| When did I start my business? | Returned its saved 1 April 2024 start date |
| What happens if my employees increase to 50? | Compared 10→50, meaning 40 additional people; used screening results and left saved records unchanged |

All four responses were explicitly `knowledge-base` mode. **Zero live model responses passed.** Actual response text and word counts are saved in [openai-integration-check.json](openai-integration-check.json). These tests validate saved-record flow and bounded local behavior, not real-model inference quality.

ESLint and TypeScript passed. All **90 unit tests passed**, including four new start-date/profile/configuration regression checks. Injected-transport tests verify model input/orchestration and are not counted as actual OpenAI requests.

## Files changed in this repair

- `.env.local`: merged missing configuration and retained correct origin; existing database/authentication settings preserved.
- `lib/openai-config.ts`: new server configuration helper.
- `app/api/chat/route.ts`: live-first flow and precise missing-key status.
- `lib/chat-provider.ts`: sanitized current-profile context and focused saved-field instruction.
- `lib/assistant.ts`: saved start-date answer and missing-date handling.
- `scripts/verify-openai.mts`: safe real-provider probe; exits unsuccessfully until an authenticated model response succeeds.
- `scripts/test-openai-integration.mts`: four authenticated saved-record checks; when a key is configured it requires actual live-mode responses.
- `tests/openai-repair.test.ts`: regression tests.
- `docs/openai-integration-check.json` and this report: actual results and limitations.

## Reverification

```powershell
npx tsx scripts/verify-openai.mts
npx tsx scripts/test-openai-integration.mts
npm run lint
npm run typecheck
npm test
```

The probe sends only a generic test prompt, not business data. With a valid key it uses the official SDK and configured model. Without a key it performs an unauthenticated endpoint probe and explicitly reports failure. The authenticated application check creates synthetic records. Once a valid key is securely supplied locally, restart the server and rerun these commands before claiming a live connection.
