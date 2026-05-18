# CLAUDE.md - Quick Reference for AI Assistants

> Этот документ создан для быстрой ориентации в проекте Sure Filter US.
> Последнее обновление: 29 апреля 2026

---

## Обзор проекта

**Sure Filter US** — корпоративный сайт производителя автомобильных фильтров с полнофункциональной CMS системой.

**Технологический стек:**
- **Framework:** Next.js 15.5.x (App Router, Server Components)
- **React:** 19.0.0
- **Styling:** Tailwind CSS 4.1.11
- **Database:** PostgreSQL + Prisma ORM 7.4.2 (с pg adapter)
- **Storage:** AWS S3 + CloudFront CDN
- **Hosting:** AWS App Runner + EC2 (newsletters server)
- **Email:** Amazon SES (news.surefilter.us — newsletters, mail.surefilter.us — transactional)
- **Caching:** ISR + CloudFront (on-demand invalidation via `@aws-sdk/client-cloudfront`)
- **Auth:** NextAuth.js (credentials)
- **Analytics:** Google Analytics 4 + Google Tag Manager (`@next/third-parties/google`)
- **Cookie Consent:** Termly CMP (dynamic script via SiteSettings)

---

## Структура проекта

```
surefilter-us/
├── surefilter-ui/              # Next.js приложение
│   ├── src/
│   │   ├── app/                # App Router страницы
│   │   │   ├── (site)/         # Публичные CMS страницы
│   │   │   ├── admin/          # Админ-панель
│   │   │   ├── api/            # API routes
│   │   │   ├── catalog/        # Каталог продуктов
│   │   │   ├── products/       # Страницы продуктов
│   │   │   ├── newsroom/       # Новости и события
│   │   │   └── resources/      # Ресурсы и документы
│   │   ├── components/
│   │   │   ├── admin/          # Компоненты админки
│   │   │   ├── forms/          # Формы (DynamicForm, FormBuilder)
│   │   │   ├── layout/         # Header, Footer
│   │   │   ├── sections/       # CMS секции (50+ компонентов)
│   │   │   ├── seo/            # SEO компонент
│   │   │   └── ui/             # UI примитивы (Button, Card, etc.)
│   │   ├── cms/                # CMS утилиты и типы
│   │   ├── lib/                # Утилиты
│   │   │   ├── prisma.ts       # Prisma client (+ build-time stub)
│   │   │   ├── revalidate.ts   # ISR + CloudFront cache invalidation
│   │   │   ├── assets.ts       # CDN URL helpers
│   │   │   ├── auth.ts         # NextAuth config
│   │   │   ├── analytics.ts    # GA4 event tracking helpers
│   │   │   ├── site-settings.ts # Settings + cache + helpers
│   │   │   └── catalog-parser.ts # HTML парсинг каталога
│   │   └── generated/prisma/   # Сгенерированный Prisma client
│   ├── prisma/
│   │   ├── schema.prisma       # Схема БД
│   │   └── migrations/         # Миграции
│   └── prisma.config.ts        # Prisma 7 config (в корне проекта!)
├── infra/                      # OpenTofu инфраструктура (AWS)
│   └── envs/prod/              # 18 .tf файлов (App Runner, CloudFront, RDS, SES, EC2, Route53, etc.)
├── docker/                     # Docker Compose для локальной разработки
├── scripts/                    # Вспомогательные скрипты
└── docs/                       # Документация
```

---

## Ключевые модели БД (Prisma)

### CMS
- `Page` — страницы сайта (slug, title, sections)
- `Section` — секции страниц (type enum, data JSON)
- `PageSection` — связь page-section с позицией
- `SharedSection` — переиспользуемые секции
- `SiteSettings` — глобальные настройки (header, footer, analytics, SEO, redirects, default meta tags, logoUrl, formNotificationFromEmail, newsroomHeroColor)

### Каталог продуктов
- `Product` — продукты (code, brand, filterType, manufacturerCatalogUrl)
- `Brand` — бренды (Sure Filter, etc.)
- `ProductCategory` — категории (Heavy Duty, Automotive)
- `ProductFilterType` — типы фильтров (Air, Oil, Fuel, Cabin)
- `SpecParameter` / `ProductSpecValue` — спецификации
- `ProductMedia` / `MediaAsset` — изображения

### Контент
- `NewsArticle` / `NewsCategory` — новости и события
- `Resource` / `ResourceCategory` — ресурсы (каталоги, документы); `ResourceCategory` self-referencing через `parentId` (max depth = 2 в app-layer) + поле `image` для subcategory image-card
- `Form` / `FormSubmission` — универсальные формы

### Popup Banners (Marketing)
- `Banner` — попап-банеры (type: LEAD_CAPTURE | CTA, layout, layoutConfig Json для layout-specific настроек, targeting, triggers, dismiss strategy, schedule, denormalized counters)
- `BannerCampaign` — кампании (группировка банеров с aggregate stats и общим notifyEmail fallback)
- `BannerImpression` — каждый показ (full DB logging для analytics dashboards)
- `BannerClick` — каждый клик по CTA
- `BannerSubmission` — захваченные email-ы для LEAD_CAPTURE

### Администрирование
- `User` — пользователи админки
- `AdminLog` — логи действий

---

## Типы секций CMS (SectionType enum)

**Hero:**
- `hero_full`, `hero_carousel`, `hero_compact`
- `page_hero`, `page_hero_reverse`, `single_image_hero`
- `search_hero`, `compact_search_hero`, `simple_search`

**Продукты:**
- `featured_products`, `featured_products_catalog`
- `popular_filters`, `popular_filters_catalog`
- `products`, `product_gallery`, `product_specs`

**Фильтры:**
- `filter_types_grid`, `filter_types_image_grid`, `related_filters`

**Контент:**
- `about_with_stats`, `about_news`, `content_with_images`
- `why_choose`, `quality_assurance`
- `industries`, `industries_list`, `industry_showcase`
- `our_company`, `manufacturing_facilities`, `stats_band`, `awards_carousel`, `awards_gallery`

**Контакты:**
- `contact_hero`, `contact_options`, `contact_form`, `contact_form_info`

**Гарантия:**
- `limited_warranty_details`, `magnusson_moss_act`, `warranty_contact`, etc.

**Generic Heroes:**
- `color_hero` — compact hero с solid background color (без картинки), настраиваемый цвет

**Служебные:**
- `form_embed`, `sidebar_widget`, `listing_card_meta`

---

## Ключевые URL

### Публичные
- `/` — главная
- `/about-us`, `/contact-us`, `/warranty`
- `/heavy-duty`, `/heavy-duty/[type]`, `/automotive`
- `/industries`, `/industries/[slug]`
- `/catalog` — каталог продуктов
- `/products/[code]` — страница продукта (ISR 24h)
- `/newsroom`, `/newsroom/[slug]`
- `/resources` — drill-down вход: показывает union первого уровня (subcategories where they exist + ресурсы прямо в flat-категориях)
- `/resources/[category]` — top-level категория: если есть children → grid подкатегорий, иначе flat-список ресурсов
- `/resources/[category]/[...path]` — catch-all с resolver: `[subcategory]` → ресурсы подкатегории, `[slug]` → деталь ресурса в flat-категории, `[subcategory]/[slug]` → деталь ресурса в подкатегории

### SEO/GEO (динамические)
- `/robots.txt` — динамический, из `src/app/robots.ts` (SiteSettings.seoRobotsBlock)
- `/sitemap.xml` — динамический, из `src/app/sitemap.ts` (все страницы, продукты, новости, ресурсы)
- `/llms.txt` — для LLM-краулеров, из `src/app/llms.txt/route.ts` (llmstxt.org формат)
- `/llms-full.txt` — расширенная версия с деталями продуктов и новостей

### Админка (`/admin/*`)
- `/admin/pages` — управление страницами
- `/admin/products` — каталог продуктов (+ brands, categories, spec-parameters, product-filter-types)
- `/admin/news` — новости
- `/admin/resources` — ресурсы
- `/admin/forms` — конструктор форм
- `/admin/banners` — попап-банеры (list/CRUD/duplicate/stats/submissions)
- `/admin/banner-campaigns` — кампании банеров (с aggregate stats)
- `/admin/banner-submissions` — универсальный view всех лидов с CSV export
- `/admin/files` — файл-менеджер (S3)
- `/admin/access` — **API & Access** (MCP server): personal access tokens, scopes reference, usage dashboard, server settings + connection guide (см. раздел «MCP server» ниже)
- `/admin/settings/site` — настройки сайта (Header, Footer, Special Pages, Redirects)
- `/admin/users` — пользователи (список, создание, редактирование)
- `/admin/logs` — логи действий

