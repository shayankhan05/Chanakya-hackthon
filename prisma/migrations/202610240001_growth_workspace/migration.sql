-- Additive V2 migration. Does not alter or drop the V1 prototype tables.
CREATE TABLE "AppAccount" (
 "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "name" TEXT NOT NULL,
 "passwordHash" TEXT, "authVersion" INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "BusinessWorkspace" (
 "id" TEXT PRIMARY KEY, "ownerId" TEXT NOT NULL UNIQUE, "revision" INTEGER NOT NULL DEFAULT 0,
 "payload" JSONB NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "BusinessMember" (
 "businessId" TEXT NOT NULL REFERENCES "BusinessWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "userId" TEXT NOT NULL REFERENCES "AppAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "role" TEXT NOT NULL, PRIMARY KEY("businessId","userId")
);
CREATE TABLE "PasswordReset" (
 "hash" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "AppAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "AuditEntry" (
 "id" TEXT PRIMARY KEY, "businessId" TEXT NOT NULL, "actor" TEXT NOT NULL,
 "action" TEXT NOT NULL, "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AuditEntry_businessId_at_idx" ON "AuditEntry"("businessId","at");
CREATE TABLE "RateBucket" (
 "key" TEXT PRIMARY KEY, "count" INTEGER NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL
);
