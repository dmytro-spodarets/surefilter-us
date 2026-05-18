-- CreateTable
CREATE TABLE "MCPIdempotency" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MCPIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MCPIdempotency_createdAt_idx" ON "MCPIdempotency"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MCPIdempotency_tokenId_key_key" ON "MCPIdempotency"("tokenId", "key");
