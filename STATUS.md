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
- [x] FilterTypesGrid (CMS)
- [ ] ContentWithImages
- Note: Subpages `/heavy-duty/air|fuel|cabin|oil` are static; CMS migration pending

Automotive (/automotive)
- [~] SearchHero (static)
- [ ] CMS sections (ContentWithImages / Products)

Industries (/industries, /industries/agriculture)
- [x] /industries: FullScreenHero + IndustriesList (CMS)
- [ ] /industries/[slug]: detail pages and content
- Note: Legacy `/industry` removed in favor of `/industries`

Resources (/resources, /resources/heavy-duty-catalog)
- [~] CompactHero + UI (static)
- [ ] Resource items (entity + CMS)
- Note: Filtering, gallery/list toggle, pagination done in UI; backend pending

Newsroom (/newsroom, /newsroom/heavy-duty-filter-launch)
- [~] CompactHero + list UI (static)
- [ ] News list (NewsArticle entity)
- [ ] News detail (CMS)
- Note: One static detail page exists

Warranty (/warranty)
- [~] MagnussonMossAct (static)
- [~] QualityAssurance (static)
- [~] LimitedWarrantyDetails (static)
- [~] WarrantyContact (static)
- [ ] WarrantyPromise
- [ ] WarrantyClaimProcess (component exists; not on page)
- Note: Page currently static; CMS migration pending

Contact Us (/contact-us)
- [x] ContactOptions (CMS)
- [x] Content blocks (CMS)
- [x] contact_hero
- [x] contact_options
- [x] contact_form_info
- Note: Uses `contact_hero`, `contact_options`, `contact_form_info` sections

Filters and Catalog (/filters/[code], /catalog)
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
