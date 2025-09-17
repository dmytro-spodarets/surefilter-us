# Content Editing Plan and Status

Scope and approach
- Data model: Page + Section(type, data JSON) + PageSection(order). JSON данные валидируем на уровне приложения.
- Admin UI: управление страницами (SEO/slug), секциями на странице (добавление/удаление/порядок/редактирование).
- Отдельные сущности: NewsArticle, Resource, NavigationItem, FooterLink; позже — продукты/фильтры.

Legend
- [x] done  [~] in progress  [ ] todo

0) Prerequisites
- [x] Postgres via Docker
- [x] Prisma setup and client
- [x] Auth (credentials), hidden /login, protected /admin
- [x] DB health endpoint

1) CMS primitives (DB + backend)
- [x] Prisma models: Page, Section (enum type, jsonb data), PageSection (position)
- [x] Enum SectionType (hero_full, why_choose, featured_products, quick_search, industries, about_news, ...)
- [x] Migrations applied
- [x] Server mappers: SectionType -> React component props (parsers/validators)
- [x] Generic CMS routes: `/(site)/[slug]` and `/(site)/[...slug]` with metadata
- [x] Admin API: unified catch‑all `/api/admin/pages/[...slug]`
- [x] Slug validation for `heavy-duty/*`, `automotive/*`
- [x] Seed updates: filter type icons, `listing_card_meta`; seeded HD pages (oil/air)
- [x] Related Filters powered by `FilterType` + `listing_card_meta`

2) Admin UI
- [x] /admin/pages: list, edit
- [x] Page editor: SEO (title, description, og)
- [x] Sections on page: list with order (up/down), edit per type
- [x] Section editors: hero_full, featured_products, why_choose, quick_search, industries, about_news
- [x] Hide from robots (already) and no links in menu (already)
- [x] Modal page creation
- [x] Protect core‑pages from deletion (`RESERVED_SLUGS`, disabled button)
- [x] Redirect to page editor after Add Section; section deletion UX
- [x] Admin: `/admin/industries`, `/admin/filter-types`

3) Page-by-page migration
Home (/)
- [x] Hero
- [x] WhyChoose
- [x] FeaturedProducts
- [x] QuickSearch
- [x] Industries
- [x] AboutNews

About Us (/about-us)
- [x] PageHero
- [x] AboutWithStats
- [x] QualityAssurance
- [x] ContentWithImages
- [x] manufacturing_facilities
- [x] our_company
- [x] stats_band
- [x] awards_carousel

Heavy Duty (/heavy-duty and subpages /air|cabin|fuel|oil)
- [x] SearchHero (CMS)
- [x] FilterTypesGrid (CMS) - Updated to 7 columns for large screens
- [ ] ContentWithImages
- Note: All subpages migrated to CMS

Heavy Duty Subpages (CMS - Migration completed)
- [x] /heavy-duty/air - Migrated to CMS
- [x] /heavy-duty/cabin - Migrated to CMS
- [x] /heavy-duty/fuel - Migrated to CMS
- [x] /heavy-duty/oil - Migrated to CMS

Automotive (/automotive)
- [x] SearchHero (CMS) - Migrated to CMS
- [ ] CMS sections (ContentWithImages / Products)
- Note: Page migrated to CMS

Industries (/industries, /industries/agriculture)
- [x] /industries: FullScreenHero + IndustriesList (CMS)
- [ ] /industries/agriculture: Static page → CMS migration needed
- [ ] /industries/[slug]: detail pages and content
- Note: Legacy `/industry` removed in favor of `/industries`

Resources (/resources, /resources/heavy-duty-catalog)
- [ ] /resources: Static page → CMS migration needed
- [ ] /resources/heavy-duty-catalog: Static page → CMS migration needed
- [ ] Resource items (entity + CMS)
- Note: Filtering, gallery/list toggle, pagination done in UI; backend pending

Newsroom (/newsroom, /newsroom/heavy-duty-filter-launch)
- [ ] /newsroom: Static page → CMS migration needed
- [ ] /newsroom/heavy-duty-filter-launch: Static page → CMS migration needed
- [ ] News list (NewsArticle entity)
- [ ] News detail (CMS)
- Note: One static detail page exists

