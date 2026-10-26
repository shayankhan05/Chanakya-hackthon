# Production storage readiness — push and deployment held

The existing GitHub repository and Vercel project are retained. No push or deployment is authorized until live storage verification is complete and the owner gives approval.

## Implemented architecture

- Local development retains the existing SQLite business database and private upload directory. No local account, transaction, workspace or encryption key is migrated, reset or replaced.
- Vercel requires explicit `STORAGE_DRIVER=postgres` and a persistent `DATABASE_URL`. Business repositories reject local SQLite on Vercel; `/tmp` is never used for business data.
- PostgreSQL `FinancialLedger` stores the encrypted financial aggregate and encrypted originals inside that aggregate. Optimistic revisions and workspace membership checks remain enforced.
- PostgreSQL `EvidenceFile` stores encrypted evidence (at most 2 MiB per existing upload rule). The key is the same stable financial-storage key; authenticated encryption also binds each file to its business and document ID. Downloads require workspace membership and a matching document record. There are no public file URLs or disk fallbacks in production.
- The default key derives from the existing stable `NEXTAUTH_SECRET`. A dedicated `FINANCIAL_DATA_KEY` is optional **only before first encrypted import**. Adding or rotating a key after encrypted data exists requires controlled re-encryption; never replace a live key to resolve an error.
- Original local evidence files remain readable using the local adapter. No local financial data is automatically uploaded to production.
- The public, rebuildable legal search index runs in memory on Vercel. Its runtime indexing is instance-local; newly reviewed legal-source additions need a persistent publishing workflow if required across instances. Business records do not use this index.

## Build gate and verification

`npm run build` retains Prisma generation and Next.js compilation, and additionally runs the read-only production readiness gate when `VERCEL=1`. The gate requires PostgreSQL, the production authentication URL, a stable non-placeholder secret, disabled development recovery, working encryption, database connectivity and all required application tables/columns. Missing configuration or schema causes a failed build before application deployment. The gate does not run migrations or touch local SQLite.

`npm run verify:production` runs the same read-only checks using privately supplied process environment. It deliberately does not load `.env.local` or display connection strings. A successful schema probe does not prove backup retention, available database capacity, encryption-key escrow, or a successful authenticated end-to-end production import; these must also be verified before release.

## Additive migrations prepared, not yet applied live

1. `202610260001_financial_ledger`: new encrypted financial aggregate table.
2. `202610260002_private_evidence`: new encrypted private evidence table, with a compound business/document primary key and workspace foreign key.

Before running Prisma 6 migrations against the existing database:

1. Identify the exact existing Neon project/database used by the Vercel production connection, without publishing its credentials. Confirm backup/recovery availability and preserve a restorable snapshot.
2. Inspect table definitions and `_prisma_migrations` read-only. The earlier database may have been initialized with `db push`; do not assume migration history exists.
3. If the existing growth-workspace schema matches `202610240001_growth_workspace`, baseline that migration using `prisma migrate resolve --applied 202610240001_growth_workspace`. Only do this after checking every table/constraint in that migration. If the schema differs, stop and reconcile it safely.
4. Review the two additive SQL migrations. Run `prisma migrate deploy` using the existing production database connection, in a controlled release step. Do not run `migrate reset`, `migrate dev`, or destructive `db push` against production.
5. Verify migration status, table columns, keys, foreign keys and existing account/workspace counts. Run the read-only production gate. Then test authenticated fictional import, confirmation, reload, cross-account isolation and evidence download against the intended environment before declaring production features operational.
6. Keep the push/deployment held for the owner's final approval. Do not put private local data in Git or migrate it automatically.

## Remaining external verification

Vercel lists the production environment variable names, but marks values sensitive and does not return their contents through this connection. Therefore existence of `DATABASE_URL` or `STORAGE_DRIVER` is not proof of correct values or database connectivity. Neon access is required to identify the existing database, inspect backup/schema/history, and safely apply the prepared additive migrations. No production migration or storage durability test has been claimed.

Reference: [Prisma baselining an existing database](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining).
