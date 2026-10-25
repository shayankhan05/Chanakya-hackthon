# Chatbot repair and verification

Verified locally on 24 October 2026 at http://127.0.0.1:3000/demo.

## Findings

The original frontend catch block in the archived V1 dashboard produced the exact message “The assistant is temporarily unavailable. You can still review your tasks and action plans.” It used that message for every HTTP error, invalid response and network exception, so the visible message did not identify the failing layer.

The original client sent `{messages, profile}`. The new V2 endpoint initially accepted only `{question, messageId, businessId/demoProfile, history}`. An old or cached frontend calling that strict endpoint would fail request validation. The endpoint now accepts both contracts. Original clients receive a source-backed answer with an explicit local-guidance prefix. They cannot use a public endpoint to incur live-provider costs.

The checked server configuration has **no OPENAI_API_KEY**. Live OpenAI connectivity, account model access, quota and billing cannot be verified without credentials. No claim is made that these remote checks passed. The model configuration is gpt-4.1-mini. The application can answer supported questions using a clearly labeled local catalogue without any provider credentials.

The historic generic message alone cannot establish which HTTP status or network failure occurred in a previous browser session. Safe request IDs and stage-specific server diagnostics now preserve that distinction.

## Changes

- `app/api/chat/route.ts`: supports the old and current contracts; reports non-secret configuration through GET; uses server-authorized business data for real accounts; supplies relevant legal excerpts, findings, current tasks and history to OpenAI Responses; returns explicit fallback mode; logs only safe request identifiers, stages, model names, statuses and error codes.
- `lib/chat-contract.ts`: request adapters, bounded history, follow-up topic resolution and safe provider error classification.
- `lib/assistant.ts`: source-backed POSH, EPF, ESI and GST explanations, business-specific facts, scenario support and contextual document follow-ups.
- `components/chat-panel.tsx`: configuration label, loading state, immediate duplicate-submit guard, bounded history, timeout and network/HTTP error handling, source links, and demo-task context.
- `tests/chat-contract.test.ts`: compatibility, follow-up and authentication/quota/model/network diagnostic cases.
- `scripts/test-chat-http.ts`: real HTTP checks against the running application.

## Executed checks

All nine chatbot HTTP checks passed. Each supported request returned HTTP 200, a request ID, source links and mode `knowledge-base`:

1. What is POSH
2. What is EPF
3. Why does EPF apply to my business with 24 employees and an unknown exemption status
4. What documents do I need as an EPF follow-up
5. Does hiring more employees increase my GST
6. What is ESI
7. What is GST
8. Original frontend request contract
9. Invalid payload returns HTTP 400 and a safe request ID

The browser UI was also used to submit POSH, its document follow-up, EPF, company-specific EPF reasoning, and the hiring/GST question. Answers appeared in the actual panel with local-source labels and government reference links.

TypeScript checking and all 19 unit/repository regression tests passed. A prior authenticated HTTP integration run passed 16 checks, including chat persistence and business access control. Remote AI and email delivery were not tested.

## Configuration for live AI

Add a real key to the server-only `.env.local` file:

```dotenv
OPENAI_API_KEY=your-real-server-key
OPENAI_MODEL=gpt-4.1-mini
```

Never prefix the key with NEXT_PUBLIC. Do not commit the file. Restart `npm run dev` after setting it. Use a real signed-in business at `/dashboard` for live AI. The separate `/demo` workspace intentionally remains local source search even if a key exists.

`GET /api/chat` reports whether a key is present, not whether it is valid. A successful signed-in question with response mode `live` verifies a real provider request. Invalid authentication, exhausted quota, rate limits, unsupported model/request configuration, connection failures and timeouts are surfaced as distinct provider failures with an honest source-search fallback.

Run the chat checks with the server running:

```powershell
node node_modules/tsx/dist/cli.mjs scripts/test-chat-http.ts
npm run typecheck
npm run test
```

The HTTP script checks demo/local fallback intentionally. It does not spend provider credits. To use a different local origin, set TEST_BASE_URL before running it.

OpenAI implementation reference: https://developers.openai.com/api/docs/guides/text

Checked legal references are recorded in `lib/legal-catalogue.ts`. The fallback is limited to that catalogue and does not search the internet or certify compliance.
