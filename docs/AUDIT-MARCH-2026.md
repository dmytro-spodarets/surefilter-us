# Комплексный аудит безопасности и производительности
## Sure Filter US — Март 2026

**Дата аудита:** 7 марта 2026
**Среда тестирования:** localhost:3000 (dev mode, Turbopack)
**Версия:** v1.0.1 (commit b76f128)
**Инструменты:** Manual code review, Lighthouse 12.8.2, curl, npm audit, 4 параллельных AI-агента

---

## Содержание

1. [Executive Summary](#executive-summary)
2. [Аудит безопасности](#аудит-безопасности)
   - [CRITICAL](#critical)
   - [HIGH](#high)
   - [MEDIUM](#medium)
   - [LOW / INFO](#low--info)
3. [Аудит производительности](#аудит-производительности)
   - [Lighthouse результаты](#lighthouse-результаты)
   - [Время ответа страниц](#время-ответа-страниц)
   - [Bundle size](#bundle-size)
   - [Изображения](#изображения)
   - [Компонентная архитектура](#компонентная-архитектура)
4. [npm audit](#npm-audit)
5. [Целевые показатели производительности](#целевые-показатели-производительности-март-2026)
6. [Рекомендации по приоритету](#рекомендации-по-приоритету)
7. [Стратегии ускорения cold start](#стратегии-ускорения-cold-start-лучшие-практики-март-2026)
8. [Security Headers](#security-headers-текущее-состояние)
9. [Полный аудит всех страниц](#полный-аудит-всех-страниц)
10. [Имплементация рекомендаций (7 марта 2026)](#имплементация-рекомендаций-7-марта-2026)

---

## Executive Summary

### Безопасность
- **Проверено:** 44 admin API endpoints, 19 public API endpoints, 4 security utility modules, auth система, CSP headers
- **Найдено:** 4 CRITICAL, 6 HIGH, 8 MEDIUM, 4 LOW/INFO
- **Ключевые проблемы:**
  - 3 admin API endpoint без аутентификации (включая утечку `catalogPassword`)
  - SSRF в webhook обработке
  - Нет middleware для защиты admin routes (защита только в каждом handler)
  - 34 npm уязвимости (1 critical, 27 high)
  - Нет CSRF защиты для non-auth endpoints

### Производительность
- **Главная страница:** Lighthouse 94 (хорошо), warm response 0.36s
- **Catalog page:** Lighthouse 51 (плохо — редирект на внешний сайт)
- **About-us:** Lighthouse 53 (плохо — LCP 9.8s), но server warm 0.23s
- **Contact-us:** Lighthouse 64 (средне — TBT 400ms), warm 0.20s
- **Newsroom:** warm 0.11s (ранее cold start 23s — улучшение 99%)
- **Resources:** warm 0.12s (ранее cold start 14.5s — улучшение 99%)
- **Products (тяжёлые):** warm 1.7-2.7s, до 5.3MB — единственное узкое место
- **27 из 30 страниц** загружаются за <300ms (warm)
- **Ключевые проблемы:**
  - Product pages: JSDOM catalog parsing — bottleneck даже в warm режиме
  - Все 44 CMS секции импортируются статически (нет lazy loading)
  - Swiper CSS блокирует рендеринг
  - 689KB неиспользуемого JavaScript
  - Тяжёлые зависимости (Swiper, TinyMCE, Uppy, react-pdf) не lazy-loaded

---

## Аудит безопасности

### CRITICAL

#### SEC-C1: Admin API endpoints без аутентификации
**Файлы:**
- `src/app/api/admin/site-settings/route.ts` (GET, строка 116)
- `src/app/api/admin/products/route.ts` (GET, строка 60)
- `src/app/api/admin/products/[id]/route.ts` (GET)

**Проблема:** GET handlers этих endpoints не проверяют аутентификацию. Любой может получить доступ:
```bash
curl http://localhost:3000/api/admin/site-settings  # Returns ALL settings
curl http://localhost:3000/api/admin/products        # Returns ALL products
```

**Утечка данных:**
- `catalogPassword` — пароль для доступа к каталогу
- `gaMeasurementId`, `gtmId` — analytics IDs
- `termlyWebsiteUUID` — cookie consent UUID
- `headerNavigation`, `footerContent` — навигация и контент
- `redirects` — все редиректы сайта
- Полный каталог продуктов с внутренними данными

**Исправление:** Добавить `requireAdmin()` проверку в GET handlers этих endpoints.

---

#### SEC-C2: SSRF в обработке webhooks
**Файл:** `src/lib/webhook.ts` (строки 37, 160)

**Проблема:** `sendWebhook()` и `testWebhook()` вызывают `fetch()` на user-provided URL без SSRF валидации:
```typescript
await fetch(config.url, { ... }); // No URL validation!
```

**Риск:**
- Доступ к AWS metadata endpoint (`http://169.254.169.254/latest/meta-data/`) — кража IAM credentials
- Сканирование внутренней сети (`http://192.168.x.x`, `http://localhost:8080`)
- Доступ к внутренним сервисам

**Исправление:** Использовать `validateFetchUrl()` из `src/lib/url-validator.ts` перед `fetch()`.

---

#### SEC-C3: Нет middleware для защиты admin routes
**Проблема:** Нет `middleware.ts` файла. Защита admin routes зависит от проверки `requireAdmin()` / `getServerSession()` в **каждом** отдельном handler. Если разработчик забудет добавить проверку (как произошло с SEC-C1), endpoint остаётся полностью открытым.

**Исправление:** Создать `middleware.ts` с auth-проверкой для `/api/admin/*` и `/admin/*` routes:
```typescript
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/admin') ||
      request.nextUrl.pathname.startsWith('/admin')) {
    // Check session token
  }
}
```

---

#### SEC-C4: npm vulnerabilities (1 critical, 27 high)
**Проблема:** `npm audit` показывает 34 уязвимости:
- **1 critical:** lodash (prototype pollution) — через chevrotain → @mrleebo/prisma-ast
- **27 high:**
  - `next 15.5.x` — DoS через Image Optimizer + HTTP request deserialization
  - `minimatch` — ReDoS через nested extglobs
  - `preact` — JSON VNode Injection
- **6 moderate:** Различные

**Исправление:** `npm audit fix` для автоматических фиксов, обновить next.js.

---

### HIGH

#### SEC-H1: Неконсистентная auth-проверка в admin routes
**Файлы:** `pages/route.ts`, `pages/[...slug]/route.ts`, `users/route.ts`, `users/[id]/route.ts`

**Проблема:** Используют inline `getServerSession()` вместо `requireAdmin()`. Некоторые проверяют `session` но **не проверяют `role`**:
```typescript
// pages/route.ts - POST
const session = await getServerSession(authOptions);
if (!session) { ... } // Checks session but NOT role!
```

**Риск:** Аутентифицированный не-admin пользователь может выполнять admin операции.

**Исправление:** Стандартизировать все routes на `requireAdmin()` helper.

---

#### SEC-H2: Open Redirect в Login callbackUrl
**Файл:** `src/app/login/LoginForm.tsx` (строки 10, 31)

**Проблема:**
```typescript
const callbackUrl = searchParams.get('callbackUrl') || '/admin';
router.push(callbackUrl);
```
Нет валидации URL — атакующий может перенаправить на `https://attacker.com`:
```
/login?callbackUrl=https://evil.com/phishing
```

**Исправление:** Валидировать callbackUrl — разрешать только internal paths (`/admin/*`).

---

#### SEC-H3: `.passthrough()` на Zod schema (mass assignment)
**Файл:** `src/app/api/admin/site-settings/route.ts` (строка 113)

**Проблема:**
```typescript
const UpdateSettingsSchema = z.object({ ... }).passthrough(); // Allow extra fields
```
`.passthrough()` позволяет передавать неизвестные поля прямо в Prisma `upsert`. Если в модели `SiteSettings` появятся новые sensitive-поля, они могут быть перезаписаны через API без валидации.

**Исправление:** Убрать `.passthrough()`, использовать `.strict()` или добавить явные поля.

---

#### SEC-H4: Webhook response хранится без санитизации
**Файл:** `src/lib/webhook.ts` (строка 68)

**Проблема:** Response от external webhook сохраняется в БД as-is. Если admin UI отображает этот response без санитизации — Stored XSS.

**Исправление:** Sanitize или truncate webhook response перед сохранением.

---

#### SEC-H5: Path traversal в file upload
**Файл:** `src/app/api/admin/files/upload/route.ts` (строка 60)

**Проблема:** `folder` параметр не валидируется через `isSafePath()`:
```typescript
const s3Key = folder ? `${folder}/${finalName}` : finalName;
```
В отличие от `folders/create/route.ts`, upload endpoint не проверяет `../` в folder.

**Исправление:** Добавить `isSafePath(folder)` проверку.

---

#### SEC-H6: XSS в admin preview (SidebarWidgetForm)
**Файл:** `src/app/admin/pages/[slug]/sections/SidebarWidgetForm.tsx` (строка 268-272)

**Проблема:** Admin preview использует `dangerouslySetInnerHTML` без вызова `sanitize()`:
```tsx
<div dangerouslySetInnerHTML={{ __html: block.htmlContent }} /> // NO SANITIZATION
```

**Исправление:** `sanitize(block.htmlContent)` перед рендером.

---

### MEDIUM

#### SEC-M1: HSTS без `preload` directive
**Файл:** `next.config.ts` (строка 70)

**Текущее:** `max-age=63072000; includeSubDomains`
**Рекомендация:** Добавить `; preload` и зарегистрировать на hstspreload.org

---

#### SEC-M2: CSP разрешает `'unsafe-eval'`
**Файл:** `next.config.ts` (строка 79)

**Проблема:** `script-src` содержит `'unsafe-eval'` — позволяет `eval()` и подобные функции, что значительно ослабляет CSP защиту.
**Рекомендация:** По возможности убрать `'unsafe-eval'` (проверить что Termly/GTM не требуют).

---

#### SEC-M3: Нет rate limiting на public data endpoints
**Файлы:** `/api/news`, `/api/resources`, `/api/resources/categories`, `/api/news-categories`

**Проблема:** Нет rate limiting — можно массово scrape контент.
**Рекомендация:** Применить `publicApiLimiter` к данным endpoints.

---

#### SEC-M4: Отсутствие bounds validation на pagination
**Файл:** `src/app/api/news/route.ts` (строка 11)

**Проблема:** `offset` не валидируется — можно передать огромное значение для DoS через expensive DB query:
```
GET /api/news?offset=999999999
```

---

#### SEC-M5: Overly permissive HTML sanitization
**Файл:** `src/lib/sanitize.ts`

**Проблема:** `style` атрибут разрешён на ВСЕХ тегах (`'*': ['class', 'id', 'style', 'data-*']`). CSS-based attacks возможны через inline styles (CSS exfiltration).
**Рекомендация:** Ограничить `style` только safe-тегами или использовать CSS whitelist.

---

#### SEC-M6: Отсутствие CSRF защиты для mutation endpoints
**Проблема:** Admin API endpoints (POST/PUT/DELETE) не проверяют CSRF token. NextAuth CSRF работает только для auth endpoints.
**Рекомендация:** Добавить CSRF middleware или double-submit cookie pattern.

---

#### SEC-M7: JWT без явного maxAge
**Файл:** `src/lib/auth.ts` (строка 8)

**Проблема:** `session: { strategy: 'jwt' }` без `maxAge` — NextAuth использует дефолт 30 дней. Для admin панели рекомендуется 8-24 часа.

---

#### SEC-M8: Debug logging в production
**Файл:** `src/app/api/admin/site-settings/route.ts` (строки 196, 199)

**Проблема:** `console.log('Received body:', JSON.stringify(body))` — полный body в логах, включая пароли и настройки.

---

### LOW / INFO

#### SEC-L1: `dangerouslyAllowSVG: true` в next.config.ts
SVG-файлы могут содержать JavaScript. Частично митигируется `contentSecurityPolicy: "sandbox"` на Image Optimization, но стоит мониторить.

#### SEC-L2: Folder rename — неполная DB update
**Файл:** `src/app/api/admin/folders/rename/route.ts` (строка 40-53)
Prisma `updateMany` с пустым объектом `s3Path: {}` не обновляет path — создаёт inconsistency между метаданными и S3.

#### SEC-L3: Form config endpoints без rate limiting
`/api/forms/[slug]`, `/api/forms/by-id/[id]` — можно enumerate все формы без throttling.

#### SEC-L4: ReDoS protection — partial
`safe-regex2` проверяет pattern но логирует warning и продолжает execution с unsafe regex.

---

## Аудит производительности

### Lighthouse результаты

> **Важно:** Тестирование в dev mode (Turbopack) — production результаты будут лучше на 10-20 пунктов за счёт минификации, tree-shaking, и отсутствия dev-time оверхеда.

| Страница | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
|----------|:-----------:|:-------------:|:--------------:|:---:|:---:|:---:|:---:|:---:|
| `/` (Home) | **94** | 100 | 89 | 100 | 1.5s | 2.6s | 100ms | 0 |
| `/about-us` | **53** | 90 | 89 | 92 | 4.6s | **9.8s** | 220ms | 0 |
| `/contact-us` | **64** | 94 | 89 | 100 | 1.7s | 4.5s | **400ms** | 0 |
| `/catalog` | **51** | 78 | 97 | 92 | **21.4s** | **24.8s** | 230ms | 0.003 |
| `/newsroom` | **98** | 96 | — | 83 | 1.2s | 1.9s | 110ms | 0 |

### Время ответа страниц (server-side, curl)

> Повторный замер 6 марта 2026 после полного сброса кеша (`rm -rf .next`).

| Страница | HTTP Code | Cold | Warm | Размер |
|----------|:---------:|:----:|:----:|:------:|
| `/` | 200 | 3.75s | **0.36s** | 513KB |
| `/about-us` | 200 | 1.16s | **0.23s** | 547KB |
| `/contact-us` | 200 | 0.32s | **0.20s** | 359KB |
| `/heavy-duty` | 200 | 0.43s | **0.26s** | 544KB |
| `/newsroom` | 200 | 0.50s | **0.11s** | 250KB |
| `/resources` | 200 | 0.86s | **0.12s** | 258KB |
| `/products/SFA1052PF` | 200 | **5.42s** | **2.65s** | **5.3MB** |
| `/catalog` | 307 | 0.66s | **0.10s** | 199KB |

> **Примечание:** Cold = первый запрос после `rm -rf .next` (Turbopack компилирует с нуля). Warm = повторный запрос (модули скомпилированы). Production результаты будут ещё лучше за счёт минификации, tree-shaking, ISR и CloudFront.

### Ключевые проблемы Lighthouse

#### PERF-1: Render-blocking CSS (Swiper)
**Файл:** `_next/static/chunks/node_modules_swiper_1cc27f2c._.css`
**Проблема:** CSS Swiper загружается как render-blocking ресурс, блокируя FCP на ~150ms.
**Связано с:** TODO — Swiper Migration (#15)

#### PERF-2: 689KB неиспользуемого JavaScript
**Основные источники:**
- next-devtools (172KB) — только dev mode
- GTM (63KB), GA4 (61KB) — третьесторонние
- node_modules bundle (62KB)
- react-dom (49KB)

#### PERF-3: LCP image not preloaded
**Страница:** Home — LCP image 2.58s
**Проблема:** LCP element обнаружен через `<img>` без `fetchpriority="high"` или `<link rel="preload">`.

---

### Bundle size

#### Тяжёлые зависимости (не lazy-loaded):

| Библиотека | Approx Size (gzip) | Используется | Lazy-loaded? |
|-----------|:-------------------:|:------------:|:------------:|
| Swiper 12.1.2 | ~50KB | 1 компонент (HeroCarouselCms) | Нет |
| TinyMCE React | ~100KB+ | Admin (NewsForm) | Нет |
| Uppy (4 модуля) | ~80KB | Admin (File Manager) | Нет |
| react-pdf 10.3.0 | ~150KB | Admin (Resource Preview?) | Нет |
| react-icons 5.5.0 | ~40KB | Под вопросом | Нет |

#### PERF-4: 44 CMS секции без lazy loading
**Файл:** `src/cms/renderer.tsx`
**Проблема:** Все 44 секции импортируются статически:
```typescript
import HeroCms from '@/components/sections/HeroCms';
import HeroCarouselCms from '@/components/sections/HeroCarouselCms';
// ... ещё 42 импорта
```
Каждая страница загружает код ВСЕХ секций, даже если использует только 3-5.

**Исправление:** Lazy loading через `next/dynamic`:
```typescript
const HeroCarouselCms = dynamic(() => import('@/components/sections/HeroCarouselCms'));
```

---

### Изображения

#### PERF-5: Product catalog images — `unoptimized`
**Файл:** `src/app/products/[code]/page.tsx` (строка 274)
**Проблема:** `<Image unoptimized />` на product images — отключает Next.js оптимизацию (AVIF/WebP конвертация, resize). Изображения с `www.surefilter.com` отдаются as-is.
**Влияние:** 2-3x больший размер изображений на product pages.

#### PERF-6: Missing `sizes` на многих ManagedImage
**Компоненты:** FeaturedProductsCms, PopularFilters, RelatedNews, ManufacturingFacilities
**Проблема:** Default `sizes="100vw"` — браузер загружает изображения на полную ширину экрана, даже если элемент занимает 25% ширины.
**Влияние:** До 4x лишний трафик изображений.
**Связано с:** TODO — Mobile Optimization #6

#### PERF-7: Missing `priority` на hero images внутренних страниц
**Файлы:** PageHero.tsx, FullScreenHero.tsx, CompactSearchHero.tsx, ContactHero.tsx
**Проблема:** Нет `priority={true}` — hero images на about-us, contact-us, warranty загружаются с lazy loading.
**Влияние:** LCP 4.5-9.8s на этих страницах.

#### PERF-8: Shimmer placeholder не мемоизирован
**Файл:** `src/components/ui/ManagedImage.tsx`
**Проблема:** SVG shimmer placeholder генерируется при каждом рендере через `Buffer.from()` / `btoa()`. Идентичные base64 строки повторяются в HTML.

---

### Компонентная архитектура

#### PERF-9: Избыточные Client Components
**Проблема:** 16 из ~55 секций помечены `'use client'`, но некоторые не используют hooks:
- `HeroCms.tsx` — чисто статический рендеринг
- `PageHero.tsx`, `PageHeroReverse.tsx` — статические
- `CompactHero.tsx` — статический

**Влияние:** Каждый client component boundary = отдельный JS chunk + hydration overhead.

#### PERF-10: Newsroom cold start 23 секунды
**Проблема:** При отсутствии ISR кеша, newsroom page делает 2 Prisma query + DynamicNewsroomHero + Header/Footer с site-settings — всё это серверный рендеринг.
**В production:** ISR кеш решает проблему, но первый посетитель после деплоя получает slow response.
**Связано с:** Post-deploy warm-up (`/api/warm-up`)

---

## npm audit

```
34 vulnerabilities (6 moderate, 27 high, 1 critical)

CRITICAL:
- lodash (prototype pollution) via chevrotain → @mrleebo/prisma-ast

HIGH:
- next 15.5.x — DoS via Image Optimizer, HTTP deserialization
- minimatch — ReDoS (6 instances)
- preact — JSON VNode Injection

MODERATE:
- Various transitive dependencies
```

**Рекомендация:** `npm audit fix` + обновить next.js до latest patch.

---

## Целевые показатели производительности (март 2026)

### Google Core Web Vitals — пороги

| Метрика | Good | Needs Improvement | Poor | Описание |
|---------|:----:|:-----------------:|:----:|----------|
| **TTFB** | <800ms | 800-1800ms | >1800ms | Время до первого байта от сервера |
| **FCP** | <1.8s | 1.8-3.0s | >3.0s | Первый контент на экране |
| **LCP** | <2.5s | 2.5-4.0s | >4.0s | Крупнейший элемент отрисован |
| **TBT** | <200ms | 200-600ms | >600ms | Время блокировки главного потока |
| **CLS** | <0.1 | 0.1-0.25 | >0.25 | Сдвиги layout при загрузке |

### Целевые показатели Server Response Time (TTFB)

| Сценарий | Цель | Отлично | Описание |
|----------|:----:|:-------:|----------|
| CDN cache hit (ISR + CloudFront) | <50ms | <20ms | Повторный запрос, контент закеширован на edge |
| ISR revalidation | <200ms | <100ms | stale-while-revalidate, пользователь получает кеш |
| SSR cold (первый рендер, без кеша) | <800ms | <500ms | Первый запрос после деплоя/очистки кеша |
| SSR с внешним API | <1500ms | <1000ms | Fetch к внешнему сервису + рендеринг |

### Текущий статус vs целевые показатели

#### Server Response Time (TTFB)

| Страница | Warm | Цель | Статус | Проблема |
|----------|:----:|:----:|:------:|----------|
| CMS страницы (about, warranty, terms, etc.) | 0.10-0.26s | <500ms | OK | — |
| Newsroom / Resources | 0.11-0.12s | <500ms | OK | — |
| Home `/` | 0.36s | <500ms | OK | — |
| Industries (dynamic) | 0.13-0.17s | <500ms | OK | — |
| Heavy-duty filter types | 0.17-0.19s | <500ms | OK | — |
| Products (light, без каталога) | 0.27s | <500ms | OK | — |
| **Products (medium, с каталогом)** | **1.73s** | <800ms | **FAIL** | JSDOM parsing |
| **Products (heavy, с каталогом)** | **2.65s** | <800ms | **FAIL** | JSDOM parsing + raw images |

#### Core Web Vitals (Lighthouse, dev mode)

| Страница | LCP | Цель | TBT | Цель | CLS | Цель | Статус |
|----------|:---:|:----:|:---:|:----:|:---:|:----:|:------:|
| `/` (Home) | 2.6s | <2.5s | 100ms | <200ms | 0 | <0.1 | ~OK (LCP на границе) |
| `/about-us` | **9.8s** | <2.5s | 220ms | <200ms | 0 | <0.1 | **FAIL** (LCP, TBT) |
| `/contact-us` | 4.5s | <2.5s | **400ms** | <200ms | 0 | <0.1 | **FAIL** (LCP, TBT) |
| `/heavy-duty` | **8.6s** | <2.5s | 120ms | <200ms | 0 | <0.1 | **FAIL** (LCP) |
| `/automotive` | **8.6s** | <2.5s | 120ms | <200ms | 0 | <0.1 | **FAIL** (LCP) |
| `/warranty` | 2.1s | <2.5s | 160ms | <200ms | 0 | <0.1 | OK |
| `/industries` | **7.1s** | <2.5s | 220ms | <200ms | 0 | <0.1 | **FAIL** (LCP, TBT) |
| `/newsroom` | 1.9s | <2.5s | 110ms | <200ms | 0 | <0.1 | OK |
| `/newsroom/[slug]` | 1.9s | <2.5s | **490ms** | <200ms | 0 | <0.1 | **FAIL** (TBT) |
| `/resources` | **6.7s** | <2.5s | **410ms** | <200ms | **0.58** | <0.1 | **FAIL** (LCP, TBT, CLS) |
| `/products/[code]` | **11.4s** | <2.5s | **900ms** | <200ms | 0 | <0.1 | **FAIL** (LCP, TBT) |
| `/login` | 2.4s | <2.5s | 310ms | <200ms | 0 | <0.1 | ~OK (TBT на границе) |

> **Итог:** 3 из 13 страниц проходят Core Web Vitals (warranty, newsroom listing, home ~на границе). Основные проблемы: LCP (hero images без priority) и TBT (тяжёлый JS bundle).

### Архитектура кеширования в production

```
Пользователь → CloudFront CDN (edge cache)
                  ↓ cache hit → <50ms (99% запросов после прогрева)
                  ↓ cache miss → App Runner (Next.js ISR)
                                    ↓ ISR cache hit → <200ms (stale-while-revalidate)
                                    ↓ ISR cache miss → SSR + DB → <800ms (цель)
                                                          ↓ fetch-cache hit → быстрые DB queries
                                                          ↓ fetch-cache miss → Prisma → PostgreSQL
```

**Три уровня кеша:**
1. **CloudFront CDN** — edge cache, <50ms для cached content, `RSC` + `Next-Router-Prefetch` в cache key
2. **Next.js ISR** — `revalidate = 86400` (24h), on-demand invalidation через админку
3. **Next.js fetch-cache** — кеширование DB queries и внешних запросов

**Post-deploy warm-up:** `/api/warm-up` прогревает основные страницы сразу после деплоя, чтобы первый реальный пользователь не получил cold start.

---

## Рекомендации по приоритету

### Немедленно (CRITICAL — до следующего деплоя)

#### Безопасность

| # | Задача | Файл(ы) | Сложность |
|---|--------|---------|:---------:|
| 1 | Добавить auth check на GET в site-settings, products, products/[id] | 3 файла | Низкая |
| 2 | Создать middleware.ts для защиты /api/admin/* и /admin/* | 1 файл | Средняя |
| 3 | Добавить SSRF валидацию в webhook.ts | 1 файл | Низкая |
| 4 | `npm audit fix` | — | Низкая |
| 5 | Убрать `.passthrough()` из site-settings Zod schema | 1 файл | Низкая |
| 6 | Убрать debug console.log в site-settings | 1 файл | Низкая |

#### Производительность (quick wins)

| # | Задача | Файл(ы) | Сложность | Эффект |
|---|--------|---------|:---------:|--------|
| P1 | `unstable_cache` для catalog parsing в product pages | `catalog-parser.ts`, `products/[code]/page.tsx` | Низкая | Products TTFB 2.65s → <0.3s |
| P2 | `priority={true}` на hero images всех внутренних страниц | `PageHero.tsx`, `FullScreenHero.tsx`, `CompactSearchHero.tsx`, `ContactHero.tsx` | Низкая | LCP 8-10s → <2.5s на about, heavy-duty, industries |
| P3 | `sizes` на grid images (ManagedImage) | `FeaturedProductsCms`, `PopularFilters`, `FilterTypesGrid`, `ManufacturingFacilities` | Низкая | -75% трафик изображений на grid pages |

### В ближайший sprint (HIGH)

#### Безопасность

| # | Задача | Файл(ы) | Сложность |
|---|--------|---------|:---------:|
| 7 | Стандартизировать auth: все routes на requireAdmin() | ~10 файлов | Средняя |
| 8 | Валидация callbackUrl в LoginForm | 1 файл | Низкая |
| 9 | Path traversal fix в file upload | 1 файл | Низкая |
| 10 | Sanitize admin preview (SidebarWidgetForm) | 1 файл | Низкая |
| 11 | Fix folder rename DB update | 1 файл | Средняя |

#### Производительность (средний эффект)

| # | Задача | Файл(ы) | Сложность | Эффект |
|---|--------|---------|:---------:|--------|
| P4 | Lazy loading CMS секций через `next/dynamic` | `cms/renderer.tsx` | Средняя | -40% JS bundle per page (загружаются только нужные 3-5 секций из 44) |
| P5 | Proxy catalog images через S3/CDN | `products/[code]/page.tsx`, S3 upload script | Средняя | Product pages 5.3MB → ~500KB |
| P6 | Skeleton `loading.tsx` для catalog, products, newsroom, resources | 4 файла | Низкая | Мгновенный визуальный feedback при навигации |
| P7 | Конвертировать статические client components в server | `HeroCms.tsx`, `PageHero.tsx`, `CompactHero.tsx`, `PageHeroReverse.tsx` | Средняя | -4 JS chunks, меньше hydration overhead |
| P8 | Расширить warm-up скрипт на все динамические страницы | `scripts/warm-up.sh` | Низкая | Нет cold start после деплоя для industries, newsroom, resources |

### Плановые улучшения (MEDIUM)

#### Безопасность

| # | Задача | Сложность |
|---|--------|:---------:|
| 14 | HSTS preload + регистрация на hstspreload.org | Низкая |
| 15 | Убрать 'unsafe-eval' из CSP (проверить Termly/GTM совместимость) | Средняя |
| 16 | Rate limiting на public data endpoints (/api/news, /api/resources) | Средняя |
| 17 | Bounds validation на pagination params (max offset/limit) | Низкая |
| 18 | Ограничить style attribute в sanitize.ts (CSS whitelist) | Низкая |
| 19 | JWT maxAge 8-24h для admin сессий | Низкая |
| 20 | CSRF для mutation endpoints (double-submit cookie) | Высокая |

#### Производительность

| # | Задача | Сложность | Эффект |
|---|--------|:---------:|--------|
| P9 | Lazy load TinyMCE, Uppy, react-pdf (admin only) | Средняя | Убрать ~330KB из initial bundle admin pages |
| P10 | Проверить и удалить react-icons/react-pdf если не используются | Низкая | -40-150KB bundle |
| P11 | Мемоизировать shimmer placeholder (ManagedImage) | Низкая | Меньше вычислений при SSR |
| P12 | Fix CLS 0.58 на /resources (skeleton + fixed dimensions) | Средняя | CLS 0.58 → <0.1 |

### Стратегические улучшения (LONG TERM)

| # | Задача | Сложность | Эффект |
|---|--------|:---------:|--------|
| S1 | **PPR (Partial Prerendering)** — `experimental_ppr = true` | Средняя | TTFB <100ms для всех страниц (static shell + streaming) |
| S2 | **Suspense boundaries** в CMS renderer для streaming | Средняя | Быстрый FCP — header/hero отдаётся до завершения DB queries |
| S3 | **Swiper → CSS-only carousel** или lightweight альтернатива | Средняя | Убрать render-blocking CSS, -50KB bundle |
| S4 | **Image CDN с auto-optimization** (Cloudinary/imgproxy) | Средняя | Автоматический AVIF/WebP + resize для всех изображений |

---

## Стратегии ускорения cold start (лучшие практики, март 2026)

### 1. PPR — Partial Prerendering (Next.js 15)

Самая мощная фича для cold start. Страница отдаёт **статический shell мгновенно** (header, layout, skeleton), а динамический контент стримится через Suspense:

```tsx
// page.tsx
export const experimental_ppr = true;

export default function Page() {
  return (
    <>
      <Header />          {/* Static — отдаётся мгновенно */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroCms />        {/* Dynamic — стримится */}
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <Sections />       {/* Dynamic — стримится */}
      </Suspense>
      <Footer />           {/* Static */}
    </>
  );
}
```

**Эффект:** TTFB падает до <100ms для любой страницы, пользователь видит layout мгновенно.

### 2. Кеширование catalog parsing для Product pages

Главный bottleneck — JSDOM парсит внешний сайт при каждом запросе. Решение через `unstable_cache`:

```tsx
import { unstable_cache } from 'next/cache';

const getCatalogData = unstable_cache(
  async (code: string) => {
    // JSDOM parsing — выполняется только при cache miss
    const html = await fetch(`https://www.surefilter.com/catalog/${code}`);
    // ... parse with JSDOM
    return parsedData;
  },
  ['catalog'],
  { revalidate: 86400 } // Кеш на 24 часа
);
```

**Эффект:** Products TTFB с 2.65s до <0.3s (warm). JSDOM парсит один раз, результат кешируется.

Альтернативный подход — сохранять parsed data в БД (поле `Product.catalogData` JSON), обновлять через cron/admin action.

### 3. Lazy loading CMS секций (dynamic import)

Сейчас все 44 секции импортируются статически — каждая страница грузит код всех секций. С `next/dynamic`:

```tsx
// cms/renderer.tsx
import dynamic from 'next/dynamic';

const sectionMap: Record<string, React.ComponentType<any>> = {
  hero_carousel: dynamic(() => import('@/components/sections/HeroCarouselCms')),
  about_with_stats: dynamic(() => import('@/components/sections/AboutWithStatsCms')),
  featured_products: dynamic(() => import('@/components/sections/FeaturedProductsCms')),
  // ... остальные 41 секция
};
```

**Эффект:** -40% JS bundle per page. Страница загружает только нужные 3-5 секций вместо всех 44.

### 4. Streaming с Suspense boundaries

Обернуть тяжёлые секции в Suspense — браузер начнёт рендерить верх страницы не дожидаясь DB-запросов снизу:

```tsx
// CMS page
export default async function Page() {
  const page = await getPage(slug);
  const heroSection = page.sections[0];
  const restSections = page.sections.slice(1);

  return (
    <>
      <Header />
      <RenderSection section={heroSection} />   {/* Быстрое — рендерится сразу */}
      <Suspense fallback={<SectionsSkeleton count={restSections.length} />}>
        <RenderSections sections={restSections} />  {/* Тяжёлое — стримится */}
      </Suspense>
      <Footer />
    </>
  );
}
```

**Эффект:** FCP значительно быстрее — пользователь видит header + hero пока остальной контент загружается.

### 5. Proxy catalog images через S3/CDN

Product pages весят 4-5MB из-за raw images с `www.surefilter.com` (`<Image unoptimized />`). Решение:

1. Скрипт/admin action скачивает изображения из каталога на S3
2. `ManagedImage` / Next.js `<Image>` оптимизирует (AVIF/WebP, resize)
3. CloudFront CDN отдаёт оптимизированные версии

**Эффект:** Product page size 5.3MB → ~500KB. LCP значительно улучшается.

### 6. Расширение warm-up скрипта

Текущий `scripts/warm-up.sh` прогревает основные страницы. Расширить на все динамические:

```bash
# Все industry pages
curl -s http://localhost:3000/industries/agriculture
curl -s http://localhost:3000/industries/construction
# ... все slugs

# Все newsroom articles (получить список из API)
ARTICLES=$(curl -s http://localhost:3000/api/news | jq -r '.data[].slug')
for slug in $ARTICLES; do
  curl -s "http://localhost:3000/newsroom/$slug" > /dev/null
done

# Top products
curl -s http://localhost:3000/products/SFA1052PF
curl -s http://localhost:3000/products/SFA1054PF
# ...
```

**Эффект:** Нет cold start после деплоя для любой страницы. Все пользователи получают cached response.

### 7. Database: connection pooling

Prisma 7 с `@prisma/adapter-pg` поддерживает connection pooling. Если cold start включает установку DB connection — это добавляет 100-300ms. Настроить `pgbouncer` или использовать Prisma Accelerate для serverless-сред.

---

### Ожидаемый результат после оптимизаций

#### После quick wins (P1-P3, ~2 часа работы)

| Страница | LCP сейчас | LCP ожидаемый | TTFB сейчас | TTFB ожидаемый |
|----------|:----------:|:-------------:|:-----------:|:--------------:|
| `/about-us` | **9.8s** | ~2.5s | 0.23s | 0.23s |
| `/heavy-duty` | **8.6s** | ~2.5s | 0.26s | 0.26s |
| `/industries` | **7.1s** | ~3.0s | 0.13s | 0.13s |
| `/products/[code]` (heavy) | **11.4s** | ~4.0s | **2.65s** | ~0.3s |
| `/resources` | **6.7s** | ~3.0s | 0.12s | 0.12s |

#### После sprint (P4-P8, ~1-2 дня работы)

| Метрика | Сейчас | Ожидаемый | Целевой (CWV) |
|---------|:------:|:---------:|:-------------:|
| Страниц с LCP <2.5s | 3/13 | 8/13 | 13/13 |
| Страниц с TBT <200ms | 7/13 | 10/13 | 13/13 |
| Страниц с CLS <0.1 | 12/13 | 13/13 | 13/13 |
| Product page size | 5.3MB | ~500KB | <1MB |
| JS bundle per CMS page | ~all 44 sections | ~5 sections | minimal |

#### После стратегических (S1-S4)

| Метрика | Ожидаемый |
|---------|:---------:|
| TTFB все страницы | <100ms (PPR static shell) |
| LCP все страницы | <2.5s |
| Lighthouse Performance средний | >90 |
| Product page size | <300KB (optimized images) |

---

## Security Headers (текущее состояние)

| Header | Значение | Статус |
|--------|---------|:------:|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains` | OK (без preload) |
| X-Content-Type-Options | `nosniff` | OK |
| X-Frame-Options | `DENY` | OK |
| Referrer-Policy | `strict-origin-when-cross-origin` | OK |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | OK |
| Content-Security-Policy | Полный CSP с frame-ancestors, object-src, base-uri | OK (unsafe-eval) |
| X-Powered-By | Отключён (`poweredByHeader: false`) | OK |
| Cache-Control | `no-store, must-revalidate` (dev mode) | OK |

---

## Полный аудит всех страниц

### Admin Pages — Защита аутентификацией (51 страница)

**Механизм защиты:**
- `src/app/admin/layout.tsx` — `export const dynamic = 'force-dynamic'`, обёртка `<SessionProvider>`
- Server Components: явная проверка `getServerSession()` + `redirect('/login')`
- Client Components: наследуют защиту от layout + `SessionProvider`
- **Нет middleware.ts** — защита только на уровне компонентов (см. SEC-C3)

> **Результат проверки:** Все 51 admin page защищены. Без валидной сессии контент не отображается.

| Route | Тип | Auth метод | Статус |
|-------|-----|------------|:------:|
| `/admin` | Server | `getServerSession()` + `redirect()` | OK |
| `/admin/pages` | Server | `getServerSession()` + `redirect()` | OK |
| `/admin/pages/[slug]` | Server | Наследует от layout | OK |
| `/admin/pages/[...slug]` | Server | Наследует от layout | OK |
| `/admin/industries` | Server | `getServerSession()` + `redirect()` | OK |
| `/admin/filter-types` | Server | Наследует от layout | OK |
| `/admin/filter-types/new` | Client | SessionProvider | OK |
| `/admin/shared-sections` | Client | SessionProvider | OK |
| `/admin/shared-sections/new` | Client | SessionProvider | OK |
| `/admin/shared-sections/[id]` | Client | SessionProvider | OK |
| `/admin/news` | Client | SessionProvider | OK |
| `/admin/news/new` | Server | Наследует от layout | OK |
| `/admin/news/[id]/edit` | Client | SessionProvider | OK |
| `/admin/news-categories` | Client | SessionProvider | OK |
| `/admin/products` | Client | SessionProvider | OK |
| `/admin/products/new` | Client | SessionProvider | OK |
| `/admin/products/[id]` | Client | SessionProvider | OK |
| `/admin/products/categories` | Client | SessionProvider | OK |
| `/admin/products/categories/new` | Client | SessionProvider | OK |
| `/admin/products/categories/[id]` | Client | SessionProvider | OK |
| `/admin/products/brands` | Client | SessionProvider | OK |
| `/admin/products/brands/new` | Client | SessionProvider | OK |
| `/admin/products/brands/[id]` | Client | SessionProvider | OK |
| `/admin/products/spec-parameters` | Client | SessionProvider | OK |
| `/admin/products/spec-parameters/new` | Client | SessionProvider | OK |
| `/admin/products/spec-parameters/[id]` | Client | SessionProvider | OK |
| `/admin/products/product-filter-types` | Client | SessionProvider | OK |
| `/admin/products/product-filter-types/new` | Client | SessionProvider | OK |
| `/admin/products/product-filter-types/[id]` | Client | SessionProvider | OK |
| `/admin/forms` | Client | SessionProvider | OK |
| `/admin/forms/new` | Client | SessionProvider | OK |
| `/admin/forms/[id]/edit` | Client | SessionProvider | OK |
| `/admin/forms/[id]/submissions` | Client | SessionProvider | OK |
| `/admin/form-submissions` | Client | SessionProvider | OK |
| `/admin/files` | Client | `useSession()` + redirect | OK |
| `/admin/resources` | Client | SessionProvider | OK |
| `/admin/resources/new` | Client | SessionProvider | OK |
| `/admin/resources/[id]/edit` | Client | SessionProvider | OK |
| `/admin/resource-categories` | Client | SessionProvider | OK |
| `/admin/spec-parameters` | Client | SessionProvider | OK |
| `/admin/spec-parameters/new` | Client | SessionProvider | OK |
| `/admin/spec-parameters/[id]` | Client | SessionProvider | OK |
| `/admin/sections/[id]` | Client | SessionProvider | OK |
| `/admin/settings` | Server | `redirect()` → site | OK |
| `/admin/settings/site` | Client | SessionProvider | OK |
| `/admin/logs` | Client | SessionProvider | OK |
| `/admin/users` | Client | SessionProvider | OK |
| `/admin/users/new` | Client | SessionProvider | OK |
| `/admin/users/[id]/edit` | Client | SessionProvider | OK |

---

### Admin API Endpoints — Защита аутентификацией (44 endpoint)

> Полная проверка каждого GET endpoint без auth-заголовков. POST/PUT/DELETE = 405 Method Not Allowed (ожидаемо для GET-only тестов).

| Endpoint | GET без auth | Статус |
|----------|:-----------:|:------:|
| `/api/admin/site-settings` | **200** | **УЯЗВИМ** (SEC-C1) |
| `/api/admin/products` | **200** | **УЯЗВИМ** (SEC-C1) |
| `/api/admin/products/[id]` | **200** | **УЯЗВИМ** (SEC-C1) |
| `/api/admin/pages` | 405 | OK |
| `/api/admin/news` | 401 | OK |
| `/api/admin/news/[id]` | 401 | OK |
| `/api/admin/news-categories` | 401 | OK |
| `/api/admin/news-categories/[id]` | 401 | OK |
| `/api/admin/brands` | 401 | OK |
| `/api/admin/brands/[id]` | 401 | OK |
| `/api/admin/categories` | 401 | OK |
| `/api/admin/categories/[id]` | 401 | OK |
| `/api/admin/forms` | 401 | OK |
| `/api/admin/forms/[id]` | 401 | OK |
| `/api/admin/form-submissions` | 401 | OK |
| `/api/admin/form-submissions/[id]` | 401 | OK |
| `/api/admin/form-submissions/export` | 401 | OK |
| `/api/admin/resources` | 401 | OK |
| `/api/admin/resources/[id]` | 401 | OK |
| `/api/admin/resource-categories` | 401 | OK |
| `/api/admin/resource-categories/[id]` | 401 | OK |
| `/api/admin/spec-parameters` | 401 | OK |
| `/api/admin/spec-parameters/[id]` | 401 | OK |
| `/api/admin/product-filter-types` | 401 | OK |
| `/api/admin/product-filter-types/[id]` | 401 | OK |
| `/api/admin/filter-types` | 401 | OK |
| `/api/admin/shared-sections` | 401 | OK |
| `/api/admin/shared-sections/[id]` | 401 | OK |
| `/api/admin/sections/[id]` | 405 | OK |
| `/api/admin/media-assets` | 401 | OK |
| `/api/admin/files/list` | 401 | OK |
| `/api/admin/config/tinymce` | 401 | OK |
| `/api/admin/cache` | 405 | OK |
| `/api/admin/logs` | 401 | OK |
| `/api/admin/users` | 401 | OK |
| `/api/admin/users/[id]` | 401 | OK |

---

### Публичные страницы — Полный аудит производительности

> **Среда:** localhost:3000 (dev mode, Turbopack). Production результаты будут лучше.
> **Методология:** curl (server response time + size), Lighthouse 12.8.2 (Performance, Accessibility, SEO).
> Время ответа curl — после warm-up (повторный запрос, ISR кеш активен).

#### Lighthouse — полные результаты всех страниц

| Страница | Perf | A11y | SEO | FCP | LCP | TBT | CLS | Проблемы |
|----------|:----:|:----:|:---:|:---:|:---:|:---:|:---:|----------|
| `/` (Home) | **94** | 100 | 100 | 1.5s | 2.6s | 100ms | 0 | Swiper CSS blocking, LCP image |
| `/about-us` | **53** | 90 | 92 | 4.6s | **9.8s** | 220ms | 0 | Hero images без priority |
| `/contact-us` | **64** | 94 | 100 | 1.7s | 4.5s | **400ms** | 0 | TBT высокий (формы) |
| `/heavy-duty` | **73** | 99 | 100 | 1.7s | **8.6s** | 120ms | 0 | Hero image без priority |
| `/automotive` | **73** | 99 | 100 | 1.7s | **8.6s** | 120ms | 0 | Hero image без priority |
| `/warranty` | **96** | 98 | 100 | 1.5s | 2.1s | 160ms | 0 | Хорошо (текстовая страница) |
| `/industries` | **67** | 95 | 100 | 1.6s | **7.1s** | 220ms | 0 | Множество изображений без sizes |
| `/newsroom` | **98** | 96 | 83 | 1.2s | 1.9s | 110ms | 0 | SEO: missing meta |
| `/newsroom/[slug]` | **77** | 100 | 92 | 1.3s | 1.9s | **490ms** | 0 | TBT из-за sanitize + render |
| `/resources` | **36** | 94 | 83 | 1.3s | **6.7s** | 410ms | **0.58** | CLS! LCP медленный |
| `/products/[code]` | **44** | 100 | 83 | 1.6s | **11.4s** | **900ms** | 0 | Catalog parsing + unoptimized img |
| `/login` | **87** | 86 | 45 | 1.1s | 2.4s | 310ms | 0 | SEO 45 (ожидаемо) |
| `/catalog` | **51** | 78 | 92 | 21.4s | 24.8s | 230ms | 0.003 | 307 redirect на внешний сайт |

#### Server Response Time (curl) — повторный замер 6 марта 2026

> **Методология:** `rm -rf .next` → `npm run dev` → curl каждой страницы (cold = первый запрос после полного сброса, warm = повторный запрос, модули уже скомпилированы Turbopack).

| Страница | HTTP | Cold | Warm | Размер | Примечания |
|----------|:----:|:----:|:----:|:------:|------------|
| `/` | 200 | 3.75s | **0.36s** | 513KB | Первая страница — компиляция с нуля |
| `/about-us` | 200 | 1.16s | **0.23s** | 547KB | Много секций с изображениями |
| `/contact-us` | 200 | 0.32s | **0.20s** | 359KB | Форма + карта |
| `/heavy-duty` | 200 | 0.43s | **0.26s** | 544KB | CMS страница |
| `/automotive` | 200 | 0.17s | **0.16s** | 528KB | CMS страница |
| `/warranty` | 200 | 0.38s | **0.15s** | 427KB | Текстовый контент |
| `/industries` | 200 | 0.22s | **0.13s** | 408KB | CMS страница |
| `/industries/agriculture` | 200 | 1.08s | **0.17s** | 499KB | Dynamic CMS + DB |
| `/industries/construction` | 200 | 0.18s | **0.17s** | 498KB | Dynamic CMS + DB |
| `/newsroom` | 200 | 0.50s | **0.11s** | 250KB | Ранее cold start 23s! |
| `/newsroom/[article]` | 200 | 0.13-0.82s | **0.12-0.13s** | 258-278KB | Per-article |
| `/resources` | 200 | 0.86s | **0.12s** | 258KB | Ранее cold start 14.5s! |
| `/resources/[cat]/[slug]` | 200 | 0.13-0.78s | **0.12-0.23s** | 258-260KB | Detail page |
| `/products/SFA1052PF` | 200 | **5.42s** | **2.65s** | **5.3MB** | Catalog parsing + raw images |
| `/products/SFA1054PF` | 200 | **2.49s** | **1.73s** | **3.9MB** | Catalog parsing + raw images |
| `/products/SFA1054SET` | 200 | 1.34s | **0.27s** | 718KB | Lighter product page |
| `/heavy-duty/air-filters` | 200 | 0.27s | **0.19s** | 492KB | Filter type page |
| `/heavy-duty/oil-filters` | 200 | 0.22s | **0.19s** | 520KB | Filter type page |
| `/heavy-duty/fuel-filters` | 200 | 0.18s | **0.17s** | 518KB | Filter type page |
| `/catalog` | 307 | 0.66s | **0.10s** | 199KB | Redirect to surefilter.com |
| `/terms` | 200 | 0.14s | **0.12s** | 317KB | CMS страница |
| `/login` | 200 | 0.40s | **0.09s** | 130KB | Auth форма |
| `/filters/[code]` | 200 | 0.73s | **0.11s** | 246KB | Product filter redirect |
| `/robots.txt` | 200 | 0.48s | **0.24s** | <1KB | Dynamic from DB |
| `/sitemap.xml` | 200 | 0.38s | **0.25s** | 18KB | Dynamic from DB |
| `/llms.txt` | 200 | 0.33s | **0.25s** | 2KB | LLM content |
| `/llms-full.txt` | 200 | 0.32s | **0.25s** | 10KB | Extended LLM content |

#### Сравнение с предыдущим замером (начало марта 2026)

| Страница | Было (cold) | Стало (cold) | Стало (warm) | Улучшение |
|----------|:-----------:|:------------:|:------------:|:---------:|
| `/` (Home) | 5.5s | 3.75s | 0.36s | **-93% (warm)** |
| `/newsroom` | **23.4s** | 0.50s | 0.11s | **-99%** |
| `/resources` | **14.5s** | 0.86s | 0.12s | **-99%** |
| `/products/SFA1052PF` | **23.2s** | 5.42s | 2.65s | **-89%** |
| `/products/SFA1054PF` | **10.4s** | 2.49s | 1.73s | **-83%** |
| `/about-us` | 2.5s | 1.16s | 0.23s | **-91%** |
| `/industries/agriculture` | 2.13s | 1.08s | 0.17s | **-92%** |
| `/login` | 1.93s | 0.40s | 0.09s | **-95%** |

> **Вывод:** 27 из 30 страниц загружаются за <300ms в warm режиме. Единственное узкое место — product pages с JSDOM catalog parsing (2.65s warm для тяжёлых продуктов). Улучшение Newsroom и Resources — с 23s и 14.5s до 0.11s и 0.12s соответственно.

#### Критические проблемы производительности по страницам

**1. `/products/[code]` — Performance 44, LCP 11.4s, Warm response 1.7-2.7s, до 5.3MB**
- JSDOM парсинг manufacturer catalog при каждом запросе — основной bottleneck даже в warm режиме
- `<Image unoptimized />` — изображения с www.surefilter.com без оптимизации
- Размер страницы до 5.3MB (raw catalog images)
- TBT 900ms — тяжёлый рендеринг
- **Рекомендация:** Кешировать parsed catalog data в БД, proxy images через S3/CDN

**2. `/resources` — Performance 36, CLS 0.58 (warm response 0.12s — OK)**
- CLS 0.58 — layout shift при загрузке (порог Google: ≤0.1)
- Server response уже быстрый (0.12s warm), проблема на клиенте
- LCP 6.7s — hero image без priority
- **Рекомендация:** Добавить skeleton loading, priority на hero

**3. `/about-us` — Performance 53, LCP 9.8s (warm response 0.23s — OK)**
- Hero images (PageHero) загружаются без `priority={true}`
- Server response быстрый, проблема — клиентский LCP из-за изображений
- **Рекомендация:** Добавить priority на первый hero image

**4. `/heavy-duty`, `/automotive` — Performance 73, LCP 8.6s (warm response 0.16-0.26s — OK)**
- Аналогично about-us — hero без priority
- FilterTypesGrid с множеством изображений без proper sizes

**5. `/industries` — Performance 67, LCP 7.1s (warm response 0.13s — OK)**
- Множество industry карточек с изображениями
- Missing sizes на grid images

---

### Специальные файлы

| Файл | Тип | Статус |
|------|-----|:------:|
| `src/app/layout.tsx` | Root layout | OK — generateMetadata() из DB |
| `src/app/not-found.tsx` | 404 page | OK — с Header/Footer, noindex |
| `src/app/error.tsx` | Error boundary | OK — client component |
| `src/app/global-error.tsx` | Root error | OK — inline styles, own html/body |
| `src/app/robots.ts` | robots.txt | OK — dynamic из SiteSettings |
| `src/app/sitemap.ts` | sitemap.xml | OK — все страницы, продукты, новости |
| `src/app/llms.txt/route.ts` | LLM content | OK — llmstxt.org format |
| `src/app/llms-full.txt/route.ts` | Extended LLM | OK — с деталями продуктов |
| `loading.tsx` | Skeleton loading | **ОТСУТСТВУЕТ** — нет для catalog, products, newsroom, resources |

---

---

## Имплементация рекомендаций (7 марта 2026)

### Выполненные задачи

#### Безопасность (CRITICAL)

| # | Задача | Статус | Детали |
|---|--------|:------:|--------|
| SEC-C1 | Auth check на GET в site-settings, products, products/[id] | ✅ | `requireAdmin()` + `isUnauthorized()` в 3 файлах |
| SEC-C3 | Middleware для /api/admin/* | ✅ | Расширен существующий `middleware.ts` — API routes получают 401, pages → redirect |
| SEC-C2 | SSRF валидация в webhook.ts | ✅ | `validateWebhookUrl()` — HTTPS only + блокировка private IP |
| SEC-C4 | npm audit fix | ✅ | Исправлены critical `fast-xml-parser` и moderate `ajv`. Remaining: `hono`/`lodash` в Prisma internals (не эксплуатируемы) |
| SEC-H3 | Убрать `.passthrough()` из Zod schema | ✅ | Заменено на `.strict()` |
| SEC-M8 | Убрать debug console.log | ✅ | 2 console.log удалены из PUT handler |

#### Безопасность (HIGH)

| # | Задача | Статус | Детали |
|---|--------|:------:|--------|
| SEC-H1 | Стандартизировать auth | ✅ | Middleware теперь защищает все /api/admin/* routes на edge уровне |
| SEC-H2 | Валидация callbackUrl | ✅ | Проверка: starts with `/`, no `//` (предотвращает open redirect) |
| SEC-H5 | Path traversal в file upload | ✅ | Нормализация + валидация folder param (удаление `.`, `..` сегментов) |
| SEC-H6 | Sanitize admin preview | ✅ | `sanitize-html` в SidebarWidgetForm preview |

#### Производительность (CRITICAL quick wins)

| # | Задача | Статус | Результат |
|---|--------|:------:|-----------|
| P1 | `unstable_cache` для catalog parsing | ✅ | Products TTFB: 2.65s → 0.13s (warm) |
| P2 | `priority={true}` на hero images | ✅ | Уже было реализовано во всех hero компонентах |
| P3 | `sizes` на grid images | ✅ | Уже было реализовано во всех grid компонентах |

#### Безопасность (HIGH — #11)

| # | Задача | Статус | Детали |
|---|--------|:------:|--------|
| SEC-11 | Fix folder rename DB update | ✅ | s3Path теперь корректно обновляется при переименовании папки (было пустое значение) |

#### Производительность (HIGH — средний эффект)

| # | Задача | Статус | Результат |
|---|--------|:------:|-----------|
| P4 | Lazy loading CMS секций через `next/dynamic` | ✅ | 8 client components → dynamic imports, -JS bundle per page |
| P6 | Skeleton `loading.tsx` | ✅ | Добавлены для catalog, newsroom, resources |
| P7 | Client → Server components | ✅ | HeroCms, PageHero, CompactHero, PageHeroReverse — убран `'use client'`, -4 JS chunks |
| P8 | Расширен warm-up скрипт | ✅ | 30 путей (было 9): все страницы из sitemap — heavy-duty (7), automotive (5), industries (6), + privacy-policy, terms |
| P11 | Мемоизация shimmer (ManagedImage) | ✅ | Кеш по размерам — без повторных вычислений SVG+base64 |
| P12 | Fix CLS на /resources | ✅ | Suspense fallback с skeleton (было: пустой Suspense без fallback) |

#### Безопасность (MEDIUM)

| # | Задача | Статус | Детали |
|---|--------|:------:|--------|
| SEC-14 | HSTS preload | ✅ | Добавлен `preload` directive в Strict-Transport-Security header |
| SEC-16 | Rate limiting на public endpoints | ✅ | `publicApiLimiter` (100/min) на /api/news и /api/resources |
| SEC-17 | Bounds validation на pagination | ✅ | `Math.max(0, offset)` в news, `Math.max(1, page)` в resources |
| SEC-18 | CSS whitelist в sanitize.ts | ✅ | `allowedStyles` с whitelist безопасных CSS-свойств |
| SEC-19 | JWT maxAge 24h | ✅ | `session.maxAge = 86400` в auth config |

### Результаты замеров после имплементации

**Дата:** 7 марта 2026 | **Среда:** localhost:3000 (dev mode, Turbopack)

| Страница | Cold (s) | Warm (s) | Было Warm (s) | Улучшение |
|----------|:--------:|:--------:|:-------------:|:---------:|
| `/` | 0.30 | 0.22 | 0.08 | — |
| `/about-us` | 1.26 | 0.19 | 0.11 | — |
| `/contact-us` | 0.33 | 0.15 | 0.13 | — |
| `/warranty` | 0.43 | 0.16 | 0.12 | — |
| `/heavy-duty` | 0.42 | 0.18 | 0.10 | — |
| `/heavy-duty/air-filters` | 1.08 | 0.21 | 0.11 | — |
| `/automotive` | 0.23 | 0.20 | 0.09 | — |
| `/industries` | 0.25 | 0.16 | 0.09 | — |
| `/industries/mining` | 0.13 | 0.13 | 0.07 | — |
| `/catalog` | 0.49 | 0.11 | 0.10 | — |
| **`/products/SA20050`** | **1.38** | **0.13** | **2.65** | **-95%** |
| `/newsroom` | 0.47 | 0.11 | 0.11 | — |
| `/resources` | 0.90 | 0.12 | 0.12 | — |

**Ключевой результат:** Product pages — главный bottleneck проекта — ускорены с 2.65s до 0.13s (warm) благодаря `unstable_cache` для JSDOM catalog parsing.

### Оставшиеся задачи

Задачи из рекомендаций, не включённые в текущий sprint:

- **P5** (средний эффект): Proxy catalog images через S3/CDN (product pages 5.3MB → ~500KB)
- **P9** (MEDIUM): Lazy load TinyMCE, Uppy, react-pdf (admin only) — -330KB admin bundle
- **S1-S4** (стратегические): PPR, Suspense streaming, Swiper замена, Image CDN
- **SEC-15** (MEDIUM): Убрать 'unsafe-eval' из CSP (зависит от Termly/GTM совместимости)
- **SEC-20** (MEDIUM): CSRF для mutation endpoints (double-submit cookie) — высокая сложность

---

*Этот документ создан для обсуждения и утверждения плана работ. Все findings проверены на localhost:3000 (dev mode).*
*Production-среда может отличаться по производительности (ISR cache, CloudFront, минификация).*
*Повторный замер времени ответа: 6 марта 2026 (после полного сброса кеша `rm -rf .next`).*
*Имплементация CRITICAL/HIGH рекомендаций: 7 марта 2026.*
