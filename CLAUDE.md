# CLAUDE.md - Quick Reference for AI Assistants

> Этот документ создан для быстрой ориентации в проекте Sure Filter US.
> Последнее обновление: 25 февраля 2026

---

## Обзор проекта

**Sure Filter US** — корпоративный сайт производителя автомобильных фильтров с полнофункциональной CMS системой.

**Технологический стек:**
- **Framework:** Next.js 15.5.x (App Router, Server Components)
- **React:** 19.0.0
- **Styling:** Tailwind CSS 4.1.11
- **Database:** PostgreSQL + Prisma ORM 7.1.0 (с pg adapter)
- **Storage:** AWS S3 + CloudFront CDN
- **Hosting:** AWS App Runner
- **Caching:** ISR + CloudFront (on-demand invalidation via `@aws-sdk/client-cloudfront`)
- **Auth:** NextAuth.js (credentials)
- **Analytics:** Google Analytics 4 + Google Tag Manager (`@next/third-parties/google`)

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
├── infra/                      # OpenTofu инфраструктура
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
- `SiteSettings` — глобальные настройки (header, footer, analytics, SEO, redirects)

### Каталог продуктов
- `Product` — продукты (code, brand, filterType, manufacturerCatalogUrl)
- `Brand` — бренды (Sure Filter, etc.)
- `ProductCategory` — категории (Heavy Duty, Automotive)
- `ProductFilterType` — типы фильтров (Air, Oil, Fuel, Cabin)
- `SpecParameter` / `ProductSpecValue` — спецификации
- `ProductMedia` / `MediaAsset` — изображения

### Контент
- `NewsArticle` / `NewsCategory` — новости и события
- `Resource` / `ResourceCategory` — ресурсы (каталоги, документы)
- `Form` / `FormSubmission` — универсальные формы

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
- `our_company`, `manufacturing_facilities`, `stats_band`, `awards_carousel`

**Контакты:**
- `contact_hero`, `contact_options`, `contact_form`, `contact_form_info`

**Гарантия:**
- `limited_warranty_details`, `magnusson_moss_act`, `warranty_contact`, etc.

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
- `/resources`, `/resources/[category]/[slug]`

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
- `/admin/files` — файл-менеджер (S3)
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
- `GET /robots.txt` — динамический robots.txt
- `GET /sitemap.xml` — динамический sitemap
- `GET /api/redirects` — активные редиректы (legacy, не используется — логика в catch-all page)
- `GET /llms.txt`, `GET /llms-full.txt` — LLM контент

### Админские (`/api/admin/*`)
- CRUD для pages, sections, products, news, resources, forms
- Все мутации вызывают `invalidatePages()` — сброс ISR + CloudFront кэша
- `/api/admin/file-manager/*` — работа с S3
- `/api/admin/site-settings` — глобальные настройки

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
NEXT_PUBLIC_SITE_URL="https://new.surefilter.us"
CLOUDFRONT_DISTRIBUTION_ID="..."   # For on-demand cache invalidation

# TinyMCE (для редактора контента)
NEXT_PUBLIC_TINYMCE_API_KEY="..."

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
- **AdminClientLayout** (`admin/AdminClientLayout.tsx`) — клиентский layout: SessionProvider, хедер с навигацией + UserMenu (email + Sign Out), `<main>` с `max-w-7xl mx-auto`
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

### API
- Валидация через Zod
- Ответы: `{ data }` или `{ error, message }`
- Логирование через `logAdminAction()`

### Analytics
- GA4 и GTM ID хранятся только в БД (SiteSettings), не в env
- `@next/third-parties/google` — `GoogleAnalytics` + `GoogleTagManager` в root layout
- Применяются только к публичным страницам (admin layout изолирован)
- `src/lib/analytics.ts` — клиентские хелперы (`trackFormSubmit`, `trackButtonClick`, etc.)

---

## Известные особенности

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
7. **Analytics**: GA4 + GTM ID из БД (не env), только публичные страницы
8. **SEO файлы**: robots.txt, sitemap.xml, llms.txt, llms-full.txt — все динамические из БД
9. **URL Redirects**: управляются из админки (`/admin/settings/site` → вкладка Redirects)
   - Хранятся в `SiteSettings.redirects` (JSON)
   - Логика редиректов в catch-all page `(site)/[...slug]/page.tsx` (не в middleware — Edge Runtime не поддерживает fetch на App Runner)
   - `permanentRedirect()` для 301 (отправляет 308), `redirect()` для 302 (отправляет 307) — SEO-эквиваленты
   - **Важно**: `redirect()`/`permanentRedirect()` бросают специальные Next.js ошибки — вызывать ВНЕ try/catch
   - Поддержка bulk import, case-insensitive matching, query params preserved
10. **Custom Error Pages**: `not-found.tsx` (404 с Header/Footer), `error.tsx` (runtime, client component), `global-error.tsx` (root layout fallback с inline styles)
   - 404: `robots: { index: false, follow: true }` — не индексируется, но ссылки следуются
   - `error.tsx` — client component, не может использовать Header/Footer (async server components)
   - `global-error.tsx` — свои `<html>`/`<body>`, inline styles (Tailwind может не загрузиться)

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

**Где настройки Header/Footer/Analytics/SEO/Redirects?**
→ `/admin/settings/site` → `SiteSettings` модель

**Как добавить редирект?**
→ `/admin/settings/site` → вкладка Redirects → Add Redirect или Import Bulk

**Как добавить изображение?**
→ `/admin/files` → загрузить → скопировать CDN URL

**Как создать страницу?**
→ `/admin/pages` → New Page → добавить секции

---

*Этот файл предназначен для AI ассистентов. Для полной документации см. README.md*
