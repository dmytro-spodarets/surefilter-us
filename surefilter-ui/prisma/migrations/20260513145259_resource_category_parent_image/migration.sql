-- AlterTable
ALTER TABLE "ResourceCategory" ADD COLUMN     "image" TEXT,
ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "ResourceCategory_parentId_idx" ON "ResourceCategory"("parentId");

-- AddForeignKey
ALTER TABLE "ResourceCategory" ADD CONSTRAINT "ResourceCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ResourceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

