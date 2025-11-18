-- CreateEnum
CREATE TYPE "public"."FormType" AS ENUM ('DOWNLOAD', 'CONTACT');

-- AlterTable
ALTER TABLE "public"."Form" ADD COLUMN     "type" "public"."FormType" NOT NULL DEFAULT 'CONTACT';
