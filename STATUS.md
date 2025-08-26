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

2) Admin UI
- [x] /admin/pages: list, edit
- [x] Page editor: SEO (title, description, og)
- [x] Sections on page: list with order (up/down), edit per type
- [x] Section editors: hero_full, featured_products, why_choose, quick_search, industries, about_news
- [x] Hide from robots (already) and no links in menu (already)

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

Heavy Duty (/heavy-duty and subpages /air|cabin|fuel|oil)
- [ ] PageHero
- [ ] FilterTypesGrid / Products
- [ ] ContentWithImages

Automotive (/automotive)
- [ ] PageHero
- [ ] ContentWithImages / Products

Industries (/industries, /industries/agriculture)
- [ ] IndustriesList / PageHero
- [ ] ContentWithImages

Resources (/resources, /resources/heavy-duty-catalog)
- [ ] PageHero
- [ ] Resource items (separate entity)

Newsroom (/newsroom, /newsroom/heavy-duty-filter-launch)
- [ ] News list (NewsArticle entity)
- [ ] News detail

Warranty (/warranty)
- [ ] WarrantyPromise
- [ ] LimitedWarrantyDetails
- [ ] MagnussonMossAct
- [ ] WarrantyClaimProcess
- [ ] WarrantyContact

Contact Us (/contact-us)
- [ ] ContactOptions
- [ ] Content blocks

Filters and Catalog (/filters/[code], /catalog)
- [ ] Data models for products/filters
- [ ] Server filtering/search, Pagination component reuse

4) Shared content
- [ ] NavigationItem (Header)
- [ ] FooterLink groups (Footer)
- [ ] Global SEO defaults (already in layout; expose in admin)

5) Publishing
- [ ] Draft/Published flags and visibility
- [ ] Revalidation hooks for ISR (later)

Risks/notes
- JSONB data validated at runtime; add Zod schemas per SectionType.
- Gradual migration: pages can remain mixed (static + CMS) until complete.


### Progress — 2025-08-25
- [x] Generic роут `/(site)/[slug]` для верхнеуровневых страниц из CMS + метаданные
- [x] Админка: модальное создание страниц, редактирование slug, удаление страниц
- [x] Защита от удаления core‑страниц (`RESERVED_SLUGS`, отключение кнопки в UI)
- [x] About Us: добавлены `manufacturing_facilities`, `our_company` (без `image`), `stats_band`, `awards_carousel`
- [x] Contact Us: `contact_hero`, `contact_options`, `contact_form_info`; сетка и контент синхронизированы с исходной статикой
- [x] Сидинг и AddSectionForm: актуализированы типы; убраны legacy‑контактные блоки при наличии `contact_form_info`
- [x] Industries: раздел `/admin/industries`, карточка лендинга `/industries`; секции `industries_list` и `industry_meta`; динамический список отраслей из БД
- [x] Industry pages: добавлены секции `compact_search_hero`, `simple_search`, `popular_filters`, `related_filters`; рендер и формы в админке
- [x] API: единый catch‑all `/api/admin/pages/[...slug]` для CRUD секций и reorder; удалены конфликтующие вложенные маршруты
- [x] Изображения: разрешён `http://localhost:3000` для `next/image` в dev

