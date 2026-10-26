-- Additive only; never moves or deletes existing uploads or workspace payloads.
CREATE TABLE "EvidenceFile" (
 "id" TEXT NOT NULL,
 "businessId" TEXT NOT NULL REFERENCES "BusinessWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "ciphertext" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY ("businessId", "id")
);
