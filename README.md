# ComplianceCopilot

Indian SME growth and compliance decision support, built with Next.js 15, React 19, TypeScript, Tailwind, NextAuth, Prisma and configurable server-side Gemini/OpenRouter integrations.

## Existing installation: start safely

Run from this project directory. Keep existing environment files and `.data/`; do not reset, reseed or migrate an existing business merely to start the application.

```powershell
$env:NEXTAUTH_URL='http://127.0.0.1:3001'
npm run dev -- --port 3001
```

Open [the application](http://127.0.0.1:3001), [sample business](http://127.0.0.1:3001/demo), or [isolated deadline demo](http://127.0.0.1:3001/demo/deadlines).

Production preview, after stopping the development process on that port:

```powershell
npm run build
$env:NEXTAUTH_URL='http://127.0.0.1:3001'
npm start -- --port 3001
```

The current installation explicitly selects persistent SQLite. The Next.js server serves both frontend and authenticated API routes; no separate backend process is needed. The optional PostgreSQL adapter uses Prisma. Existing accounts are credentials-based; GitHub OAuth is not required.

## Features

Exactly six primary sections: Overview, Laws for My Business, What I Need to Do, Important Warnings, Plan My Growth, and Ask AI. Calendar, certificates, reports, CSV tools, business history and calculators remain available within the relevant sections or account menu.

Gemini is currently active: `AI_PROVIDER=gemini`, server-only `GEMINI_API_KEY`, and `GEMINI_MODEL`. OpenRouter remains optional via explicit `AI_PROVIDER=openrouter` and its own key. No automatic provider or local fallback occurs for authenticated chat. See [Gemini setup](docs/GEMINI-SETUP.md).

Deadline monitoring runs on workspace access/update. A protected job endpoint is available for an external scheduler, but no scheduler or email notification service is configured by this project. Sources and calculations are limited and reviewed, not a guarantee of complete current Indian law.

## Documentation

- [Complete feature and button guide](docs/PRODUCT-GUIDE.md)
- [Final refinement, architecture, verification and limitations](docs/FINAL-REFINEMENT-REPORT.md)
- [Fifty evaluation scenarios](tests/fixtures/advisor-evaluation.json)
- [Executed evaluation results](docs/advisor-evaluation-results.json)

## Verification

```powershell
npm run lint
npm run typecheck
npm test
$env:TEST_BASE_URL='http://127.0.0.1:3001'
node scripts/test-http.mjs
npx tsx scripts/test-assistant-e2e.mts
npx tsx scripts/test-tax-e2e.mts
npx tsx scripts/test-deadline-e2e.mts
npx tsx scripts/test-product-journey.mts
npm run evaluate:advisor
npm run build
```

HTTP checks create synthetic accounts and business records in the configured test server. Use a separate test installation when running them outside this local hackathon environment. They do not delete existing owner records. The advisor evaluator refuses metered calls unless `RUN_LIVE_EVAL=true` is explicitly set when a live key is configured. Local checks do not establish live-model quality or tool-selection accuracy.

## Current AI provider
Gemini is currently active: `AI_PROVIDER=gemini`, server-only `GEMINI_API_KEY`, and `GEMINI_MODEL`. OpenRouter remains optional via explicit `AI_PROVIDER=openrouter` and its own key. No automatic provider or local fallback occurs for authenticated chat. See [Gemini setup](docs/GEMINI-SETUP.md).

## Round-two engineering upgrade
Constraint-aware preparation scheduling, exact payroll projections and versioned rule deltas now run without an AI key. See [engineering/formulation](docs/ROUND-TWO-ENGINEERING.md), [measured benchmark](docs/ROUND-TWO-BENCHMARK.md), and [judge walkthrough](docs/ROUND-TWO-DEMO.md). Run `npm run benchmark:round-two` to reproduce the 25 fictional constraint scenarios. The live app exposes the benchmark at `/round-two-benchmark.html`.

### Sample chat mode
Ask Copilot now requests the configured live Gemini model in the sample workspace by default. The explicit Offline judge mode checkbox uses labeled local guidance without provider calls. Live failures return an error; they never silently switch to local text. Anonymous live demo requests are rate limited and use only the submitted sample profile, not private account records. The deterministic scheduling and financial tools remain usable without AI.
