# Assistant repair and intelligence upgrade

Verified 25 October 2026 against http://127.0.0.1:3001. This document supersedes the assistant implementation and test counts in CHATBOT-REPAIR.md.

## Root causes and limits

The original generic frontend catch message masked validation, HTTP and network failures. An earlier client sent `messages/profile` while the replacement endpoint expected `question/messageId`; the compatibility adapter remains in place. Historical errors cannot be attributed to a specific remote status retrospectively.

The server has no OPENAI_API_KEY. The user chose to continue without one. Authentication, model access, quota, billing and remote network connectivity therefore remain unverified. Local responses are explicitly labeled; they are not online model output.

The previous local router did not expose complete business identity or recent events. Scenario parsing silently clamped excessive employee reductions to zero. Conversation topic inheritance also incorrectly restricted a general pending-task request to the preceding law. These issues are repaired.

## Request flow

The chat panel posts to the same-origin `/api/chat`. Authenticated requests load the authorized workspace and active conversation from the server; client-supplied profile/history cannot replace those records. Legacy and public demo requests use bounded local guidance.

When a server key is available, OpenAI Responses receives conversation history and legal excerpts. Read-only tools retrieve selected saved business records, search the checked legal catalogue, or calculate a growth scenario through the existing engine. Optional official-domain web search is disabled by default. There are no filing, payment, profile-editing or task-completion tools.

Provider failures produce sanitized backend diagnostics and a clearly labeled local response. Secrets, raw user questions and provider error bodies are not logged. Retry IDs prevent duplicate messages; conversation epochs prevent an in-flight response from restoring cleared history.

## Controls

- Send: submits the question; loading disables duplicate sends.
- Suggested questions: submit common business or growth questions.
- Retry: resends a failed request with its stable identifier.
- New conversation: starts isolated context and retains previous messages in storage.
- Clear history: asks for confirmation, then removes this business's stored chat messages; business records remain intact.
- Copy: copies an assistant response and reports clipboard errors.
- Legal sources: expands official links, review dates and available jurisdiction/effective-date metadata.
- Action links: open the relevant existing business section.

## Verification

- TypeScript check passed.
- 29 unit/repository tests passed before the additional task-filter regression; the final suite contains 30 tests.
- 32 authenticated question checks passed through the running HTTP endpoint using synthetic accounts and businesses. Covered identity, location, headcount, turnover, POSH, EPF applicability, GST versus hiring, follow-ups, task status, recent events, legal dates, licenses, exports, branches, combined growth, ambiguous inputs and impossible reductions.
- Additional HTTP assertions passed for cross-business denial, retry idempotency, isolated new conversations, clearing chat only, and no scenario mutations to saved profiles/tasks/events/certificates.
- Browser chat submitted “What is POSH?” and displayed the explanation with local-mode labels and expandable sources.
- Provider tool-loop tests use an injected transport. They do not establish live OpenAI connectivity. Actual provider calls: zero.

Reproduce checks with `npm run typecheck`, `npm test`, and `node node_modules/tsx/dist/cli.mjs scripts/test-assistant-e2e.mts`. The HTTP script expects port 3001 unless TEST_BASE_URL is set and creates synthetic test records.

## Enable live AI later

Set OPENAI_API_KEY privately in `.env.local`; never prefix it with NEXT_PUBLIC_. OPENAI_MODEL defaults to gpt-4.1-mini. OPENAI_WEB_SEARCH=true optionally enables official-domain search, subject to provider model/tool access and billing. Restart the server after changing configuration. GET /api/chat reports configuration presence, not proven connectivity.

The current development command is `npm run dev -- --port 3001`, with NEXTAUTH_URL=http://127.0.0.1:3001 in the process environment. The frontend and backend route handlers run together in Next.js, backed by the existing local SQLite database.

Local legal guidance is bounded to the checked catalogue. Review dates are shown; it cannot verify every subsequent amendment or answer arbitrary legal questions. Scenarios are planning calculations and do not save changes or invent statutory dates or penalty amounts.

## Files

Updated: app/api/chat/route.ts, components/chat-panel.tsx, lib/assistant.ts, lib/chat-contract.ts, lib/domain.ts, .env.example.

Added: lib/chat-provider.ts, lib/assistant-context.ts, lib/chat-scenarios.ts, tests/conversation-upgrade.test.ts, scripts/test-assistant-e2e.mts, this document. Previous implementations are retained under docs/archive/v1/.