---

## Важные API Endpoints

### Публичные
- `GET /api/health` — health check
- `GET /api/warm-up` — post-deploy ISR warm-up (localhost only)
- `POST /api/forms/[slug]/submit` — отправка формы
- `GET /api/news`, `GET /api/resources`
- `GET /api/banners/active` — активные попап-банеры (1-min server cache)
- `POST /api/banners/[id]/impression` — регистрация показа (sendBeacon-friendly)
- `POST /api/banners/[id]/click` — регистрация клика по CTA-банеру
- `POST /api/banners/[id]/submit` — лид от LEAD_CAPTURE-банера (rate-limited)
- `GET /robots.txt` — динамический robots.txt
- `GET /sitemap.xml` — динамический sitemap
- `GET /api/redirects` — активные редиректы (legacy, не используется — логика в catch-all page)
- `GET /llms.txt`, `GET /llms-full.txt` — LLM контент

### Админские (`/api/admin/*`)
- CRUD для pages, sections, products, news, resources, forms
- Секции/страницы: `invalidatePages()` сбрасывает ISR (`revalidatePath` layout) + CloudFront кэш только для затронутых страниц
- Site settings: полный сброс всех кешей (ISR `revalidatePath('/', 'layout')` + CloudFront `/*`) — т.к. header/footer/meta влияют на все страницы
- `POST /api/admin/cache` — ручной сброс всех кешей (кнопка Clear Cache в Settings)
- `/api/admin/file-manager/*` — работа с S3
- `/api/admin/site-settings` — глобальные настройки
- `GET /api/admin/config/tinymce` — TinyMCE API key (runtime из SSM, admin-only)
- `/api/admin/banners` (+`[id]`, `[id]/duplicate`, `[id]/stats`) — CRUD банеров. Мутации сбрасывают `clearBannersCache()`
- `/api/admin/banner-campaigns` (+`[id]`, `[id]/stats`) — CRUD кампаний с aggregate stats (raw SQL DATE_TRUNC timeseries)
- `/api/admin/banner-submissions` (+`[id]`, `export`, `[id]/retry-email`) — лиды банеров
- `/api/admin/access/tokens` (+`[id]`, `[id]/regenerate`) — Personal Access Tokens (MCP). POST возвращает plaintext один раз; больше нигде не хранится.
- `/api/admin/access/settings` — GET/PUT глобальных MCP-настроек (хранятся в `SiteSettings.mcp` Json)
- `/api/admin/access/usage` — агрегаты AdminLog `action=MCP_TOOL_CALL` за 30 дней (totals + top tools + top tokens)

---

## AWS Инфраструктура (OpenTofu)

### Домены и DNS
- **surefilter.us** — основной домен (Route53 → CloudFront → App Runner)
- **www.surefilter.us** — alias на основной CloudFront, **301 → surefilter.us** (CF Function `set_x_forwarded_host`, edge-redirect до кэша)
- **new.surefilter.us** — legacy alias (делегированная зона, тоже → CloudFront), **301 → surefilter.us** (CF Function)
- **assets.surefilter.us** — CDN для файлов (отдельный CloudFront → S3 `surefilter-files-prod`)
- **newsletters.surefilter.us** — EC2 сервер (Elastic IP)
- **news.surefilter.us** — SES sending domain for newsletters (DKIM, custom MAIL FROM)
- **mail.surefilter.us** — SES sending domain for newsletters (DKIM, custom MAIL FROM, SNS bounce/complaint)
- **notify.surefilter.us** — SES sending domain for transactional emails (DKIM, custom MAIL FROM, suppression only)
- **link.news.surefilter.us** — SES tracking domain for newsletters (HTTPS через CloudFront → awstrack.me)
- **link.mail.surefilter.us** — SES tracking domain for newsletters (HTTPS через CloudFront → awstrack.me)
- **link.notify.surefilter.us** — SES tracking domain for transactional (HTTPS через CloudFront → awstrack.me)
- **link.surefilter.net** — Apollo.io tracking domain (CNAME → aploconnect.com)
- **surefilter.eu / .co / .net** (+www) — 301 redirect → surefilter.us (CloudFront Function, edge redirect, path + query preserved)

### Ключевые сервисы
- **App Runner** `surefilter-prod` — 1 vCPU / 2 GB, порт 3000, образ из ECR; версия образа в [infra/envs/prod/image-versions.tf](infra/envs/prod/image-versions.tf) (`app_runner_image_version`, default `v1.2.0`)
- **EC2** `surefilter-prod` — t4g.medium (ARM64), Ubuntu 24.04 LTS, Elastic IP, `newsletters.surefilter.us`
- **RDS** PostgreSQL 15 — `db.t4g.micro`, 20 GB, публичный доступ (временно)
- **CloudFront** — 6 дистрибуций: site (surefilter.us), assets (assets.surefilter.us), redirect (surefilter.eu/.co/.net + www + news/mail/notify.surefilter.us), SES newsletter tracking (link.news.surefilter.us), SES mail tracking (link.mail.surefilter.us), SES notify tracking (link.notify.surefilter.us)
- **S3** — 3 бакета: `surefilter-static-prod`, `surefilter-files-prod`, `surefilter-db-backups-prod`
- **SES** — 3 domain identities:
  - `news.surefilter.us` — newsletters (listmonk): DKIM 2048-bit, custom MAIL FROM (`bounce.news.surefilter.us`), dedicated IP pool `surefilter-newsletter` (managed), config set `surefilter-newsletter` с VDM, suppression list, SNS notifications, tracking `link.news.surefilter.us`
  - `mail.surefilter.us` — newsletters (listmonk): DKIM 2048-bit, custom MAIL FROM (`bounce.mail.surefilter.us`), dedicated IP pool `surefilter-newsletter` (shared), config set `surefilter-mail` с VDM, suppression list, SNS notifications, tracking `link.mail.surefilter.us`
  - `notify.surefilter.us` — transactional (App Runner): DKIM 2048-bit, custom MAIL FROM (`bounce.notify.surefilter.us`), dedicated IP pool `surefilter-transactional` (managed), config set `surefilter-transactional` с VDM, suppression list (без SNS), tracking `link.notify.surefilter.us`
- **ECR** `surefilter` — Docker registry
- **SSM Parameter Store** — DATABASE_URL, NEXTAUTH_SECRET, ORIGIN_SECRET, TINYMCE_API_KEY, CLOUDFRONT_DISTRIBUTION_ID и др.

### Email (SES) — news.surefilter.us & mail.surefilter.us
- **DKIM**: Easy DKIM 2048-bit (3 CNAME записи, auto-rotation) — оба домена
- **DMARC**: наследуется от `_dmarc.surefilter.us` (CNAME → hosteddmarc.dmarc-dns.com) — оба домена

**news.surefilter.us** (newsletters — listmonk):
- **SPF**: custom MAIL FROM `bounce.news.surefilter.us` → `v=spf1 include:amazonses.com -all`
- **Config Set**: `surefilter-newsletter` — TLS required, dedicated IP pool `surefilter-newsletter` (managed), VDM enabled, suppression (BOUNCE+COMPLAINT), Auto Validation (HIGH, включён через консоль)
- **Tracking**: `link.news.surefilter.us` → CloudFront → `r.us-east-1.awstrack.me` (HTTPS)
- **Bounce handling**: identity-level notifications → SNS → HTTPS → `https://newsletters.surefilter.us/webhooks/service/ses`
- **SNS Topic**: `surefilter-ses-notifications` (unified bounce + complaint → listmonk webhook)
- **SMTP IAM user**: `surefilter-ses-smtp`, credentials: `tofu output ses_smtp_user` / `tofu output -raw ses_smtp_password`
- **SMTP endpoint**: `email-smtp.us-east-1.amazonaws.com:587` (STARTTLS)

**mail.surefilter.us** (newsletters — listmonk):
- **SPF**: custom MAIL FROM `bounce.mail.surefilter.us` → `v=spf1 include:amazonses.com -all`
- **Config Set**: `surefilter-mail` — TLS required, dedicated IP pool `surefilter-newsletter` (shared with news), VDM enabled, suppression (BOUNCE+COMPLAINT)
- **Tracking**: `link.mail.surefilter.us` → CloudFront → `r.us-east-1.awstrack.me` (HTTPS)
- **Bounce handling**: identity-level notifications → SNS → listmonk webhook (same topic as news)

