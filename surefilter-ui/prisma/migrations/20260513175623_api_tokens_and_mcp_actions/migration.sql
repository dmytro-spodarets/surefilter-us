-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminAction" ADD VALUE 'TOKEN_CREATED';
ALTER TYPE "AdminAction" ADD VALUE 'TOKEN_REVOKED';
ALTER TYPE "AdminAction" ADD VALUE 'TOKEN_REGENERATED';
ALTER TYPE "AdminAction" ADD VALUE 'MCP_TOOL_CALL';
ALTER TYPE "AdminAction" ADD VALUE 'MCP_SETTINGS_UPDATED';

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "mcp" JSONB;

-- CreateTable
CREATE TABLE "ApiToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenPrefix" TEXT NOT NULL,
    "scopes" TEXT[],
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "lastUsedIp" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "revokedReason" TEXT,
    "requestCountToday" INTEGER NOT NULL DEFAULT 0,
    "requestCountDate" TIMESTAMP(3),
    "dailyQuota" INTEGER NOT NULL DEFAULT 10000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiToken_tokenHash_key" ON "ApiToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApiToken_userId_idx" ON "ApiToken"("userId");

-- CreateIndex
CREATE INDEX "ApiToken_expiresAt_idx" ON "ApiToken"("expiresAt");

-- CreateIndex
CREATE INDEX "ApiToken_revokedAt_idx" ON "ApiToken"("revokedAt");

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
