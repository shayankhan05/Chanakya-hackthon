# Submission release — 26 October 2026

## Authorized production release update

The owner verified the pre-release recovery snapshot and authorized the migration and release. The direct production connection was verified against the supplied Neon host and `neondb`. The existing growth-workspace migration was baselined; only the FinancialLedger and EvidenceFile migrations were applied. Prisma status passed and fingerprints of every pre-existing table were unchanged immediately after migration.

A fictional production account passed public signup, login and fresh-session checks. Its workspace was verified in the same Neon database across independent connections, confirming that Vercel uses the intended database. Encrypted financial/evidence transaction probes passed and were rolled back. These pre-release checks authorize removal of the main deployment hold; deployment build and live financial smoke tests remain required before declaring the new features live.

The sections below record the earlier source-only submission and hold, retained as release history.

This report supersedes the earlier submission audit and GitHub release investigation, which record intermediate failures and test counts.

## Scope

The owner authorizes committing and pushing the tested source to existing GitHub `main`, with automatic Vercel deployments held. No production migration, deployment, data transfer or database reset is authorized.

- Repository: https://github.com/shayankhan05/Chanakya-hackthon
- Existing public site: https://compliancecopilot-shayan.vercel.app
- Public deployment before this source release: `dpl_6Dwa5RxD3WNaaTe2FPZMPdfiXxqU`, READY, commit `452b54d0381303924bb17e992b6c9adffe98a8b2`.
- The public site does **not** contain the latest financial module.

## Latest local verification

- 184 automated tests passed, none failed.
- TypeScript and ESLint passed.
- Production compilation passed. The local build does not prove production database connectivity; its production database gate only executes in Vercel.
- All 39 real authenticated HTTP checks passed against the local production build, using isolated fictional owners. These cover classification, confirmation, duplicate handling, transaction recalculation, four-complete-month INR 42,75,000 annualization, persistence across fresh sessions/reloads, access isolation and private evidence uploads/downloads.
- PostgreSQL evidence adapter tests use test doubles; a real PostgreSQL write/read test is still required before publishing.
- Existing local protected workspace payload and encrypted financial ledger matched their preservation checksums; all 36 transactions remained present. No private database, environment or uploaded file is included in the source release.
- Source scan checked known credential patterns and actual local secret values without printing them. The only credential-URL pattern match was the documented localhost placeholder in `.env.example`, explicitly reviewed as an example.
- Browser interaction and live AI generation are not newly verified by these checks.

## Deployment hold

Before the push, the existing Vercel project was updated with this ignored-build command:

```sh
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then exit 0; else exit 1; fi
```

Vercel accepted the update. Its project-summary response omits the command field, so independent readback of that setting is unavailable through that response. As an additional explicit protection, the source release contains `vercel.json` with `git.deploymentEnabled.main=false`. That setting disables automatic Git deployments for main. No migrations run as part of this push. Verify the public alias still resolves to the previous deployment after the push.

References: [Vercel Git deployment configuration](https://vercel.com/docs/project-configuration/git-configuration), [ignored build step exit codes](https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel).

## Minimum viable safe publishing route — not executed

1. Identify the existing Neon project's exact production branch/database and privately match its endpoint with Vercel's production `DATABASE_URL`. The known project is `sweet-mouse-60663406`, named `compliancecopilot`; the endpoint match remains unverified.
2. Confirm a recoverable snapshot or usable restore point before any database modification. The project reported six-hour history retention; this is not proof that a restore has been tested or that a specific point is currently available.
3. Inspect schema and migration history on the correct database. Default-database schema checks reported missing `BusinessWorkspace`, `FinancialLedger` and `EvidenceFile`; do not assume only the two newest migrations are needed, or that existing tables can safely be baselined.
4. Review and test additive Prisma migrations on an isolated approved environment. Initialize workspace/account tables only if genuinely absent; otherwise baseline only an exactly matching schema. Add `FinancialLedger` and `EvidenceFile`. Never reset or reseed the existing production database.
5. Configure explicit `STORAGE_DRIVER=postgres`, the persistent production connection, the correct public `NEXTAUTH_URL`, `AUTH_DEV_RESET=false`, and stable authentication/encryption secrets. Preserve keys protecting any existing encrypted data. PostgreSQL stores both the encrypted financial ledger and private evidence; no separate file service is necessary for the current 2 MiB evidence limit. The public legal index is rebuilt in memory on Vercel.
6. Run the read-only production readiness gate and authenticated fictional PostgreSQL import/confirmation/reload/download/isolation checks. Verify database capacity, backup retention and key recovery.
7. Obtain the owner's release approval, remove both deployment holds deliberately, and deploy through the existing Vercel project. Confirm the deployed commit and repeat authenticated smoke tests before claiming the financial features are live.

Until those requirements are met, submit the updated GitHub source link together with the clearly labeled older live-site link.
