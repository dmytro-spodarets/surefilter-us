-- AlterEnum: add new section types for About Us
ALTER TYPE "public"."SectionType" ADD VALUE IF NOT EXISTS 'manufacturing_facilities';
ALTER TYPE "public"."SectionType" ADD VALUE IF NOT EXISTS 'our_company';
ALTER TYPE "public"."SectionType" ADD VALUE IF NOT EXISTS 'stats_band';
ALTER TYPE "public"."SectionType" ADD VALUE IF NOT EXISTS 'awards_carousel';


