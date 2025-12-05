-- AlterTable
ALTER TABLE "public"."Section" ADD COLUMN     "sharedSectionId" TEXT;

-- CreateTable
CREATE TABLE "public"."SharedSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."SectionType" NOT NULL,
    "data" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedSection_type_idx" ON "public"."SharedSection"("type");

-- CreateIndex
CREATE INDEX "Section_sharedSectionId_idx" ON "public"."Section"("sharedSectionId");

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_sharedSectionId_fkey" FOREIGN KEY ("sharedSectionId") REFERENCES "public"."SharedSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
