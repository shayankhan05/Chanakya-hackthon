# Gemini setup and migration

ComplianceCopilot now uses Google Gemini as the active provider through the server-side `@google/genai` SDK. The OpenAI adapter, SDK dependency and environment settings have been removed. Business storage and existing accounts are preserved.

## Required setup

1. Revoke both credentials previously pasted into chat. Treat them as exposed; do not reuse them. Manage Gemini keys at https://aistudio.google.com/apikey and old OpenAI keys at https://platform.openai.com/api-keys.
2. Use a Google account and a Google AI Studio / Google Cloud project to create a fresh Gemini API key. Follow https://ai.google.dev/gemini-api/docs/api-key. Ensure the project can use the Gemini API and the key has appropriate API restrictions.
3. Privately enter the replacement only in the existing project-root `.env.local` under `GEMINI_API_KEY`. Never paste it into chat, use a NEXT_PUBLIC_ variable, or commit it. This file is Git-ignored.
4. Restart the Next.js server after changing server credentials. Run `npm run dev -- --port 3001` from the project root.

The prepared configuration is:

```dotenv
AI_PROVIDER="gemini"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-3.5-flash-lite"
NEXTAUTH_URL="http://127.0.0.1:3001"
```

The empty key is intentional: the exposed credential was removed. Model access and availability must be verified for the replacement key's project. Free allowances and rate limits vary by model and project; billing may be necessary for the selected model or usage. See https://ai.google.dev/gemini-api/docs/billing and https://ai.google.dev/gemini-api/docs/rate-limits. Creating additional keys does not increase project quota.

## Security and preserved configuration

The existing SQLite paths and authentication configuration remain in place. The scheduler secret has been independently regenerated; it is never an AI credential. Any external scheduler must use this replacement secret. No scheduler is enabled automatically. The existing secure authentication secret was preserved. No database reset or seed was run.

The Google key is read only on the server. Authentication, permission, quota, model-access and transport errors are sanitized. Authenticated chat requires live generation and returns an explicit error if Gemini fails; it does not silently substitute local explanations. Demo chat also requests live generation by default. Only the explicitly selected Offline judge mode produces labeled local guidance. Historical local messages keep their provenance label.

## Verification

`npm run verify:ai` performs a real provider probe only when a key is present. A missing key fails explicitly without contacting Google. `npm run test:ai` creates an isolated authenticated test business and exercises the application's actual chat endpoint. It rejects local responses as live success and writes `docs/live-only-check.json`. Existing owners' records are preserved.

Unit tests use injected Gemini responses to verify profile context, privacy, conversation history, tool calls and read-only employee-growth simulation. These tests do not prove real model connectivity. Only a successful provider request and authenticated chat responses establish that live AI works.

Repair findings (2026-10-25): the privately configured key generated real responses. The previously selected `gemini-3.1-flash-lite` returned HTTP 503 UNAVAILABLE with an overload indication even for a minimal native API request. The intermediate `gemini-3.5-flash` model generated company-profile and employee-growth answers, but its project/model daily free-tier allowance was exhausted. Sanitized Google quota metadata identified `GenerateRequestsPerDayPerProjectPerModel-FreeTier`, value 20 (not a temporary per-minute limit). The active configuration now selects `gemini-3.5-flash-lite`, which generated a real response with the same private key. A successful probe does not establish unlimited quota. Full application verification is recorded separately in `docs/gemini-repair-check.json`. No automatic model switch or local fallback is used.

## Timeout handling
The generation adapter retries a transient network/timeout or HTTP 500/502/503/504 failure up to twice, waiting 500 ms and 1,000 ms between attempts, with at most 15 seconds per attempt, within a 50-second total conversation budget. Authentication and quota errors are not retried. The browser allows 65 seconds for authorization, generation and saving history. No local answer is substituted. Broad prompts such as "Growth of the company." ask the live model for clarification without enabling speculative tool calls. A provider outage may still return an explicit error after the retry budget is exhausted.

The tested Gemini 3.5 Flash and Flash-Lite models use minimal thinking for interactive latency, supported by [Google’s thinking configuration documentation](https://ai.google.dev/gemini-api/docs/thinking/). Other configured model families retain their own defaults. Run `npx tsx scripts/check-gemini-repair.mts` for paced authenticated generation tests, including the user’s 75-additional-employees question, follow-up, business facts, legal topics and an unrelated request. The script creates an isolated test business and does not alter existing owners’ business profiles.
