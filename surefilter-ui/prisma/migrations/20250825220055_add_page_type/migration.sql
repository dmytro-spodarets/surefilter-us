-- CreateEnum
CREATE TYPE "public"."PageType" AS ENUM ('CORE', 'CUSTOM', 'INDUSTRY');

-- AlterTable
ALTER TABLE "public"."Page" ADD COLUMN     "type" "public"."PageType" NOT NULL DEFAULT 'CUSTOM';