Warranty (/warranty)
- [ ] /warranty: Static page → CMS migration needed
- [ ] MagnussonMossAct (static) → CMS migration needed
- [ ] QualityAssurance (static) → CMS migration needed
- [ ] LimitedWarrantyDetails (static) → CMS migration needed
- [ ] WarrantyContact (static) → CMS migration needed
- [ ] WarrantyPromise
- [ ] WarrantyClaimProcess (component exists; not on page)
- Note: Page currently static; CMS migration required

Contact Us (/contact-us)
- [x] ContactOptions (CMS)
- [x] Content blocks (CMS)
- [x] contact_hero
- [x] contact_options
- [x] contact_form_info
- Note: Uses `contact_hero`, `contact_options`, `contact_form_info` sections

Filters and Catalog (/filters/[code], /catalog)
- [ ] /catalog: Static page → CMS migration needed
- [ ] /filters/[code]: Static page → CMS migration needed
- [ ] Data models for products/filters
- [ ] Server filtering/search, Pagination component reuse
- Note: UI implemented with filters, view toggle, pagination; using mock data

4) Shared content
- [ ] NavigationItem (Header)
- [ ] FooterLink groups (Footer)
- [ ] Global SEO defaults (already in layout; expose in admin)

5) Publishing
- [ ] Draft/Published flags and visibility
- [ ] Revalidation hooks for ISR (later)
- [x] Production domain via CloudFront+ACM+Route53 (`new.surefilter.us`), canonical redirect, origin protection header
- [x] Static assets offloaded to S3+CloudFront (`/_next/static/*`, `/images/*`) with long TTL
- [x] CI: image build & push (manual, tag input) + S3 upload of static from the same image; optional CF invalidation

6) Products & Specifications (Admin)
- [x] Prisma schema: SpecParameter, ProductSpecValue; relation with Product
- [x] Admin API: spec-parameters CRUD
- [x] Products API: accept/persist specValues; include on fetch (with parameter)
- [x] Admin UI: /admin/spec-parameters (list/new/edit)
- [x] ProductForm: specifications editor wired to API
- [x] Admin nav: Specs link
- [x] Prisma db push and generate
- [ ] End-to-end QA and UX polish (inline validation hints, drag-and-drop ordering)
- [ ] Catalog integration: spec filters and product details rendering

Risks/notes
- JSONB data validated at runtime; add Zod schemas per SectionType.
- Gradual migration: pages can remain mixed (static + CMS) until complete.
- After DB import: restrict RDS SG (remove 0.0.0.0/0) and consider VPC Connector for App Runner
- Consider moving from OAI to OAC for S3 origin access in CloudFront (SigV4, less drift)

## Recent Changes (2025-01-17)

### Search Functionality Disabled for Phase 1 Release
- [x] Header search form commented out, replaced with "Browse Catalog" link
- [x] Hero components search forms commented out (Hero, HeroCms, SearchHero, CompactSearchHero)
- [x] QuickSearch components search forms commented out (QuickSearch, QuickSearchCms, SimpleSearch)
- [x] All search functionality temporarily disabled with TODO comments for future uncommenting
- [x] Replaced with temporary "Browse Full Catalog" links

### Admin Panel Improvements
- [x] Created AdminContainer component with max-w-7xl width for large screens
- [x] Updated ALL admin pages to use new wide layout (15 pages total)
- [x] Added missing admin forms for search_hero and compact_search_hero sections
- [x] Connected filter_types_grid and popular_filters forms to admin panel
- [x] Connected simple_search form to admin panel

### Component Updates
- [x] FilterTypesGrid: Changed from 6 to 7 columns for large screens
- [x] All search components: Search functionality disabled, replaced with catalog links

### Infrastructure Updates
- [x] Updated .gitignore to exclude all Terraform/OpenTofu local files
- [x] Fixed CloudFront 404 issue (resolved)
- [x] Updated README with comprehensive documentation of changes

