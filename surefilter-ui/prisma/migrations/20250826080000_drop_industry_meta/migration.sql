-- 1) Migrate existing data values to listing_card_meta
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sectiontype') THEN
    UPDATE "Section" SET type = 'listing_card_meta' WHERE type = 'industry_meta';
  END IF;
END $$;

-- 2) Recreate enum without industry_meta
DO $$
DECLARE
  exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'sectiontype' AND n.nspname = 'public'
  ) INTO exists;

  IF exists THEN
    -- Create new enum
    CREATE TYPE "public"."SectionType_new" AS ENUM ('hero_full','hero_compact','page_hero','page_hero_reverse','single_image_hero','compact_search_hero','search_hero','why_choose','featured_products','products','quick_search','industries','industries_list','listing_card_meta','filter_types_grid','popular_filters','about_with_stats','about_news','quality_assurance','content_with_images','related_filters','news_carousel','product_gallery','product_specs','limited_warranty_details','magnusson_moss_act','warranty_claim_process','warranty_contact','warranty_promise','contact_options','manufacturing_facilities','our_company','stats_band','awards_carousel','contact_hero','contact_form','contact_info','contact_details','contact_form_info');
    -- Alter table to use new enum
    ALTER TABLE "Section" ALTER COLUMN type TYPE "public"."SectionType_new" USING type::text::"public"."SectionType_new";
    -- Drop old enum and rename
    DROP TYPE "public"."SectionType";
    ALTER TYPE "public"."SectionType_new" RENAME TO "SectionType";
  END IF;
END $$;


