-- Ensure enum has listing_card_meta and convert any existing rows
DO $$
BEGIN
  -- Add enum value if missing
  BEGIN
    ALTER TYPE "public"."SectionType" ADD VALUE IF NOT EXISTS 'listing_card_meta';
  EXCEPTION WHEN others THEN
    -- ignore if already exists or type not yet created
    NULL;
  END;

  -- Convert any legacy rows
  BEGIN
    UPDATE "Section" SET type = 'listing_card_meta'::"SectionType" WHERE type::text = 'industry_meta';
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;