### CMS Migration Progress
- [x] /heavy-duty/air - Migrated to CMS, static files removed
- [x] /heavy-duty/cabin - Migrated to CMS, static files removed
- [x] /heavy-duty/fuel - Migrated to CMS, static files removed
- [x] /heavy-duty/oil - Migrated to CMS, static files removed
- [x] /automotive - Migrated to CMS, static files removed

### Static vs CMS Pages Status
**Static Pages (10 total) - CMS Migration Required:**
- /catalog, /filters/[code]
- /industries/agriculture
- /newsroom, /newsroom/heavy-duty-filter-launch
- /resources, /resources/heavy-duty-catalog
- /warranty

**Admin/System Pages (2 total) - Keep Static:**
- /login, /test-colors

**CMS Pages (10+ total) - Already Migrated:**
- / (home), /about-us, /heavy-duty (main), /contact-us, /industries (main)
- /heavy-duty/air, /heavy-duty/cabin, /heavy-duty/fuel, /heavy-duty/oil
- /automotive
- Dynamic pages: /(site)/[...slug], /(site)/[slug]

**Migration Priority:**
1. High Priority: /catalog, /filters/[code] (product pages)
2. Low Priority: /newsroom, /resources, /warranty, /industries/agriculture
3. ✅ COMPLETED: /heavy-duty/* subpages, /automotive

## CMS Migration Plan

### Phase 1: Product Pages (High Priority)
- [ ] /catalog → Create CMS page with product listing sections
- [ ] /filters/[code] → Create dynamic CMS page for individual products
- [ ] Create product data models and admin interfaces

### Phase 2: Heavy Duty Subpages (Medium Priority) - COMPLETED ✅
- [x] /heavy-duty/air → Migrated to CMS with existing content
- [x] /heavy-duty/cabin → Migrated to CMS with existing content
- [x] /heavy-duty/fuel → Migrated to CMS with existing content
- [x] /heavy-duty/oil → Migrated to CMS with existing content

### Phase 3: Other Pages (Low Priority)
- [ ] /industries/agriculture → Migrate to CMS
- [ ] /newsroom → Migrate to CMS with news articles
- [ ] /newsroom/heavy-duty-filter-launch → Migrate to CMS
- [ ] /resources → Migrate to CMS
- [ ] /resources/heavy-duty-catalog → Migrate to CMS
- [ ] /warranty → Migrate to CMS

### Migration Process for Each Page:
1. Create CMS page in admin panel
2. Add sections with existing content
3. Update routing to use CMS page
4. Remove static page file
5. Test and verify functionality

## Code Cleanup TODOs

### Database Schema Cleanup
- [ ] **Check `fullSlug` usage**: Investigate if `fullSlug` field in `FilterType` model is still needed
  - Currently used in admin filter-types page as fallback for links
  - If not used elsewhere, consider removing to simplify schema
  - Update admin page to handle missing `pageSlug` properly instead of falling back to `fullSlug`

### Recent Fixes (2025-01-17)
- [x] **Fixed pageSlug sync issue**: Added automatic update of `pageSlug` in `FilterType` when page slug is changed
  - When page slug changes, all related `FilterType` records are updated automatically
  - When page is deleted, `pageSlug` references are cleared (set to null)
  - This prevents broken links in admin filter-types page
- [x] **Fixed API response issue**: Updated filter-types API to include `pageSlug` in GET response
  - Added `select` clause to explicitly include `pageSlug` field
  - Added PUT method for updating `pageSlug` in filter-types
- [x] **Cleaned up duplicate pages**: Removed duplicate page `heavy-duty/oil-filters` that was causing confusion
  - Kept the correct page `heavy-duty/oil` that matches the `pageSlug` in FilterType
  - This resolves the issue where admin page was redirecting to non-existent page
- [x] **Created web-based monitoring**: Added `/admin/system-health` and `/admin/settings` pages
  - All database monitoring and maintenance tools now available through web interface
  - No need for CLI scripts or SSH access to production server
  - One-click health checks and issue fixing
