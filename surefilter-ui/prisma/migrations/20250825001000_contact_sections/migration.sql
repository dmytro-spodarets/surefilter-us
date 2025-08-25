-- Extend SectionType enum for contact page
ALTER TYPE "public"."SectionType" ADD VALUE IF NOT EXISTS 'contact_hero';
ALTER TYPE "public"."SectionType" ADD VALUE IF NOT EXISTS 'contact_form';
ALTER TYPE "public"."SectionType" ADD VALUE IF NOT EXISTS 'contact_info';


