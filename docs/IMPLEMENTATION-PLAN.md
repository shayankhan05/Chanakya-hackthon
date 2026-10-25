# Growth platform implementation plan

Audit on 24 October 2026: Next.js 15 App Router, React 19, NextAuth 4 JWT with optional GitHub, Prisma 6 PostgreSQL. No configured database, AI or mail credentials. Three existing engine tests passed. Docker daemon unavailable.

Defects: numeric form immediately coerces empty input to zero; duplicated TypeScript/database evaluation; positional risk summaries; fixed license/date/history displays; unpersisted events in connected mode; mock chat has three branches and lacks task context; export is text only; no password auth or recovery; no simulator.

Implementation sequence
1. Shared typed domain, numeric string input, source catalogue, date-effective deterministic engine and regression tests.
2. Durable tenant-scoped workspace repository with PostgreSQL and local SQLite adapters, password hashing, NextAuth credentials, sign up/reset/account/onboarding routes.
3. Atomic growth-event/evaluation/task/notification pipeline, optimistic concurrency, deduplication, persistent resources and history.
4. Refactor the existing indigo dashboard into shared data-driven views; simulator and report from the same evaluated state.
5. Contextual server-side AI with source retrieval, honest knowledge-base fallback and visible provider failures.
6. Integration tests, browser workflows, production compilation and exact handoff notes.

Preserve legacy Prisma tables and demo storage; do not run destructive schema resets. Existing prototype manual/user guides describe version 1; document version 2 separately.