**notify.surefilter.us** (transactional — App Runner via AWS SDK):
- **SPF**: custom MAIL FROM `bounce.notify.surefilter.us` → `v=spf1 include:amazonses.com -all`
- **Config Set**: `surefilter-transactional` — TLS required, dedicated IP pool `surefilter-transactional` (managed), VDM enabled, suppression (BOUNCE+COMPLAINT)
- **Tracking**: `link.notify.surefilter.us` → CloudFront → `r.us-east-1.awstrack.me` (HTTPS)
- **Bounce handling**: suppression list only (без SNS)
- **FROM**: `noreply@notify.surefilter.us` (default, настраивается в SiteSettings)
- **Auth**: App Runner IAM role (`ses:SendEmail`, `ses:SendRawEmail`)

### Newsletter Server (listmonk)
- **EC2**: `newsletters.surefilter.us` (t4g.medium, Ubuntu 24.04 LTS)
- **App**: [listmonk](https://listmonk.app/) в Docker (`/opt/listmonk/`)
- **Nginx**: reverse proxy HTTPS → `127.0.0.1:9000`
- **SSL**: Let's Encrypt (certbot, auto-renewal)
- **Setup script**: `scripts/setup-listmonk.sh`
- **Credentials**: `/opt/listmonk/.env` (admin user + DB password, auto-generated)
- **Backup**: AWS Backup — daily (7 дней retention) + weekly (30 дней), vault `surefilter-ec2-backup`
- **ВАЖНО**: EC2 имеет `lifecycle { ignore_changes = [ami] }` — НЕ пересоздавать инстанс, данные на root volume

---

## Переменные окружения

```env
# Обязательные
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."

# AWS/S3
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="surefilter-files-prod"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# CDN / Caching
NEXT_PUBLIC_CDN_URL="https://assets.surefilter.us"
NEXT_PUBLIC_SITE_URL="https://surefilter.us"
CLOUDFRONT_DISTRIBUTION_ID="..."   # For on-demand cache invalidation

# TinyMCE (для редактора контента в админке)
TINYMCE_API_KEY="..."              # Runtime secret, загружается через /api/admin/config/tinymce

# Security
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="..."  # Stable key for Server Actions encryption across deploys

# Build-time only (Dockerfile)
NEXT_BUILD_SKIP_DB="1"             # Skip DB during Docker build
```

---

## Команды разработки

```bash
cd surefilter-ui

# Разработка
npm run dev          # Turbopack dev server

# Build
npm run build        # Production build
npm start            # Production server

# База данных
npx prisma generate  # Генерация client
npx prisma migrate dev --name migration_name
npx prisma studio    # GUI для БД

# Сидинг
npm run seed:content        # Без перезаписи
npm run seed:content:force  # С перезаписью
```

### Локальная админка

| | |
|---|---|
| **URL** | `http://localhost:3000/admin` |
| **Email** | `admin@spodarets.com` |
| **Password** | `Data1986` |

> Создаётся через `npm run seed:content` (env: `ADMIN_EMAIL`, `ADMIN_PASSWORD`)

---

## Паттерны и соглашения

### Компоненты
- **Server Components** — по умолчанию для страниц и секций
- **Client Components** — только при необходимости интерактивности (`'use client'`)
- **CMS компоненты** — суффикс `Cms` (например, `HeroCms`, `WhyChooseCms`)

### Админ-панель (лайаут)
- **AdminClientLayout** (`admin/AdminClientLayout.tsx`) — клиентский layout: SessionProvider, хедер с навигацией + UserMenu (email + Sign Out), `<main>` с `max-w-7xl mx-auto`, `<AdminFooter />` в конце
- **AdminFooter** (`components/admin/AdminFooter.tsx`) — copyright + текущая версия (`process.env.NEXT_PUBLIC_APP_VERSION || 'dev'`). Версия запекается в bundle на `docker build` через `ARG IMAGE_VERSION` (см. [Dockerfile](surefilter-ui/Dockerfile)) — позволяет на глаз проверить какой реально digest бежит на проде, не залезая в ECR
- **AdminContainer** (`components/admin/AdminContainer.tsx`) — серверный wrapper: `<div className="p-6">`
- **Обёртка страниц**: `<div className="p-6">` (или AdminContainer)
- **Заголовки**: `<h1 className="text-2xl font-bold text-gray-900 mb-6">`
- **Loading states**: `<div className="p-6"><div className="text-center py-12"><spinner /></div></div>`
- **Формы/edit страницы**: `<div className="p-6">` с inner `max-w-2xl` или `max-w-4xl`
- **Breadcrumbs отключены** — FolderBreadcrumbs только в файл-менеджере

### Header Navigation
- **Dropdown поддержка**: пункты меню могут иметь `children` (вложенные ссылки)
- **Desktop** (`HeaderNav.tsx`): hover-dropdown с 150ms задержкой закрытия, CSS-анимации opacity/translate
- **Mobile** (`MobileMenu.tsx`): accordion expand/collapse, Browse Catalog CTA в конце
- **Данные**: `NavigationItem` с optional `children: NavigationChildItem[]` в JSON поле `SiteSettings.headerNavigation`
- **Управление**: `/admin/settings/site` → вкладка Header Navigation → добавление sub-items к пунктам

### Стили
- Утилита `cn()` из `lib/utils.ts` для объединения Tailwind классов
- Цвета: `sure-blue`, `sure-orange`, `sure-red`
- Контейнер: `max-w-7xl mx-auto px-4`

### Изображения
- Компонент `ManagedImage` — с shimmer placeholder (без retry/error boundary — TODO)
- Утилита `getAssetUrl()` — конвертирует S3 path в CDN URL
- Next.js `<Image>` везде вместо `<img>`
- **Админ-формы**: любое поле Image URL / Image Path обязательно должно иметь кнопку **Browse** рядом с input, которая открывает `MediaPickerModal` для выбора файла из S3. Паттерн: `<div className="flex gap-2"><input .../><button onClick={() => setShowPicker(true)}>Browse</button></div>` + `<MediaPickerModal isOpen={...} onSelect={...} onClose={...} />`
- **MediaPickerModal** возвращает S3 key (относительный путь, например `images/logo.png`), НЕ полный CDN URL — `ManagedImage`/`getAssetUrl()` конвертируют в CDN URL при рендере
- **Logo**: URL хранится в `SiteSettings.logoUrl` (БД), не хардкод. Header загружает через `getLogoUrl()`, передаёт в `<Logo src={logoUrl} />`

### API
- Валидация через Zod
- Ответы: `{ data }` или `{ error, message }`
- Логирование через `logAdminAction()`
- **Auth**: `requireAdmin()` + `isUnauthorized()` из `src/lib/require-admin.ts` — единый хелпер для всех admin API routes
- **Rate limiting**: `src/lib/rate-limiter.ts` — in-memory, IP-based (formSubmitLimiter, passwordLimiter, publicApiLimiter)
- **SSRF prevention**: `src/lib/url-validator.ts` — domain whitelist + private IP blocking для proxy/fetch endpoints
- **HTML sanitization**: `src/lib/sanitize.ts` — sanitize-html для всех `dangerouslySetInnerHTML` в публичных страницах
- **ReDoS protection**: `safe-regex2` проверяет пользовательские regex-паттерны перед исполнением
- **Path traversal**: folder operations (create/delete/rename) нормализуют и валидируют пути
- **Security headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy в `next.config.ts`
- **CSP `worker-src`**: `'self' blob: https://unpkg.com` — для PDF.js worker (react-pdf)
- **CSP `script-src`**: включает `https://unpkg.com` — PDF.js worker fallback загружается как script
- **server-only**: импорт `'server-only'` в auth.ts, s3.ts, revalidate.ts, webhook.ts, email.ts, site-settings.ts, require-admin.ts, rate-limiter.ts, url-validator.ts

### Analytics
- GA4 и GTM ID хранятся только в БД (SiteSettings), не в env
- `@next/third-parties/google` — `GoogleAnalytics` + `GoogleTagManager` в root layout
- Применяются только к публичным страницам (admin layout изолирован)
- `src/lib/analytics.ts` — клиентские хелперы (`trackFormSubmit`, `trackButtonClick`, etc.)

### Cookie Consent (Termly)
- Termly Website UUID хранится в БД (`SiteSettings.termlyWebsiteUUID`), настраивается в админке Settings → Security
- `src/components/TermlyCMP.tsx` — клиентский компонент по официальной документации Termly для Next.js 15/16
- Загружает `app.termly.io/resource-blocker/{UUID}` без `autoBlock` (autoBlock не работает в Next.js — скрипт не может быть первым из-за bootstrap скриптов фреймворка)
- Для CCPA autoBlock не требуется — закон требует только opt-out возможность, не предварительную блокировку скриптов
- Подключён в root layout внутри `<Suspense>`, рендерится только если UUID задан
- Скрипт загружается один раз при монтировании, `initialize()` вызывается при SPA-навигации (пересканирует скрипты, НЕ показывает баннер повторно — consent хранится в cookies)
- CSP `connect-src` ОБЯЗАТЕЛЬНО должен включать `https://*.termly.io` (не только `app.termly.io`) — consent API на `us.consent.api.termly.io`
- Ссылка "Consent Preferences" в Footer (класс `termly-display-preferences`) — появляется только при включённом Termly

### Email-уведомления о заполнении форм
- **Механизм**: AWS SES v2 SDK (`@aws-sdk/client-sesv2`) — отправка через IAM role App Runner (без ключей/паролей)
- **SES identity**: `notify.surefilter.us` (transactional), config set `surefilter-transactional`
- **From-адрес**: настраивается в `/admin/settings/site` → Security → Email Notifications (`SiteSettings.formNotificationFromEmail`). Default: `noreply@notify.surefilter.us`
- **Получатели**: поле `notifyEmail` в конструкторе форм (`/admin/forms`) — поддержка нескольких email через запятую
- **Код**: `src/lib/email.ts` — `sendFormNotificationEmail()`, `sendFormNotificationEmailAsync()` (fire-and-forget), `retryEmail()`
- **Шаблон письма**: HTML-письмо с брендированным хедером (Sure Filter), таблицей заполненных полей, метаданными (IP, страница), plain-text fallback
- **Тема**: `SURE FILTER — New "Form Name" Form Submission`
- **Retry**: ручной retry из админки (`/admin/forms/[id]/submissions` → кнопка Retry Email), API: `POST /api/admin/form-submissions/[id]/retry-email`
- **Статус**: `emailSent` + `emailError` в `FormSubmission` — отображаются в таблице сабмитов и модале деталей
- **IAM**: `ses:SendEmail` + `ses:SendRawEmail` на `Resource: "*"` (нужно для identity + configuration-set)
- **Валидация email**: парсинг запятых + regex-валидация каждого адреса в `parseEmails()` (не в Zod — Zod принимает любую строку)

### Валидация публичных форм
- **JS-only**: `<form noValidate>` — браузерные тултипы отключены, вся валидация через JS
- **Per-field ошибки**: красная рамка (`border-red-500`) + текст ошибки под полем + scroll к первой ошибке
- **Phone input**: фильтрация ввода при наборе (только цифры, +, скобки, дефис, пробел), regex `/^\+?[\d\s\-\(\)]{7,20}$/` при submit
- **Server → Client mapping**: сервер возвращает `fieldErrors: [{fieldId, message}]`, клиент подсвечивает конкретные поля
- **Единый стиль**: `FieldWrapper`, `Label`, `inputClass()` — общие компоненты для всех типов полей в `FormField.tsx`

### Popup Banner System
Собственная система попап-банеров (вместо HelloBar/SaaS) для лидогенерации и CTA-кампаний.

**Типы банеров**:
- `LEAD_CAPTURE` — image + title + body + email input + submit (захват лидов)
- `CTA` — image + title + body + кнопка с переходом на URL

**Архитектура**:
- **Server cache**: `src/lib/banners.ts` — `getActiveBanners()` с 1-минутным in-memory кешем, `clearBannersCache()` сбрасывается при CRUD-мутациях. Работает зеркально `getSiteSettings()`.
- **Client fetch**: `<BannerHost />` в root layout fetches `/api/banners/active` — НЕ через layout ISR (24h задержка не подходит для banner pause), а через client-side fetch с 1-min server cache. Mounts post-hydration, не блокирует first paint.
- **Modal**: native `<dialog>` element + `showModal()` (focus trap, Escape, `::backdrop` бесплатно). Без Headless UI, без портала.

**Layout Registry** (extensible design gallery):
- Layout — это React-компонент в `src/components/banners/layouts/`, зарегистрированный в `index.ts`
- Стартовые: `ClassicCentered`, `SideImage`, `MinimalText`, `ProductShowcase` (все поддерживают LEAD_CAPTURE + CTA)
- SVG-превью: `public/images/banner-layouts/<id>.svg`
- **Чтобы добавить новый layout**: создать компонент + meta export, добавить в registry в `index.ts`, положить SVG. Если layout требует доп. настройки — кладёт их в `Banner.layoutConfig` (Json), валидация через свою Zod-схему. Ноль миграций БД для базовых layouts
- `banner.layout` — string (не enum) для расширяемости. Fallback на `DEFAULT_LAYOUT_ID` при неизвестном значении
- **`Banner.layoutConfig` (Json?)** — layout-specific конфиг. Каждый layout владеет своей TS-типизацией и Zod-схемой; API валидирует условно по `layout`. Public API (`getActiveBanners`) может обогащать config доп. данными (например, `product_showcase` подтягивает code/imageUrl продуктов одним запросом)
- **Картинки в layouts**: используется `ManagedImage` ([src/components/ui/ManagedImage.tsx](surefilter-ui/src/components/ui/ManagedImage.tsx)) с `fill` + `sizes` — авто-конвертация S3 → CDN, WebP/AVIF, shimmer placeholder (project-wide convention)

**Product Showcase layout** (B2B catalog promo):
- Header-strip: hero image с gradient-overlay + split-color headline (orange accent word + light rest) + subtitle
- 2 product cards (responsive grid, stack <640px): SKU plate (доминантный элемент), image, описание, application/fits, cross-refs table, MOQ/CONT, price block. SPECIAL ribbon → красный price-цвет
- Footer: stock+brands text слева; CTA-кнопка ИЛИ email form справа (выбор через `banner.type`)
- Конфиг в `layoutConfig` ([product-showcase-schema.ts](surefilter-ui/src/components/banners/layouts/product-showcase-schema.ts)): overlayHeadlineAccent/Rest/Subtitle, products[] (per-item: description, applicationText, crossRefs[], moq, cont, priceText, pricePerCaseText, specialBadge), 5 visibility toggles, footerStockText, footerBrandsText
- Цены/special/fits — per-banner overrides (Product модель не имеет price-поля, это сознательное решение — попап-промо короткоживущий)
- Admin tab «Products» в [BannerForm](surefilter-ui/src/components/admin/BannerForm.tsx) виден только при `layout === 'product_showcase'`. Product picker через `/api/admin/products?ids=...`
- Best practices May 2026: close 44×44px (WCAG 2.2 SC 2.5.8), mobile vertical stack, SKU как самый prominent элемент (research-based), microcopy «Get full catalog» / «See all filters», helper «No spam. Unsubscribe anytime.», без fake urgency (FTC enforcement)

**Targeting (на каких страницах показывать)**:
- `targetAllPages: true` — на всех + `excludeSlugs` (исключения)
- `targetAllPages: false` + `targetSlugs` — конкретные страницы
- Slugs: `"/"` для главной, `"newsroom"` без leading slash
- **Wildcard**: `products/*` matches `products/anything` (нативный glob → regex в `matchesPath`)
- Admin pages (`/admin/*`, `/login`) — захардкоженный bail в `BannerHost`

**Triggers**:
- `delayMs` — задержка показа после загрузки страницы (default 5000)
- `utmRules` (JSON) — `[{key, op: 'equals'|'contains'|'startsWith', value}]` — все правила должны совпасть (AND)
- `refererRules` (JSON) — `[{op, value}]` — любое правило подходит (OR)
- Client-side filter в `BannerHost` против `useSearchParams()` и `document.referrer`

**Dismiss strategy** (3 режима, выбор admin'ом):
- `SESSION` — sessionStorage, заново показывается при новой сессии
- `DAYS` — localStorage с TTL = `dismissTtlDays` (default 30)
- `FOREVER` — localStorage без срока
- Всегда: после dismiss в текущей сессии не показывается до закрытия вкладки
- **Cross-tab sync**: `storage` event listener — dismiss в одном табе закрывает попап во всех

**Multi-banner match resolution**:
- При множественном совпадении: sort `priority DESC, publishedAt DESC`, render первый. Один попап за раз — не спамим

**Tracking**:
- **Полное логирование в БД**: каждый показ → `BannerImpression`, каждый клик → `BannerClick`. Поля: pageUrl, pageSlug, utmParams, referer, sessionId, ipAddress, userAgent
- **Денормализованные счётчики** на `Banner`: `impressionCount`, `clickCount`, `submissionCount` — атомарный `increment` для быстрого admin-листа
- **GA4 events**: `banner_impression`, `banner_click`, `banner_lead_submit` с params `banner_slug`, `banner_type`, `banner_layout`, `campaign_id`
- **sendBeacon** для impression/click POSTs (переживает page unload)
- Rate limiters: `bannerImpressionLimiter` (200/min per IP+bannerId), `bannerSubmitLimiter` (5/hr per IP)

**Lead capture flow** (LEAD_CAPTURE banners):
- `POST /api/banners/[id]/submit` — Zod email validation, rate-limit, honeypot field, atomic transaction (BannerSubmission + counter increment), fire-and-forget email
- **Email**: `src/lib/banner-email.ts` — `sendBannerLeadNotificationEmail()` через AWS SES v2 (зеркально form-email pattern), фирменный HTML с UTM/page/referer/IP метаданными
- **From**: `getFormNotificationFromEmail()` (default `noreply@notify.surefilter.us`)
- **NotifyEmail fallback chain**: `banner.notifyEmail` → `campaign.notifyEmail` → пропуск отправки
- **Retry**: `POST /api/admin/banner-submissions/[id]/retry-email`

**Campaigns**:
- `BannerCampaign` группирует банеры (`Banner.campaignId`)
- `notifyEmail` на кампании — общий fallback для всех её банеров
- Aggregate stats: `/api/admin/banner-campaigns/[id]/stats` — totals + timeseries (raw SQL `DATE_TRUNC('day', ...)` GROUP BY)
- При удалении кампании — банеры остаются (`onDelete: SetNull`)

**Schedule** (`publishedAt` / `expiresAt`):
- Banner становится eligible при `publishedAt <= now AND (expiresAt > now OR null)`
- Проверка в `getActiveBanners()` — отфильтрованные банеры не доходят до клиента

**Admin UI**:
- `/admin/banners` — list с фильтрами (type/status/search), счётчики, кнопки Stats/Edit/Duplicate/Delete
- `/admin/banners/new` + `/admin/banners/[id]/edit` — `BannerForm` с tabs (Layout/Content/Targeting/Triggers/Schedule/Lead) + sticky `BannerLivePreview` справа
- `/admin/banners/[id]/stats` — charts impressions/clicks за 30 дней + breakdowns по pages/referers
- `/admin/banners/[id]/submissions` — лиды конкретного банера (только LEAD_CAPTURE)
- `/admin/banner-campaigns` + detail page с aggregate stats
- `/admin/banner-submissions` — универсальный view всех лидов с CSV-export
- `BannerLayoutGallery` — visual grid карточек с превью (выбор layout), `BannerTargetingEditor` (UTM/referer rule rows)
- Marketing menu в admin nav: Banners / New Banner / Campaigns / Submissions

**Animations**:
- View Transitions API (`document.startViewTransition()`) — нативный browser cross-fade при открытии
- `view-transition-name: sf-banner-modal` на `<dialog>` для плавного перехода
- `prefers-reduced-motion` — animation пропускается

**Spam protection**:
- Rate limiter (5 lead-submissions/hr per IP) + honeypot field `name="website"` (server отбрасывает submissions если поле непустое)
- Без CAPTCHA (соответствует паттерну существующего Form-системы)

**Cache invalidation на admin-CRUD**:
- `clearBannersCache()` сбрасывает 1-min in-memory cache
- `invalidatePages(['/'])` — ISR/CloudFront для сайта (на случай если будущая логика будет SSR-кешить banner data)

---

## MCP Server (Phase 0–5 готово — все фазы плана закрыты)

MCP-сервер (Model Context Protocol) даёт AI-агентам (Claude Desktop, Claude Code, внешние интеграции) доступ к админским операциям + публичный read-only для каталога/контента. План: `/Users/spodarets/.claude/plans/dazzling-whistling-walrus.md`.

**Phase 5 (готово, 2026-05-13) — hardening:**

- **Idempotency** ([MCPIdempotency](surefilter-ui/prisma/schema.prisma) Prisma + миграция `20260518042450_mcp_idempotency`): unique `(tokenId, key)`, TTL 24h, cron purge. Helpers — [lib/idempotency.ts](surefilter-ui/src/lib/idempotency.ts) (`readIdempotency` / `writeIdempotency` / `purgeExpiredIdempotency`) + `withIdempotency(ctx, key, tool, fn)` в [_write-helpers.ts](surefilter-ui/src/mcp/tools/_write-helpers.ts). Reference integrations: `content-create-news-category`, `content-create-resource-category`. Остальные tools принимают `idempotencyKey` но пока no-op (Zod description честно об этом говорит) — opt-in расширяется по мере роста usage.
- **Per-token rate-limit** ([lib/rate-limiter.ts](surefilter-ui/src/lib/rate-limiter.ts)): `getMcpAuthedLimiter(maxPerMinute)` factory — лимитер кэшируется по cap-значению; `verifyApiKey` читает `mcpSettings.rateLimitPerMinute` живьём, изменения в `/admin/access/settings` применяются на следующем запросе без рестарта.
- **SES email alerts** ([lib/mcp-alerts.ts](surefilter-ui/src/lib/mcp-alerts.ts)) через AWS SES v2 + `getFormNotificationFromEmail()`:
  - `alertAdminStarTokenCreated` — нотификация всем active ADMIN при выписке `admin:*` токена (hooks в `tokens/route.ts` и `tokens/[id]/regenerate/route.ts`).
  - `alertTokenRevokedNotSelf` — owner получает email если кто-то другой revoke его токен (hooks в `tokens/[id]/route.ts` DELETE и regenerate route).
- **Cron `/api/cron/mcp-cleanup`** ([route.ts](surefilter-ui/src/app/api/cron/mcp-cleanup/route.ts)) — GET/POST с auth по `CRON_SECRET` env или localhost-bypass. Делает: (a) soft-revoke ApiTokens с `expiresAt < now` и `revokedReason='EXPIRED'` + AdminLog audit, (b) флаг inactive tokens (>90d без `lastUsedAt`) в response для visibility, (c) `purgeExpiredIdempotency` для MCPIdempotency >24h. Возвращает JSON-summary.
- **Real usage dashboard** ([page.tsx](surefilter-ui/src/app/admin/access/usage/page.tsx) + [route.ts](surefilter-ui/src/app/api/admin/access/usage/route.ts)): inline SVG sparkline для calls-per-day (30 дней, fill-zero для пустых), status breakdown chips (ok/error/forbidden), top-tokens resolved через JOIN с ApiToken+User (name/prefix/owner email вместо raw cuid). Timeseries — raw SQL `DATE_TRUNC('day', "createdAt")` с GROUP BY.
- **Smoke 14/14**: idempotency replay (same response, no DB duplicate), cron auto-revoke + purge, usage timeseries SQL shape.

---



**Phase 4 (infra готова, 2026-05-13) — `mcp.surefilter.us` через CloudFront:**

- **Topology**: `mcp.surefilter.us` → отдельная CloudFront distribution → тот же App Runner origin что и основной сайт (общий `X-Origin-Secret`). НЕ отдельный сервис — единый Next.js процесс обслуживает оба домена; path-rewrite на edge.
- **CloudFront Function `surefilter-mcp-path-rewrite`** (viewer-request) — [cloudfront-mcp.tf](infra/envs/prod/cloudfront-mcp.tf): `/mcp[/*]` → `/api/mcp/mcp[/*]`, `/.well-known/oauth-protected-resource` passthrough; одновременно проставляет `x-forwarded-host` (origin шлёт App Runner host, нам нужен публичный для `withMcpAuth`'s WWW-Authenticate `resource_metadata`).
- **Dedicated policies**:
  - cache `mcp_no_cache` — TTL=0; cache-key включает Authorization + mcp-session-id + MCP-Protocol-Version + Accept (defense-in-depth, реально не кэшируется);
  - cache `mcp_metadata_cache` — 1h для `/.well-known/oauth-protected-resource`;
  - origin-request `mcp_origin` — whitelist MCP headers + cookies + query all.
- **Origin timeouts**: `origin_read_timeout=60` и `origin_keepalive_timeout=60` — под SSE streaming.
- **WAF (опционально)**: `var.enable_mcp_waf` (default `false`) — WAFv2 ACL с rate-based rule 2000 req/5min per IP. Toggle когда трафик появится.
- **ACM + Route53**: [acm-mcp.tf](infra/envs/prod/acm-mcp.tf) — отдельный cert для `mcp.surefilter.us` в us-east-1 (для CloudFront), DNS validation через основную zone; [route53-mcp.tf](infra/envs/prod/route53-mcp.tf) — A + AAAA alias.
- **Применение**: `tofu plan` показал 10 add / 0 change / 0 destroy — ничего существующего не трогает. `tofu apply` запускается вручную после ревью.
- **Подключение клиентов после apply**: меняется с `http://localhost:3000/api/mcp/mcp` на `https://mcp.surefilter.us/mcp`. Connection Guide в `/admin/access/settings` уже использует prod URL.

---



**Phase 3b (готово, 2026-05-13) — banners + CMS + forms + media + users + settings writes:** +30 write-tools, всего **80 live**.

- **Banners** ([banners-writes.ts](surefilter-ui/src/mcp/tools/banners-writes.ts)) — banners create/update/publish/delete/duplicate (5) + campaigns CRUD (3). Duplicate сбрасывает counters и status=DRAFT. После каждой мутации `clearBannersCache()` + `safeInvalidate(['/'])`.
- **CMS** ([cms-writes.ts](surefilter-ui/src/mcp/tools/cms-writes.ts)) — pages CRUD + publish (5; `cms:publish` отдельно от `cms:write`), reorder-page-sections с проверкой полного id-set'а, shared-sections CRUD (3).
- **Forms** ([forms-writes.ts](surefilter-ui/src/mcp/tools/forms-writes.ts)) — CRUD (3) с **SSRF-проверкой webhookUrl** через `validateWebhookUrl` из `lib/webhook.ts` (https only, нет private IP, нет localhost; функция экспортирована для переиспользования).
- **Media** ([media-writes.ts](surefilter-ui/src/mcp/tools/media-writes.ts)) — двухшаговая загрузка `presign-upload` → клиент PUT в S3 → `attach-metadata` (upsert MediaAsset); `update-asset-metadata` без re-upload; `delete-file` (S3 + DB row); `create-folder`/`delete-folder` (с auto-prune MediaAsset под prefix)/`rename-folder` (move objects + update s3Path + cdnUrl). **Path-traversal protection** `safeKey()` — отвергает `..`, ведущий `/`, backslash, null-byte.
- **Users** ([users-writes.ts](surefilter-ui/src/mcp/tools/users-writes.ts)) — CRUD (3). **Двойной gate**: users:write на токене **И** super-wildcard `admin:*` (одного users:write недостаточно). Last-active-ADMIN guard при demote/disable/delete. Пароли bcrypt-хэшируются перед записью; в audit писать в plaintext запрещено (`SECRET_KEYS` в `audit.ts`).
- **Admin** ([admin-writes.ts](surefilter-ui/src/mcp/tools/admin-writes.ts)) — `settings-update` (SiteSettings + MCP global; settings:write + admin:* + confirm:true; полная инвалидация `/`). `submissions-export-csv` (form OR banner submissions; PII, date-range + limit ≤10k; возвращает текстовый CSV).
- **Smoke 68/68** (3 токена: writer / usersOnly / admin:*) — SSRF rejection (http localhost / private IP / non-https), path-traversal (2 вариант), admin:* gate (settings + users), presign-URL flow, CSV header, dual audit подтверждён.

---



**Phase 3a (готово, 2026-05-13) — content + catalog writes + cache-purge:** +21 write-tools, всего **50 live**.

- **Content writes** ([content-writes.ts](surefilter-ui/src/mcp/tools/content-writes.ts)) — news-category CRUD (3) + news CRUD (4 — отдельный `content-publish-news` с scope `content:publish`) + resource-category CRUD с валидацией иерархии (3) + resource CRUD (4 — отдельный publish).
- **Catalog writes** ([catalog-writes.ts](surefilter-ui/src/mcp/tools/catalog-writes.ts)) — brand CRUD (3) + product CRUD (3). Update полностью заменяет коллекции (categoryAssignments / specValues / mediaItems / crossReferences) — mirror admin web UI семантики. Delete fail-on-FK.
- **Ops** ([operations.ts](surefilter-ui/src/mcp/tools/operations.ts)) — `cache-purge` (ISR + CloudFront invalidation на произвольные paths).
- **Common helpers** ([_write-helpers.ts](surefilter-ui/src/mcp/tools/_write-helpers.ts)):
  - `mutationCommonFields` — каждый write tool принимает `confirm?: boolean` + `idempotencyKey?: string` (последний — no-op в Phase 3, enforce в Phase 5).
  - `requireWriteScope` — writes никогда не имеют public-mode fallback; anon всегда `forbidden`.
  - `requireConfirm` — destructive ops (delete / publish / settings / users) без `confirm:true` возвращают сообщение «re-invoke with confirm:true».
  - `auditMutation` — пишет **dual entry**: CREATE/UPDATE/DELETE на entity (mirror /admin web flow → `/admin/logs` показывает MCP-операции единым feed'ом) + MCP_TOOL_CALL на токен (per-token attribution в `/admin/access/usage`).
  - `safeInvalidate(paths)` — try/catch wrapper над `invalidatePages`.
  - `resourcePublicPath` — строит `/resources/{parent?}/{cat}/{slug}` URL.
  - `validateResourceCategoryParent` — depth=2 + no-self-parent + no-move-with-children.
- **Cache invalidation per mutation**: news → `/newsroom` + slug; resource → `/resources` + parent/sub paths (через `resourcePublicPath`); product → `/` + `/products/{code}`. Delete и slug-change оба пути инвалидируют (старый + новый).
- **Smoke 55/55** (3 токена: reader / writer / no-publish — для проверки scope-isolation, confirm-rejection, depth-violation, self-parent-rejection, dual-audit-entries).

---



**Phase 2 (готово, 2026-05-13) — admin read tools:** +18 read-tools поверх Phase 1, всего **29 live** ([src/mcp/tools/](surefilter-ui/src/mcp/tools/) + [tools-registry.ts](surefilter-ui/src/mcp/tools-registry.ts)).

- **CMS** ([cms.ts](surefilter-ui/src/mcp/tools/cms.ts)) — `cms-list-pages`, `cms-get-page` (mixed mode: public видит только `status=published`; cms:read видит drafts), `cms-list-shared-sections` (admin-only).
- **Forms** ([forms.ts](surefilter-ui/src/mcp/tools/forms.ts)) — `forms-list/get` (webhookUrl/notifyEmail → `<redacted>` без `admin:*`), `form-submissions-list/get` (`submissions:read`).
- **Banners** ([banners.ts](surefilter-ui/src/mcp/tools/banners.ts)) — `banners-list/get`, `banner-stats-get` (timeseries impressions/clicks/submissions через `DATE_TRUNC`), `banner-campaigns-list`, `banner-submissions-list`.
- **Media** ([media.ts](surefilter-ui/src/mcp/tools/media.ts)) — `media-list-files` (зеркало `/api/admin/files/list` с merge S3-объектов + MediaAsset metadata), `media-get-asset`.
- **Users** ([users.ts](surefilter-ui/src/mcp/tools/users.ts)) — `users-list/get` с маскировкой email (`j***e@example.com` без `admin:*`).
- **Admin** ([admin.ts](surefilter-ui/src/mcp/tools/admin.ts)) — `settings-get` (SiteSettings + MCP global, `catalogPassword` редактирован без admin:*), `analytics-logs-list` (фильтры по userId/action/entityType/date — основной инструмент для аудита `MCP_TOOL_CALL`).
- **Общие хелперы** ([_helpers.ts](surefilter-ui/src/mcp/tools/_helpers.ts)): `authContext` (читает scopes + extra из `extra.authInfo`, выставляет `elevated = admin:*`), `jsonResult/errorResult`, `requireScope(ctx, scope, tool, params)` — авто-пишет `forbidden` в AdminLog при отказе, `maskEmail`.
- **Smoke**: 66/66 (anon, readers-token со всеми `*:read`, content-only-token для scope-isolation, admin:* для снятия редакций).

---



**Phase 1 (готово, 2026-05-13) — runtime + 11 public read tools:**

- **JSON-RPC сервер**: `/api/mcp/[transport]` ([route.ts](surefilter-ui/src/app/api/mcp/[transport]/route.ts)) поверх `mcp-handler@1.1` + `@modelcontextprotocol/sdk@1.29`. Streamable HTTP transport (POST для JSON-RPC, GET для SSE). Endpoint: `POST host/api/mcp/mcp` с `Authorization: Bearer sfpat_…`. `basePath: '/api/mcp'`, `runtime: 'nodejs'`, `dynamic: 'force-dynamic'`.
- **Auth-обёртка** ([src/mcp/server.ts](surefilter-ui/src/mcp/server.ts)) — `withMcpAuth(handler, verifyApiKey, { required: true })`. `verifyApiKey`:
  - валидный bearer → `AuthInfo { token, clientId=tokenId, scopes, extra: { tokenId, userId, ip } }`
  - нет bearer + `publicScopesEnabled` → анонимный AuthInfo с `['public:catalog', 'public:content', 'public:cms']`
  - нет bearer + публичный режим выключен ИЛИ невалидный bearer → undefined → 401 + `WWW-Authenticate: Bearer error=..., resource_metadata=...`
  - перед auth: `checkServerAvailability()` → 503 при `enabled=false` или `maintenanceMode=true` (+ `Retry-After: 60`)
- **RFC 9728**: `/.well-known/oauth-protected-resource` ([route.ts](surefilter-ui/src/app/.well-known/oauth-protected-resource/route.ts)) — заглушка с пустым `authorization_servers: []` под Phase 6.
- **Tools** ([src/mcp/tools/](surefilter-ui/src/mcp/tools/)) — 11 live (помечены `status: 'live'` в [tools-registry.ts](surefilter-ui/src/mcp/tools-registry.ts)):
  - `catalog-{list-products, get-product, list-brands, list-categories, list-filter-types, list-spec-parameters}` (6)
  - `content-{list-news, get-news, list-resource-categories, list-resources, get-resource}` (5) — иерархия resources (parent/sub) поддерживается; `content-get-resource` возвращает `publicUrl` с корректным `/resources/{parent?}/{cat}/{slug}`.
- **scope-guard pattern** ([scope-guard.ts](surefilter-ui/src/mcp/scope-guard.ts)): `effectiveMode(scopes, domain)` → `'admin' | 'public' | null`. Public mode фильтрует `status=PUBLISHED, publishedAt ≤ now`, скрывает чувствительные поля (description/status/tags); admin mode видит drafts полностью.
- **MCP Resources** ([src/mcp/resources/index.ts](surefilter-ui/src/mcp/resources/index.ts)) — 4 readable URIs: `sf://catalog/index` (snapshot брендов/категорий/типов), `sf://content/news-feed` (последние 20), `sf://content/resources-tree` (иерархия + counts), `sf://docs/api-overview` (markdown гайд для агентов).
- **Rate limits** ([lib/rate-limiter.ts](surefilter-ui/src/lib/rate-limiter.ts)): `mcpPublicLimiter` 60/min per IP (анонимы), `mcpAuthedLimiter` 600/min per token (burst); поверх per-token daily quota (Phase 0).
- **Audit** ([src/mcp/audit.ts](surefilter-ui/src/mcp/audit.ts)): authed tool-call → `AdminLog action=MCP_TOOL_CALL`, `entityId=tokenId`, `entityName=toolName`, `details={tool, scopes, status, clientId, params (sanitized), resultSummary, errorMessage}`. Анонимные не пишутся (нет non-null userId; Phase 5 рассмотрит отдельную `McpCallLog` если понадобится). `SECRET_KEYS` (password/token/secret/apiKey/bearer/authorization) автоматически маскируются `<redacted>`.
- **Подключение** — JSON-snippets в `/admin/access/settings → Connection Guide`. Phase 4 поднимет `mcp.surefilter.us`; пока endpoint — `host/api/mcp/mcp`.

---

**Phase 0 (готово, 2026-05-13) — фундамент авторизации:**

**Phase 0 (готово, 2026-05-13) — фундамент авторизации:**

- **Prisma модель `ApiToken`** (миграция `20260513175623_api_tokens_and_mcp_actions`): sha-256 hash, `scopes String[]`, expiresAt/lastUsedAt/lastUsedIp, soft revoke (`revokedAt`/`revokedById`/`revokedReason`), per-day quota (`requestCountToday`/`requestCountDate`/`dailyQuota`), `tokenPrefix` для UI. `User.onDelete: SetNull` — токен переживает удаление владельца (требует явный revoke).
- **AdminAction enum** расширен: `TOKEN_CREATED/REVOKED/REGENERATED`, `MCP_TOOL_CALL`, `MCP_SETTINGS_UPDATED`.
- **Глобальные настройки MCP** — в `SiteSettings.mcp` Json (`enabled`, `publicScopesEnabled`, `defaultTokenTtlDays`, `defaultDailyQuota`, `rateLimitPerMinute`, `maintenanceMode`, `maintenanceMessage`). Helpers: [src/lib/mcp-settings.ts](surefilter-ui/src/lib/mcp-settings.ts) — `getMcpSettings/updateMcpSettings` с Zod-валидацией.
- **Token helpers** ([src/lib/api-token.ts](surefilter-ui/src/lib/api-token.ts)): `generateToken()` → `sfpat_<24chars-base64url>`, `verifyToken()` (hash lookup + revoke/expiry/quota check + lastUsed bookkeeping), `hasScope()` с поддержкой `<domain>:*` и `admin:*` wildcards.
- **Scope vocabulary** ([src/mcp/scopes.ts](surefilter-ui/src/mcp/scopes.ts)): 14 scopes сгруппированы по domain × risk × public/admin; 5 presets для UI: `read-only-researcher`, `content-editor`, `catalog-admin`, `marketing`, `full-admin (admin:*)`.
- **Tool registry** ([src/mcp/tools-registry.ts](surefilter-ui/src/mcp/tools-registry.ts)): полный каталог из 32 tools с `status: 'live' | 'planned'`. Используется Scopes Reference UI чтобы показать какие tools открывает каждый scope + индикатор «уже работает vs запланировано». Phase 1 = 11 live; Phase 2/3 поднимут оставшиеся 21.
- **Admin UI — раздел "API & Access"** ([src/app/admin/access/](surefilter-ui/src/app/admin/access/)) с собственным `AccessShell` (sidebar tabs):
  - `/admin/access/tokens` — list всех токенов всех админов с фильтрами active/expired/revoked + search; колонки: prefix, owner, scopes (compact chips), lastUsed+IP, expires, status.
  - `/admin/access/tokens/new` — preset selector → custom checkboxes по domain с risk-цветами; на submit показывает plaintext в модалке **один раз** + copy-to-clipboard + готовый JSON-snippet для Claude Desktop.
  - `/admin/access/tokens/[id]` — детали + edit name inline + revoke (с reason) + regenerate (revoke старый + new plaintext один раз) + last 50 tool calls из AdminLog.
  - `/admin/access/scopes` — auto-generated reference: каждый scope → описание + риск + раскрывающийся список tools которые он откроет.
  - `/admin/access/usage` — totals + top tools + top tokens + recent 25 calls (агрегаты из `AdminLog.action=MCP_TOOL_CALL`).
  - `/admin/access/settings` — тумблеры + дефолты + полный Connection Guide (Claude Desktop JSON, Claude Code CLI, curl).
- **API**: `/api/admin/access/tokens` (list/create), `[id]` (detail/PATCH/revoke), `[id]/regenerate`, `/api/admin/access/settings`, `/api/admin/access/usage`. Все используют `requireAdmin()` + Zod + `logAdminAction()`.
- **Admin nav**: "Access" link добавлен между "Files" и "Settings" в [AdminClientLayout.tsx](surefilter-ui/src/app/admin/AdminClientLayout.tsx).

**Plaintext-once UX**: при создании или regenerate токен возвращается в response один раз; в БД только `tokenHash` (sha-256). При потере — только regenerate. В UI везде маскируется до `tokenPrefix…` (первые 10 chars, например `sfpat_AbCd…`).

**Local migration note**: при ручной правке исторических миграций (`20250821040036_init_cms`, `20250825224637_add_industry_meta`) `prisma migrate dev` отказывается работать локально из-за drift checksums. Фикс: обновить `_prisma_migrations.checksum` на текущий `shasum -a 256` файла. Production не затрагивается — `migrate deploy` хэши не сверяет, применяет новые миграции по имени.

**Phase 2+ (TODO)**: см. [TODO.md](TODO.md). Следующее — admin read tools (CMS/forms/banners/media/users/analytics), потом writes с idempotency + Elicitation, потом subdomain `mcp.surefilter.us` + WAF.

---

## Известные особенности

0. **Resources Drill-down**: `/resources/*` использует единый `ResourcesShell` ([src/components/resources/ResourcesShell.tsx](surefilter-ui/src/components/resources/ResourcesShell.tsx)) — top pills (top-level категории) + опциональные subcategory chips + view toggle (gallery/list) + mixed `Tile[]` (discriminated union `subcategory | resource`). Карточки subcategory и resource имеют **одинаковую** структуру (image + body, `aspect-[826/1168]` под A4-обложки PDF); subcategory отличается corner folder-иконкой (top-right) и «X catalogs» + «Browse →» CTA, resource — «PDF • size» + Preview/Download buttons. Breadcrumbs **не используются** на listing-страницах (pills/chips уже показывают путь), но остаются на resource detail. На `/resources` показывается union первого уровня: subcategories where they exist, и ресурсы где категория flat. Drill-down иерархия максимум на 2 уровня (`Product Catalogs > Forklifts > <resource>`). Картинки fallback'ятся на иконки (FolderIcon / DocumentTextIcon) на сером градиенте — никаких placeholder-фотографий.

1. **Prisma 7**: `prisma.config.ts` должен быть в корне surefilter-ui/, не в prisma/
2. **Поиск отключен**: Временно закомментирован для Phase 1 (5 компонентов с TODO-маркерами: Header, HeroCms, SearchHero, CompactSearchHero, QuickSearchCms, SimpleSearch)
3. **ISR + CloudFront кэширование**: двухуровневый кэш (Next.js ISR + CloudFront edge)
   - **Все публичные страницы**: `revalidate = 86400` (24 часа) — единое значение, fallback-страховка
   - Admin pages: `force-dynamic` (через server component layout)
   - On-demand invalidation: `invalidatePages()` из `src/lib/revalidate.ts` — мгновенное обновление при редактировании в админке
   - **Cache key включает `RSC` + `Next-Router-Prefetch`** — HTML и RSC payload кэшируются отдельно
   - **Параметрические роуты**: обязательно `generateStaticParams()` (даже `return []`) — без него Next.js не включает ISR
   - **Re-export**: `[slug]/page.tsx` должен экспортировать `revalidate` вместе с `default` и `generateMetadata`
   - **`revalidate` = только литерал** — Next.js AST-анализ не поддерживает импорт из общего файла
4. **Docker build**: `NEXT_BUILD_SKIP_DB=1` — Prisma stub, нет подключения к БД при сборке
5. **Post-deploy warm-up**: `scripts/warm-up.sh` вызывает `/api/warm-up` после старта сервера — обновляет ISR кэш реальными данными из БД (build-time страницы пустые)
6. **TypeScript**: `ignoreBuildErrors: true` в next.config.ts (из-за FilterType.category workarounds в API/админке)
7. **Analytics**: GA4 + GTM ID + Termly UUID из БД (не env), только публичные страницы
8. **SEO файлы**: robots.txt, sitemap.xml, llms.txt, llms-full.txt — все динамические из БД
9. **Default SEO Meta**: title, description, keywords, title suffix (template) — из SiteSettings (БД), не захардкожены. Root layout использует `generateMetadata()` с `getDefaultSeoMeta()`. Если в БД пусто — мета-теги не рендерятся.
10. **Favicon**: `/public/favicon/` (SVG, PNG, ICO, apple-touch-icon, web-app-manifest). Метаданные `icons` + `manifest` в root layout.
11. **Meta Tags Fallback Chain**: Все страницы используют `generateMetadata()` → данные из БД → если undefined, Next.js наследует из root layout `title.default`/`title.template`. Не дублировать suffix в `generateMetadata()` дочерних страниц — root layout `title.template` делает это автоматически.
12. **Canonical URLs (rel=canonical)**: `metadataBase: new URL(NEXT_PUBLIC_SITE_URL)` в root layout + `alternates: { canonical: '/<path>' }` в `generateMetadata()` каждой публичной страницы. Страховка от дублей при `?utm=`, `?fbclid=` и т.п. В паре с edge-редиректом www/new → apex закрывает проблему duplicate content (ahrefs). При добавлении новой публичной страницы — **обязательно** добавлять `alternates.canonical` с относительным путём (metadataBase резолвит в абсолютный URL). Страницы с `robots: noindex` (404, /admin/*, /login, /catalog-viewer) canonical не нужен.
9. **URL Redirects**: управляются из админки (`/admin/settings/site` → вкладка Redirects)
   - Хранятся в `SiteSettings.redirects` (JSON)
   - Логика редиректов в [src/middleware.ts](surefilter-ui/src/middleware.ts) с `export const runtime = 'nodejs'` — прямой доступ к БД через `getActiveRedirects()`, `NextResponse.redirect(url, 301|302)` до рендера страницы
   - В Next.js 15.5+ достаточно `export const runtime = 'nodejs'` в middleware.ts (флаг `nodeMiddleware` в конфиге не нужен)
   - **НЕ в page.tsx** — Next.js bug [#82117](https://github.com/vercel/next.js/issues/82117): `redirect()`/`permanentRedirect()` в prerendered ISR-странице дублирует Location header, envoy (App Runner) склеивает в `/foo,/foo`
   - **Расположение файла**: `src/middleware.ts` (НЕ в корне проекта — с src/-layout Next.js ищет middleware только в src/)
   - Кэширование — через `getSiteSettings()` (module-level cache в `lib/site-settings.ts`, сбрасывается `clearSiteSettingsCache()` при сохранении в админке → ISR revalidate + CloudFront invalidation)
   - Поддержка bulk import, case-insensitive matching, query params preserved для relative destinations
10. **Custom Error Pages**: `not-found.tsx` (404 с Header/Footer), `error.tsx` (runtime, client component), `global-error.tsx` (root layout fallback с inline styles)
   - 404: `robots: { index: false, follow: true }` — не индексируется, но ссылки следуются
   - `error.tsx` — client component, не может использовать Header/Footer (async server components)
   - `global-error.tsx` — свои `<html>`/`<body>`, inline styles (Tailwind может не загрузиться)
11. **Redirect домены**: surefilter.eu/.co/.net (+www) → 301 → surefilter.us
   - CloudFront Function (edge, без App Runner) — `cloudfront-redirect.tf`
   - Один ACM сертификат на все 6 доменов — `acm-redirects.tf`
   - DNS: A + AAAA alias записи в отдельных Route53 зонах — `route53-redirects.tf`
   - `new.surefilter.us` и `www.surefilter.us` → 301 через CloudFront Function `set_x_forwarded_host` на основной дистрибуции (viewer-request, edge, до кэша) — `cloudfront.tf`. НЕ через middleware: CF шлёт на origin с `Host: <apprunner>`, middleware не видит реальный viewer host
12. **news.surefilter.us** — SES email identity для newsletters (listmonk). В браузере → 301 → surefilter.us
13. **mail.surefilter.us** — SES email identity для newsletters (listmonk, второй домен). В браузере → 301 → surefilter.us
14. **notify.surefilter.us** — SES email identity для transactional emails (App Runner). В браузере → 301 → surefilter.us
15. **Google Workspace**: MX + SPF настроены для surefilter.eu/.co/.net; DMARC + DKIM для .net; Google site verification для .co и .net

---

## Документация проекта

### Основные документы (поддерживаем только эти 5)

| Документ | Назначение |
|----------|------------|
| `README.md` | Обзор проекта, технологии, структура |
| `CLAUDE.md` | Quick Reference (этот файл) |
| `CHANGELOG.md` | История изменений |
| `TODO.md` | Задачи, техдолг, планы |
| `docs/GUIDES.md` | Технические руководства |

### Правила ведения документации

1. **НЕ создавать** новые .md файлы для отдельных фич
2. **Консолидировать** информацию в существующие документы
3. **Временные файлы** — в `docs/WIP_*.md`, потом архивировать
4. **Устаревшее** — в `docs/archive/`
5. **После реализации любой фичи** — ОБЯЗАТЕЛЬНО обновить:
   - `TODO.md` — отметить выполненное, добавить новые задачи
   - `CLAUDE.md` — обновить если изменились архитектура, паттерны или версии
   - `CHANGELOG.md` — добавить запись о каждом значимом изменении

### Дополнительно

- `infra/README.md` — инфраструктура AWS
- `surefilter-ui/docs/` — CMS-специфичная документация

---

## Быстрые ответы

**Где схема БД?**
→ `surefilter-ui/prisma/schema.prisma`

**Где добавить новый тип секции?**
→ 1) Enum в schema.prisma 2) Компонент в sections/ 3) Форма в admin/pages/[slug]/sections/ 4) Обработка в cms/section-renderer.tsx

**Где настройки Header/Footer/Analytics/Cookie Consent/SEO/Redirects/Logo/Email Notifications?**
→ `/admin/settings/site` → `SiteSettings` модель

**Как добавить редирект?**
→ `/admin/settings/site` → вкладка Redirects → Add Redirect или Import Bulk

**Как добавить изображение?**
→ `/admin/files` → загрузить → скопировать CDN URL

**Как создать страницу?**
→ `/admin/pages` → New Page → добавить секции

**Как создать попап-банер?**
→ `/admin/banners/new` → выбрать layout в галерее → заполнить content/targeting/triggers → save (status=PUBLISHED для активации)

**Как добавить новый layout для банеров?**
→ 1) Создать `<Name>Layout.tsx` в `src/components/banners/layouts/` (export компонент + meta) 2) Зарегистрировать в `layouts/index.ts` 3) Положить превью в `public/images/banner-layouts/<id>.svg`. Без миграций БД — `banner.layout` это string

**Где смотреть статистику банеров?**
→ `/admin/banners/[id]/stats` (per-banner, charts + breakdowns) или `/admin/banner-campaigns/[id]` (aggregate по кампании)

---

*Этот файл предназначен для AI ассистентов. Для полной документации см. README.md*
