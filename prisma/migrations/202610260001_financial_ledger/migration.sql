-- Additive only. Existing accounts, workspaces and payloads are unchanged.
CREATE TABLE "FinancialLedger" (
 "businessId" TEXT PRIMARY KEY REFERENCES "BusinessWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "revision" INTEGER NOT NULL DEFAULT 0,
 "ciphertext" TEXT NOT NULL,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
