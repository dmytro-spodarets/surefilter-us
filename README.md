# Sure Filter US — UI

Коротко: фронтенд на Next.js (App Router) для сайта Sure Filter US. Минималистичный, быстрый, доступный интерфейс с современным стеком и акцентом на переиспользование готовых решений.

> **🤖 Для AI Ассистентов:** См. [CLAUDE.md](./CLAUDE.md) — Quick Reference для быстрой ориентации в проекте.

## Последние обновления (March 2, 2026)

### SEO/GEO Implementation
- **Default SEO Meta из админки** — title, title suffix (template), description, keywords вынесены из кода в SiteSettings (БД). Root layout использует `generateMetadata()` вместо статического `metadata` export.
- **generateMetadata() на всех страницах** — newsroom, news articles (og:type article + publishedTime/authors/tags), resources, resource detail, CMS pages, products. Fallback chain: если page не задаёт meta → наследуются defaults из root layout.
- **Favicon** — SVG, PNG 96x96, ICO, apple-touch-icon 180x180, PWA icons 192/512, site.webmanifest. Метаданные `icons` + `manifest` в layout.tsx.
- **robots.txt** — все AI-боты разрешены (training + retrieval). Стратегия: максимальная видимость в AI-поисковиках.
- **SEO/GEO аудит** — 23 задачи в TODO.md (JSON-LD structured data, Twitter Cards, canonical URLs, preconnect hints и др.)

### Analytics & Tag Manager
- **Google Analytics 4** — `@next/third-parties/google`, GA Measurement ID из админки
- **Google Tag Manager** — GTM Container ID из админки
- Клиентские хелперы для кастомных событий (`src/lib/analytics.ts`)

### SEO/GEO Dynamic Files
- **`/robots.txt`** — динамический из БД, toggle блокировки в админке
- **`/sitemap.xml`** — все страницы, продукты, новости, ресурсы из БД
- **`/llms.txt`** — формат llmstxt.org для LLM-краулеров (ChatGPT, Claude, Perplexity)
- **`/llms-full.txt`** — расширенная версия с деталями продуктов и новостей

---

### Состав и версии
- Next.js 15.5.9 (App Router)
- React 19.0.0
- Tailwind CSS 4.1.11
- Node.js 20.x (LTS)
- Prisma 7.1.0 (с PostgreSQL driver adapter)
- JSDOM 27.x (HTML parsing)
- Библиотеки: `@heroicons/react`, `react-icons`, `clsx` + `tailwind-merge` (утилита `cn`), `@next/third-parties` (GA4/GTM)

### Страницы и навигация (актуально)
- Главные разделы: `/` (home), `/about-us`, `/heavy-duty`, `/automotive`, `/industries`, `/resources`, `/newsroom`, `/warranty`, `/contact-us`, `/test-colors`
- Подстраницы:
  - Heavy Duty: `/heavy-duty/air`, `/heavy-duty/cabin`, `/heavy-duty/fuel`, `/heavy-duty/oil`
  - Industries: `/industries/agriculture`
  - Newsroom: `/newsroom/[slug]` — динамические страницы новостей и событий из БД
  - Resources: `/resources/[slug]` — динамические страницы ресурсов с gated downloads через формы
- Каталог и фильтры:
  - **✨ `/products/[code]`** — **НОВОЕ!** Публичная страница продукта с интеграцией каталога производителя
  - `/filters/[code]` — страница конкретного фильтра (Hero, описание, `Specifications`, галерея, таблица OEM). Сейчас использует мок‑данные (`SFO241`, `SFG84801E`).
  - `/catalog` — каталог с левой панелью фильтров (поиск, тип, индустрия, марка, параметры), переключение `Gallery/List`, пагинация. CTA на главной ведёт сюда.
- Админ-панель:
  - `/admin` — главная панель администрирования
  - `/admin/pages` — управление CMS страницами
  - `/admin/news` — управление новостями и событиями
  - `/admin/resources` — управление ресурсами и категориями
  - `/admin/forms` — конструктор форм и просмотр submissions
  - `/admin/files` — файл-менеджер (S3/MinIO)
  - `/admin/settings/site` — настройки сайта (Header, Footer, Special Pages, Analytics, SEO & LLM)
  - **✨ `/admin/products`** — **ОБНОВЛЕНО!** Управление каталогом продуктов:
    - `/admin/products` — список продуктов с поиском и фильтрами
    - `/admin/products/new` — создание продукта
    - `/admin/products/[id]` — редактирование продукта (включая Manufacturer Catalog URL)
    - `/admin/products/categories` — управление категориями продуктов
    - `/admin/products/brands` — управление брендами
    - `/admin/products/spec-parameters` — параметры спецификаций
    - `/admin/products/product-filter-types` — типы фильтров для каталога
  - `/catalog-viewer` — preview каталога производителя (для админов)

### Компоненты (основные)
- `layout/`: 
  - `Header` (Server Component) с sub-components: `ScrollHeader`, `HeaderNav`, `MobileMenu` (Client)
  - `Footer` (Server Component)
- `sections/` (CMS-версии):
  - Hero: `HeroCms`, `FullScreenHero`, `SingleImageHero`, `PageHero`, `PageHeroReverse`, `CompactHero`, `CompactSearchHero`, `SearchHero`, `NewsroomHero`, `ResourcesHero`
  - Content: `ContentWithImages`, `AboutWithStats`, `QualityAssurance`, `AboutNewsCms` (авто-загрузка последних новостей)
  - Features: `WhyChooseCms` (с центрированием карточек), `FeaturedProductsCms` (ручной ввод), `FeaturedProductsCatalogCms` (выбор из каталога, 8 случайных из N), `PopularFiltersCatalogCms` (выбор из каталога, columnsPerRow случайных), `IndustriesCms`, `IndustriesList`
  - Filters: `FilterTypesGrid` (иконки), `FilterTypesImageGrid` (изображения, 16:9, Flexbox центрирование, настраиваемые колонки, два варианта стиля), `FilterTypesCms`, `PopularFilters`, `RelatedFilters`
  - Search: `QuickSearchCms`, `SimpleSearch`
  - Products: `Products`, `ProductGallery`, `ProductSpecs` (варианты `cards`/`table`, `contained`)
  - Contact: `ContactOptions`, `ContactHero`, `ContactForm`, `ContactInfo`, `ContactDetails`, `ContactFormInfo`
  - Warranty: `LimitedWarrantyDetails` (CMS), `MagnussonMossAct` (CMS), `WarrantyClaimProcess`, `WarrantyContact` (CMS), `WarrantyPromise`, `QualityAssurance` (CMS), `PageHeroReverse` (CMS)
  - About: `ManufacturingFacilities`, `OurCompany`, `StatsBand`, `AwardsCarousel`
  - News: `NewsCarousel`, `NewsroomClient` (события + новости с фильтрацией)
  - Resources: `ResourcesClient` (список ресурсов с фильтрацией), `ResourceDownloadForm` (форма загрузки)
- `forms/`: `DynamicForm` (универсальный компонент для рендера форм), `FormBuilder` (drag-and-drop редактор полей)
- `ui/`: `Button`, `Card`, `Icon`, `Input`, `Logo`, `Pagination`, `ManagedImage` (с shimmer placeholder)
- `admin/`: компоненты админ-панели (AdminNav, Breadcrumbs, форм-редакторы)
- `seo/`: `SEO`
- `lib/`:
  - `utils.ts` — `cn(...classes)`
  - `assets.ts` — `getAssetUrl`, `getOptimizedImageUrl`, `isAssetPath`
  - `site-settings.ts` — `getHeaderNavigation`, `getFooterContent`, `getDefaultSeoMeta`, `getNewsroomPageSettings`, `getResourcesPageSettings`, `getGaMeasurementId`, `getGtmId` (Server-side)
  - `analytics.ts` — `sendGAEvent`, `trackFormSubmit`, `trackButtonClick` (Client-side)
  - `prisma.ts` — глобальный Prisma client
  - `catalog-parser.ts` — парсинг HTML каталогов производителя (JSDOM)

### Иконки
- Компонент `Icon` принимает: `name`, `variant: 'outline' | 'solid'`, `size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`, `color: 'sure-blue' | 'sure-orange' | 'gray' | 'white' | 'current'`.
- Размеры: `xs` 12px, `sm` 16px, `md` 24px, `lg` 32px, `xl` 48px, `2xl` 64px.

### Стиль и цвета
- Заголовки: `text-gray-900`, подзаголовки/описания: `text-gray-600`.
- Брендовые: `sure-blue` и `sure-red`; акценты/фокус — `sure-orange` (например, `Input` имеет `focus:border-sure-orange-500`; `Button` использует `sure-orange` для `primary`).
- В компонентах выдержаны единые отступы и ширина контейнера (`max-w-7xl`).

### Рендеринг и производительность
- **ISR (Incremental Static Regeneration)**: Все публичные страницы `revalidate = 86400` (24ч). On-demand invalidation при редактировании в админке.
  - Build без подключения к БД (`NEXT_BUILD_SKIP_DB=1` → Prisma stub)
  - Post-deploy warm-up (`/api/warm-up`) обновляет ISR кэш реальными данными
  - Параметрические роуты: `generateStaticParams()` (даже `return []`) обязателен для ISR
- **Кэширование**:
  - ISR + CloudFront двухуровневый кэш
  - On-demand invalidation: `invalidatePages()` сбрасывает ISR + CloudFront одновременно
  - Site settings кэшируются на 1 минуту в production
  - CloudFront кэширует статические assets на 1 год
- **Оптимизация**:
  - Server Components для Header/Footer (загрузка данных на сервере)
  - Client Components только где необходима интерактивность
  - Lazy loading изображений с shimmer placeholder

### SEO & GEO
- **Default meta tags из БД**: title, title suffix (template), description, keywords — управляются через админку (`Settings → Special Pages → Default SEO Meta Tags`)
- **Meta tags fallback chain**: root layout `generateMetadata()` → `getDefaultSeoMeta()` → child pages override через свои `generateMetadata()` → если child не задаёт поле, наследуется из root layout `title.default`/`title.template`
- **generateMetadata() на всех страницах**: home, newsroom, news articles (og:type article), resources, resource detail, CMS pages, products
- **Favicon**: `/public/favicon/` (SVG, PNG, ICO, apple-touch-icon, web-app-manifest). Метаданные через `icons` + `manifest` в root layout.
- **Dynamic robots.txt** (`src/app/robots.ts`): все AI-боты разрешены, блокировка из админки (`seoRobotsBlock`)
- **Dynamic sitemap.xml** (`src/app/sitemap.ts`): CMS pages, products, news, resources
- **llms.txt / llms-full.txt** (`src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`): формат llmstxt.org для LLM-краулеров
- Все SEO-файлы `force-dynamic` (генерируются из БД на каждый запрос)

### Analytics
- **Google Analytics 4**: `@next/third-parties/google` `GoogleAnalytics` в root layout
- **Google Tag Manager**: `@next/third-parties/google` `GoogleTagManager` в root layout
- GA Measurement ID и GTM Container ID хранятся в БД (`SiteSettings`), настраиваются через админку
- Применяются только к публичным страницам (admin layout имеет собственный `<html>`)
- Client-side хелперы: `src/lib/analytics.ts` (`trackFormSubmit`, `trackButtonClick`, `trackEvent`)

### Изображения и файлы
- **Next.js Image оптимизация** (все компоненты используют `next/image` для автоматической WebP/AVIF конвертации):
  - `ManagedImage` компонент с shimmer placeholder (анимация загрузки)
  - Priority loading для hero-изображений (улучшает LCP на 20-30%)
  - Оптимизированные `sizes` для responsive загрузки (экономия трафика ~40-50%)
  - Preload критичных изображений (логотип) в `layout.tsx`
  - Все `<img>` теги заменены на `<Image>` с правильными sizes
  - **TODO**: Планируется предварительная оптимизация при загрузке (см. `TODO.md`)
- **Автоматическая оптимизация при загрузке**:
  - Сжатие изображений до 1MB и 2048px (browser-image-compression)
  - WebWorker для производительности
  - Индикатор оптимизации в UI
  - Применяется автоматически для всех загружаемых изображений
- **CDN и кеширование**:
  - CloudFront с TTL 1 год для статических assets
  - CloudFront 404 errors кэшируются только 10 секунд (предотвращает проблемы с новыми файлами)
  - Brotli + Gzip compression
  - Правильные Cache-Control headers
  - `getAssetUrl` утилита для унифицированной работы с путями
- Обработка ошибок изображений через `onError`, есть градиентные фоллбеки.
- **Файл-менеджер**: полная система управления медиафайлами через `/admin/files`
  - S3/MinIO интеграция с CDN (CloudFront)
  - Папки с вложенностью, drag & drop загрузка
  - Превью изображений, видео, PDF в модальных окнах
  - Копирование CDN ссылок для вставки в контент
  - Автоматическая оптимизация изображений при загрузке

### Структура проекта (расширенно)
```
docker/
  docker-compose.yml
  env.example
surefilter-ui/
  src/app/
    page.tsx
    layout.tsx
    globals.css
    about-us/page.tsx
    automotive/page.tsx
    heavy-duty/page.tsx
    heavy-duty/air/page.tsx
    heavy-duty/cabin/page.tsx
    heavy-duty/fuel/page.tsx
    heavy-duty/oil/page.tsx
    industries/page.tsx
    industries/agriculture/page.tsx
    newsroom/page.tsx
    newsroom/[slug]/page.tsx
    newsroom/NewsroomClient.tsx
    resources/page.tsx
    resources/[slug]/page.tsx
    resources/[slug]/ResourceDownloadForm.tsx
    resources/ResourcesClient.tsx
    warranty/page.tsx
    contact-us/page.tsx
    admin/
      pages/[slug]/edit/page.tsx
      news/page.tsx
      news/[id]/edit/page.tsx
      resources/page.tsx
      forms/page.tsx
      forms/[id]/edit/page.tsx
      files/page.tsx
      settings/site/page.tsx
    test-colors/page.tsx
    filters/[code]/page.tsx        # детальная страница фильтра (mock data)
    catalog/page.tsx               # каталог с фильтрами и пагинацией
    catalog/CatalogClient.tsx      # Client Component для фильтрации
    ✨ products/                   # НОВОЕ! Публичные страницы продуктов
      layout.tsx                   # Client Layout для scroll management
      [code]/
        page.tsx                   # Server Component с ISR
        loading.tsx                # Skeleton UI
    ✨ catalog-viewer/             # НОВОЕ! Admin preview каталога
      page.tsx                     # Server Component
  src/components/layout/
    Header/
      Header.tsx              # Server Component
      ScrollHeader.tsx        # Client sub-component
      HeaderNav.tsx           # Client sub-component
      MobileMenu.tsx          # Client sub-component
      index.ts
    Footer.tsx                # Server Component
  src/components/sections/
    HeroCms.tsx                    # CMS версия Hero
    FullScreenHero.tsx
    SingleImageHero.tsx
    PageHero.tsx
    PageHeroReverse.tsx
    CompactHero.tsx
    CompactSearchHero.tsx
    SearchHero.tsx
    QuickSearchCms.tsx             # CMS версия QuickSearch
    FeaturedProductsCms.tsx        # CMS версия с категорией на изображении
    IndustriesCms.tsx              # CMS версия Industries
    IndustriesList.tsx
    FilterTypesGrid.tsx
    FilterTypesImageGrid.tsx       # Новый компонент с изображениями
    FilterTypesCms.tsx
    PopularFilters.tsx
    RelatedFilters.tsx
    Products.tsx
    ProductGallery.tsx
    ProductSpecs.tsx
    AboutWithStats.tsx
    AboutNewsCms.tsx               # CMS версия с авто-загрузкой новостей
    WhyChooseCms.tsx               # CMS версия с flexbox центрированием
    QualityAssurance.tsx
    ContentWithImages.tsx
    NewsCarousel.tsx
    LimitedWarrantyDetails.tsx
    MagnussonMossAct.tsx
    WarrantyClaimProcess.tsx
    WarrantyContact.tsx
    WarrantyPromise.tsx
    ContactOptions.tsx
    ContactHero.tsx
    ContactForm.tsx
    ContactInfo.tsx
    ContactDetails.tsx
    ContactFormInfo.tsx
  src/components/forms/
    DynamicForm.tsx                # Универсальный рендер форм
    FormBuilder.tsx                # Drag-and-drop редактор полей
  src/components/ui/
    Button.tsx
    Card.tsx
    Icon.tsx
    Input.tsx
    Logo.tsx
    Pagination.tsx
    Collapsible.tsx
    ManagedImage.tsx               # Image с shimmer placeholder
  src/components/admin/
    AdminNav.tsx                   # Навигация админки с dropdown
    Breadcrumbs.tsx
    ... другие админ-компоненты
  src/components/seo/SEO.tsx       # LEGACY: не используется, удалить (uses next/head, incompatible with App Router)
  src/lib/
    utils.ts                       # cn(...classes)
    assets.ts                      # getAssetUrl, getOptimizedImageUrl
    site-settings.ts               # getHeaderNavigation, getFooterContent
    prisma.ts                      # Глобальный Prisma client
```

### Запуск
```bash
cd surefilter-ui
npm install
npm run dev
# build: npm run build; start: npm start; lint: npm run lint
```

### Docker (Postgres) для разработки
1) Подготовьте переменные окружения и поднимите контейнер:
```bash
cp docker/env.example docker/.env
docker compose -f docker/docker-compose.yml up -d
```

2) Проверка логов/healthcheck:
```bash
docker compose -f docker/docker-compose.yml logs -f postgres | cat
```

3) Остановка/удаление контейнера:
```bash
docker compose -f docker/docker-compose.yml down
```

### CMS: редактирование контента и кеш
- Главная страница полностью рендерится из CMS (БД) в порядке, заданном в админке.
- Админка: `/admin` → Pages → выберите страницу → SEO и список секций; редактирование конкретной секции по клику Edit.
- Поддерживаемые секции на главной: `hero_full`, `featured_products`, `why_choose`, `quick_search`, `industries`, `about_news`.
- **Warranty компоненты в CMS**:
  - `PageHeroReverse` — 6 редактируемых полей (title, description, image1-4 для сетки 2x2 с offset)
  - `MagnussonMossAct` — 10 редактируемых полей (badge, title, subtitle, image, mainText, lawQuote, lawReference, bottomText, ctaTitle, ctaText)
  - `QualityAssurance` — статичный компонент (без редактируемых полей)
  - `LimitedWarrantyDetails` — 9 редактируемых полей (title, subtitle, image, introText, promiseTitle, promiseText, warrantyTitle, warrantyText1, warrantyText2)
  - `WarrantyContact` — 6 редактируемых полей (title, subtitle, phone, phoneHours, email, emailResponse)
  - Все компоненты без дефолтных значений — создаются пустыми, заполняются через админку
  - Компоненты безопасны — не ломаются при отсутствии данных (проверки на undefined)
  - Изображения поддерживают URL, S3 paths и локальные пути с фоллбеками на дефолтные
- Кеш: используется tag‑based кеширование. После сохранения секции выполняется `revalidateTag` и HTML обновляется автоматически. В dev при необходимости перезапустите `npm run dev`.
- Сидинг контента:
  - Создание без перезаписи: `npm run seed:content`
  - Принудительное обновление существующих секций: `npm run seed:content:force`

### Как вести разработку
- Рабочий процесс
  - Ветки: `feature/<кратко>`, `fix/<кратко>`; мелкие правки можно в `main`, если без риска.
  - Коммиты: `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`.
  - CHANGELOG: на каждое заметное изменение — одна строка в формате `YYYY-MM-DD — описание`.
  - Изменили публичные API/страницы/цветовую политику — обновите `README.md`.
- Код и типы
  - TypeScript везде; явные типы пропсов; избегайте `any`.
  - Именование: осмысленные названия, без аббревиатур; функции — глаголы, переменные — существительные.
  - Утилита классов: используйте `cn()` для слияния Tailwind‑классов.
- Клиент/сервер компоненты
  - С обработчиками событий — только Client Components (`'use client'`).
  - Не передавайте обработчики событий в Server Components.
  - В Next 15 динамические параметры в роуте следует `await` в async‑компоненте: `const { code } = await params`.
- UI/стили
  - Заголовки/подзаголовки: см. раздел «Стиль и цвета».
  - Единая пагинация через `ui/Pagination` на страницах со списками.
  - Ширина секций — `max-w-7xl`; следите за вертикальными отступами секций.
  - Изображения с внешних источников — добавляйте фоллбек.
- Роутинг и ссылки
  - Все кнопки «View Full Catalog» ведут на `/catalog`.
  - Карточки продуктов ссылаются на `/filters/{code}`.
- Переменные окружения
  - `NEXT_PUBLIC_SITE_URL` — база для абсолютных ссылок в метаданных.
  - `DATABASE_URL` — строка подключения к локальной PostgreSQL (см. `docker/env.example`).
- Качество
  - Линт: `npm run lint`. Покрывайте новые компоненты простыми юнит‑тестами, где это уместно.
  - A11y: focus‑states, контраст, семантические теги, `aria` при необходимости.

### Дополнительно
- Планы развития: см. `ROADMAP.md`.
- История изменений и правила записей: см. `CHANGELOG.md`.

### Продовая инфраструктура (кратко)
- Домен и CDN: `new.surefilter.us` через CloudFront + ACM + Route53. Канонический домен принудительно в `middleware`, origin защищён заголовком `X-Origin-Secret`.
- Хостинг приложения: AWS App Runner (автодеплой вручную по образу из ECR).
- База данных: RDS PostgreSQL (публично на период миграции; далее — VPC Connector и закрытие SG).
- Секреты: SSM параметры `/surefilter/DATABASE_URL`, `/surefilter/NEXTAUTH_SECRET`, `/surefilter/ORIGIN_SECRET`.
- Статика: `/_next/static/*` и `/images/*` в S3 (`surefilter-static-prod`) за CloudFront, TTL 1 год, immutable.

### CloudFront 404 Issue (2025-09-17) — РЕШЕНО ✅

**Проблема**: Сайт работал по прямому App Runner URL (`https://qiypwsyuxm.us-east-1.awsapprunner.com/`) но возвращал 404 через CloudFront (`https://new.surefilter.us/`).

**Причина**: CloudFront передавал viewer headers (включая `Host`) в App Runner, что конфликтовало с middleware логикой проверки канонического домена.

**Решение**:
1. **Создана новая origin request policy** `app_runner_min`:
   - `headers_config.header_behavior = "none"` — НЕ передаёт viewer headers
   - `cookies_config.cookie_behavior = "all"` — передаёт все cookies
   - `query_strings_config.query_string_behavior = "all"` — передаёт все query strings
2. **Обновлён CloudFront distribution** для использования новой policy на всех App Runner behaviors
3. **Исправлена S3 bucket policy** для корректной работы с Origin Access Identity

**Файлы изменены**:
- `infra/envs/prod/cloudfront.tf` — добавлена policy `aws_cloudfront_origin_request_policy.app_runner_min`
- `infra/envs/prod/providers.tf` — временно переключен на local backend для отладки

**Статус**: ✅ Сайт полностью работает через CloudFront

**TODO для будущего**:
- [ ] Настроить кеширование для статических ресурсов (CSS, JS, изображения)
- [ ] Включить обратно origin enforcement в middleware (`ENFORCE_ORIGIN = "1"`)
- [ ] Вернуть state обратно в Scalr после завершения отладки
- [ ] Добавить CloudFront access logs для мониторинга
- [ ] Настроить response headers policy для безопасности

### Локальная работа с OpenTofu

**Настройка для локальной разработки**:

1. **Установка OpenTofu**:
   ```bash
   # macOS
   brew install opentofu
   
   # Проверка версии
   tofu --version
   ```

2. **Настройка AWS профиля**:
   ```bash
   # Создание профиля
   aws configure --profile surefilter-local
   
   # Или через переменную окружения
   export AWS_PROFILE=surefilter-local
   ```

3. **Переключение на локальный backend**:
   - В `infra/envs/prod/providers.tf` backend уже настроен на `local`
   - State файл: `infra/envs/prod/terraform.tfstate`

4. **Экспорт state из Scalr** (если нужно):
   ```bash
   cd infra/envs/prod
   
   # В оригинальной Scalr среде
   tofu state pull > terraform.tfstate
   
   # Инициализация локально
   tofu init -reconfigure
   ```

5. **Основные команды**:
   ```bash
   cd infra/envs/prod
   
   # Планирование изменений
   tofu plan
   
   # Применение изменений
   tofu apply
   
   # Применение без подтверждения
   tofu apply -auto-approve
   
   # Просмотр state
   tofu state list
   tofu state show <resource_name>
   
   # Уничтожение ресурсов (осторожно!)
   tofu destroy
   ```

6. **Возврат в Scalr** (после отладки):
   ```bash
   # Вернуть backend в providers.tf на remote
   # Затем мигрировать state
   tofu init -reconfigure -migrate-state
   ```

**Важно**:
- Локальные файлы (`.terraform/`, `terraform.tfstate*`) добавлены в `.gitignore`
- Не коммитьте локальные state файлы в репозиторий
- При работе с командой убедитесь, что никто не запускает Scalr параллельно

### Search Disabled for Phase 1 Release (2025-09-17)

**Цель**: Подготовить сайт к релизу первой фазы без каталога, временно отключив все функции поиска.

**Изменения**:
1. **Header.tsx** — закомментирована форма поиска в шапке, добавлена кнопка "Browse Catalog"
2. **Hero.tsx** — закомментирована форма поиска, оставлена ссылка "Browse our complete catalog"
3. **HeroCms.tsx** — закомментирована форма поиска (используется для `hero_full` секций)
4. **SearchHero.tsx** — закомментирована форма поиска, добавлена кнопка "Browse Full Catalog"
5. **CompactSearchHero.tsx** — закомментирована форма поиска, добавлена кнопка "Browse Full Catalog"
6. **QuickSearch.tsx** — закомментирована форма поиска, добавлена кнопка "Browse Full Catalog"
7. **QuickSearchCms.tsx** — закомментирована форма поиска, добавлена кнопка "Browse Full Catalog"
8. **SimpleSearch.tsx** — закомментирована форма поиска, добавлена кнопка "Browse Full Catalog"

**Как вернуть поиск обратно**:
1. Найти все TODO комментарии с текстом "Uncomment when catalog is ready"
2. Раскомментировать закомментированные формы поиска (убрать `/*` и `*/`)
3. Удалить временные кнопки "Browse Full Catalog" и "Browse Catalog"
4. Настроить функциональность поиска для работы с каталогом
5. Протестировать все поисковые формы

**Файлы для изменения**:
- `src/components/layout/Header.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/HeroCms.tsx`
- `src/components/sections/SearchHero.tsx`
- `src/components/sections/CompactSearchHero.tsx`
- `src/components/sections/QuickSearch.tsx`
- `src/components/sections/QuickSearchCms.tsx`
- `src/components/sections/SimpleSearch.tsx`

**Дополнительно исправлено**:
- Добавлены недостающие формы редактирования для `search_hero` и `compact_search_hero` секций в админке
- `src/app/admin/pages/[slug]/sections/SearchHeroForm.tsx` — новая форма
- `src/app/admin/pages/[slug]/sections/CompactSearchHeroForm.tsx` — новая форма
- `src/app/admin/sections/[id]/page.tsx` — добавлена обработка новых типов секций
- Подключены формы редактирования для `filter_types_grid` и `popular_filters` секций (заголовок и описание)
- Улучшен лейаут админки — создан `AdminContainer` компонент с шириной `max-w-7xl` для больших мониторов
- Обновлены ВСЕ страницы админки для использования нового широкого лейаута
- Проверен компонент `SimpleSearch` — полностью готов для редактирования в админке
- Обновлен `FilterTypesGrid` — изменено количество колонок с 6 на 7 для больших экранов
- Обновлен `.gitignore` — добавлены все Terraform/OpenTofu локальные файлы

### CI/CD (ручной запуск)
- Сборка образа и выгрузка статики: GitHub Actions → “CI - Build and Push to ECR”
  - inputs: `version` (обяз.), `static_bucket` (по умолчанию `surefilter-static-prod`), `invalidate` (true/false)
  - шаги: build image → push ECR → extract `/app/.next/static` и `/app/public` → upload в S3 → (опц.) invalidate CF
- База данных: “DB - Prisma Migrate Deploy”, “DB - Restore from Repo Dump”

### Админ-панель и CMS
- База данных и Prisma:
  - Модели `SpecParameter` и `ProductSpecValue` добавлены в схему Prisma; связи с `Product` настроены.
  - Схема синхронизирована (`prisma db push`), клиент сгенерирован в `src/generated/prisma`.
- Быстрый тест:
  - Создайте несколько параметров в `/admin/spec-parameters`.
  - Создайте/отредактируйте продукт в `/admin/products/new` или `/admin/products/[id]` и заполните спецификации.

### CMS & Admin updates (2025-08-25)
- **Generic CMS routing**: `src/app/(site)/[slug]/page.tsx` рендерит верхнеуровневые страницы из CMS по `slug` и формирует метаданные из SEO полей страницы.
  - Для многоуровневых страниц используется `src/app/(site)/[...slug]/page.tsx`; в dev временно используется некешированная загрузка `loadPageBySlug`.
- **Admin Pages**:
  - **Создание страницы** в модальном окне: `slug`, `title`, `description`, `ogImage`.
  - **Редактирование slug** в блоке SEO на странице редактирования.
  - **Удаление страницы**: доступно только для незашищённых слегов; для защищённых кнопка отключена.
  - **Хелперы**: `src/lib/pages.ts` — `RESERVED_SLUGS`, `isProtectedSlug`, `isValidNewSlug`.
- **Industries**:
  - Новый раздел `/admin/industries` — список страниц с `type=INDUSTRY`, кнопка “New industry page” (префикс `industries/`).
  - Редактор секций доступен универсально по `admin/sections/{id}`.
  - Динамический список на `/industries` рендерится секцией `industries_list` из страниц `type=INDUSTRY` c их `industry_meta` (title/description/image/popularFilters). Компонент `IndustriesCms` подтягивает данные из БД.
  - Добавлены секции: `compact_search_hero`, `simple_search`, `popular_filters`, `related_filters`.
- **Filter Types**:
  - БД: `FilterCategory` (HEAVY_DUTY, AUTOMOTIVE), `FilterType` (иерархия, fullSlug, pageSlug).
  - Админка: `/admin/filter-types` (списки по категориям), создание типов, быстрые ссылки “Edit page content” на страницы типов, карточки для редактирования лендингов категорий `/heavy-duty`, `/automotive`.
  - Сидинг: верхнеуровневые типы для обеих категорий; автосоздание CMS‑страниц с базовым Hero для каждого типа; страницы типов скрыты из общего списка Pages.

- **Heavy Duty**:
  - Страница `/heavy-duty` рендерится из CMS; добавлены секции `search_hero` и `filter_types_grid`, перенесён контент из статической версии.
- **Новые секции и формы**:
  - About: `manufacturing_facilities`, `our_company` (без поля `image`), `stats_band`, `awards_carousel`.
  - Contact: `contact_hero`, `contact_options`, `contact_form_info`.
  - Industries: `industries_list`, `industry_meta`, `compact_search_hero`, `simple_search`, `popular_filters`, `related_filters`.
- **Кеш/инвалидация**: все CRUD‑эндпойнты админки вызывают `revalidateTag('page:{slug}')`.
- **Сидинг**: `npm run seed:content` (без перезаписи) и `SEED_FORCE_UPDATE=1 npm run seed:content` (форс‑обновление). Обновлён `seed_content.mjs` для новых секций и очистки устаревших контактных блоков при наличии `contact_form_info`.
- **Изображения**: `next.config.ts` — добавлен `http://localhost:3000` в `images.remotePatterns` для dev.

### CMS & Admin updates (2025-08-26)
- **Замена industry_meta на listing_card_meta**
  - Универсальная мета‑секция для карточек списков: `listing_card_meta` (title/description/image/popularFilters).
  - Полный отказ от `industry_meta` в коде и БД. Добавлены миграции для конвертации и очистки enum.
  - Формы и рендереры обновлены; Add Section предлагает "Listing Card Meta (for list cards)".
- **Related Filters (переработка)**
  - Вернули исходный UI‑карусель и сделали серверный враппер `FilterTypesCms`, который подтягивает список типов фильтров по категории.
  - Заголовок/описание/иконка карточек берутся из страниц типов через `listing_card_meta` (fallback не нужен).
  - Категория определяется по полю секции или автоматически по slug страницы (`/heavy-duty*` → HEAVY_DUTY, `/automotive*` → AUTOMOTIVE).
- **Admin UX**
  - Кнопка удаления секции возвращена в универсальный редактор `/admin/sections/[id]`. Back‑ссылка ведёт на страницу‑родителя.
  - Добавление секции теперь показывает текст ошибки из API и при успехе перекидывает сразу в редактор новой секции.
- **API и валидация**
  - `POST /api/admin/pages/[...slug]`: добавлена защита/сообщения об ошибках, возвращает `{ id }` новой секции.
  - Разрешены многоуровневые слеги с префиксами `heavy-duty`/`automotive`; обновлена валидация при обновлении slug.
  - Единый маршрут для reorder через `PUT action=reorder`.
- **Страницы типов фильтров**
  - Сидинг: для верхнеуровневых типов добавлены иконки, связка `FilterType.pageSlug`, создание `listing_card_meta` на страницах типов.
  - Обновлены страницы `heavy-duty/oil` и `heavy-duty/air`: добавлены все секции (hero, контент, popular/related, search, industries), рендерятся из CMS.
- **Миграции (Prisma/Postgres)**
  - `20250826080000_drop_industry_meta` — конвертация данных и пересоздание enum без `industry_meta`.
  - `20250826090000_add_listing_and_convert` — гарантия наличия `listing_card_meta` и финальная конвертация остатков.
  - После миграций требуется перезапуск dev‑сервера и `npx prisma generate`.

### Обновления (2025-12-05)
- **Динамический рендеринг**:
  - ✅ Добавлен `export const dynamic = 'force-dynamic'` в root layout
  - ✅ Убрано дублирование из 9 страниц
  - ✅ Удалена дублирующаяся страница `/app/(public)/page.tsx`
  - ✅ Build проходит без DATABASE_URL (не требуется для динамических страниц)
- **Site Settings**:
  - ✅ Убраны статические дефолтные данные из кода
  - ✅ Все данные берутся из БД с кэшем 1 минута
  - ✅ Автоматический сброс кэша при обновлении через админку
  - ✅ При первом запуске админка создает дефолтные настройки
- **CloudFront оптимизация**:
  - ✅ 404 errors кэшируются только 10 секунд (было: долго)

### Обновления (2025-12-07) - Catalog Admin Panel
- **✨ Полная переработка админки каталога продуктов**:
  - ✅ Нормализованная схема БД (убраны все JSON поля)
  - ✅ Поддержка ACES/PIES экспорта (коды для брендов и параметров)
  - ✅ 25 API endpoints для CRUD операций
  - ✅ 15 admin страниц с современным UI
  - ✅ 4 переиспользуемых компонента

- **Новые модели БД**:
  - ✅ `Brand` - бренды с логотипами и ACES кодами
  - ✅ `ProductCategory` - категории (заменили enum)
  - ✅ `ProductFilterType` - типы фильтров (Air, Oil, Fuel и т.д.)
  - ✅ `SpecParameter` - параметры спецификаций с кодами
  - ✅ `ProductCategoryAssignment` - many-to-many с Primary флагом
  - ✅ `ProductSpecValue` - нормализованные спецификации
  - ✅ `ProductMedia` - изображения с Primary и ordering
  - ✅ `ProductCrossReference` - OEM номера и кросс-ссылки

- **Функции админки**:
  - ✅ Categories: CRUD, поиск, фильтрация, emoji иконки
  - ✅ Brands: CRUD, MediaPicker для логотипов, website links
  - ✅ Spec Parameters: CRUD, группировка по категориям, unit override
  - ✅ Product Filter Types: CRUD, иконки, ACES коды, защита от удаления
  - ✅ Products: полная форма с секциями (basic info, categories, specs, media, cross-refs)
  - ✅ Real-time поиск и фильтрация
  - ✅ Drag & drop ordering для изображений
  - ✅ Toggle Active/Inactive
  - ✅ Счетчики использования

- **Документация**:
  - 📚 `CATALOG_ADMIN_COMPLETE.md` - полная документация
  - 🚀 `CATALOG_QUICK_START.md` - быстрый старт
  - 📋 `CATALOG_SCHEMA_REDESIGN.md` - описание схемы БД
  - 🔄 `CATALOG_MIGRATION_GUIDE.md` - руководство по миграции
  - ✅ Предотвращает проблемы с "Image not found" для новых файлов
- **Footer улучшения**:
  - ✅ Добавлены иконки: Twitter, Instagram, YouTube, TikTok
  - ✅ TikTok добавлен в админку
  - ✅ Убрано дублирование fallback данных
- **Dockerfile**:
  - ✅ Убран placeholder DATABASE_URL (не нужен для dynamic pages)
  - ✅ Чистый build без warnings
- **Документация**:
  - ✅ Создан `TODO.md` с roadmap
  - ✅ Обновлен `README.md`

### Обновления (February 20, 2026) - Analytics, SEO/GEO, News Settings

- **📊 Google Analytics 4 & Tag Manager**:
  - ✅ `@next/third-parties/google` — GA4 + GTM в root layout
  - ✅ GA Measurement ID и GTM Container ID из админки (не env)
  - ✅ Секция "Analytics & Tag Manager" в Site Settings
  - ✅ Client-side хелперы в `src/lib/analytics.ts`
  - ✅ Предупреждение о дублировании при одновременном использовании GA + GTM

- **🔍 Dynamic SEO/GEO Files**:
  - ✅ `src/app/robots.ts` — динамический robots.txt (Next.js Metadata API)
  - ✅ `src/app/sitemap.ts` — sitemap.xml из БД (pages, products, news, resources)
  - ✅ `src/app/llms.txt/route.ts` — llms.txt (формат llmstxt.org)
  - ✅ `src/app/llms-full.txt/route.ts` — расширенная версия с продуктами/новостями
  - ✅ Удален статический `public/robots.txt`
  - ✅ Секция "SEO & LLM" в админке (блокировка краулеров + описание для LLM)

- **📰 News Article Page Settings**:
  - ✅ Настраиваемые hero для `/newsroom/[slug]` (title, description, image)
  - ✅ Отдельные настройки для News Articles и Events

- **🗄️ Новые поля SiteSettings**:
  - `gaMeasurementId`, `gtmId` — Analytics
  - `seoRobotsBlock`, `llmsSiteDescription` — SEO
  - `newsArticleTitle`, `newsArticleDescription`, `newsArticleHeroImage` — News
  - `eventArticleTitle`, `eventArticleDescription`, `eventArticleHeroImage` — Events

---

### Обновления (January 16, 2026) - Product Pages Integration

- **✨ Публичные страницы продуктов `/products/[code]`**:
  - ✅ Интеграция с каталогом производителя SURE FILTER
  - ✅ HTML парсинг через JSDOM → структурированные данные
  - ✅ ISR кэширование (24 часа)
  - ✅ SEO оптимизация с Open Graph images
  - ✅ Три сценария: Full page / Coming Soon / Error
  - ✅ Loading states с skeleton UI

- **🔗 Условные ссылки в каталоге**:
  - ✅ `CatalogClient.tsx` - Gallery & List режимы
  - ✅ `FeaturedProductsCatalogCms.tsx` - Featured products
  - ✅ `PopularFiltersCatalogCms.tsx` - Popular filters
  - ✅ Автоматическая проверка `manufacturerCatalogUrl`
  - ✅ Disabled состояние без визуальных отличий

- **🗄️ База данных**:
  - ✅ `Product.name` теперь опциональное (code - главный идентификатор)
  - ✅ `Product.manufacturerCatalogUrl` для интеграции
  - ✅ Миграции: `add_manufacturer_catalog_url`, `make_product_name_optional`

- **📦 Зависимости**:
  - ✅ `jsdom` 25.x - парсинг HTML
  - ✅ `@types/jsdom` 21.x - TypeScript типы

- **📚 Документация**:
  - ✅ [CATALOG_INTEGRATION.md](./CATALOG_INTEGRATION.md) - Интеграция каталога
  - ✅ [PRODUCT_PAGES.md](./PRODUCT_PAGES.md) - Публичные страницы

- **🎨 Стилевые улучшения**:
  - ✅ `CompactSearchHero` - увеличена высота (50vh)
  - ✅ Унифицировано затемнение (bg-black/65)
  - ✅ Убраны тени для flat design
  - ✅ Единая ширина borders (1px)

---

### Обновления (2025-12-07) - Prisma 7 Migration

- **✨ Успешное обновление на Prisma ORM 7.1.0**:
  - ✅ Node.js обновлен до v20.19.6 (latest LTS в ветке 20.x)
  - ✅ Prisma 7.1.0 с PostgreSQL driver adapter (@prisma/adapter-pg)
  - ✅ Все TypeScript ошибки исправлены (Next.js 15 params Promise)
  - ✅ Build проходит без warnings

- **Изменения в конфигурации**:
  - ✅ `prisma.config.ts` - новый конфиг файл в корне проекта для CLI операций
  - ✅ `schema.prisma` - убран `url` из datasource (теперь в config)
  - ✅ `lib/prisma.ts` - использует PrismaPg adapter с connection pool
  - ✅ `next.config.ts` - serverExternalPackages для pg, pg-native в alias
  - ✅ API routes - используют shared prisma instance (8 файлов обновлено)
  - ⚠️ **ВАЖНО:** `prisma.config.ts` должен быть в корне проекта, не в `prisma/`

- **Docker и CI/CD**:
  - ✅ `Dockerfile` - копирует prisma.config.ts, генерирует client
  - ✅ `db-migrate.yml` - добавлен шаг генерации Prisma Client
  - ✅ Готово к production deploy

- **Преимущества Prisma 7**:
  - 🚀 До 3x быстрее queries
  - 📦 ~90% меньше bundle size
  - 🔧 Упрощенный deployment
  - 🔒 Лучшая безопасность через driver adapters

---

## 📚 Документация

Полная документация проекта доступна в папке `docs/`:

- **[docs/README.md](./docs/README.md)** - 📖 Индекс всей документации (начните отсюда!)
- **[CHANGELOG.md](./CHANGELOG.md)** - 📝 История изменений
- **[ROADMAP.md](./ROADMAP.md)** - 🗺️ Планы развития
- **[STATUS.md](./STATUS.md)** - ✅ Текущий статус CMS миграции
- **[TODO.md](./TODO.md)** - 📋 Активные задачи
- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - 🔧 Технический долг
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 🚀 Процесс деплоя

### Руководства и гайды

- **[docs/GUIDES.md](./docs/GUIDES.md)** - Настройка окружения, инструменты
- **[docs/FORMS.md](./docs/FORMS.md)** - Система форм
- **[surefilter-ui/docs/SHARED_SECTIONS.md](./surefilter-ui/docs/SHARED_SECTIONS.md)** - CMS система
- **[infra/README.md](./infra/README.md)** - Инфраструктура (OpenTofu, AWS)

---

## 🔄 Shared Sections и Page-Level Overrides

### Shared Sections
Shared Sections позволяют использовать один и тот же контент на нескольких страницах:
- Создаются в `/admin/shared-sections`
- Добавляются на страницы через "Add Section" → "Use Shared Section"
- Изменения в Shared Section автоматически применяются ко всем страницам

### Page-Level Overrides
Для некоторых компонентов можно переопределить отдельные поля на конкретной странице:

**Industry Showcase:**
- ✅ `industryTitleOverride` - кастомный заголовок для страницы
- ✅ `industryDescriptionOverride` - кастомное описание для страницы
- Остальные поля (brandPromise, keyFeatures, metrics) остаются общими

**Как использовать:**
1. Добавьте Shared Section на страницу
2. Откройте секцию через `/admin/sections/{id}`
3. Увидите блок "Page-Specific Customization"
4. Включите нужные overrides и сохраните

**Преимущества:**
- Общий контент остается синхронизированным
- Можно адаптировать заголовок/описание под контекст страницы
- Легко вернуться к shared версии

---

## 🚀 Деплой и инфраструктура

### CI/CD Pipeline

**GitHub Actions Workflows:**

1. **ci-build-push.yml** - Сборка и публикация Docker образа
   - Триггер: push в main или manual dispatch
   - Создает версионированный образ (v0.0.X)
   - Публикует в AWS ECR
   - Требует ручного обновления `infra/envs/prod/app-runner.tf`

2. **static-upload.yml** - Загрузка статики на S3
   - Триггер: manual dispatch (после сборки образа)
   - Извлекает `/_next/static/*` из Docker образа
   - Загружает на S3 bucket `surefilter-static-prod`
   - Опционально: CloudFront invalidation
   - ⚠️ **ВАЖНО:** Запускать после каждого деплоя нового образа!

3. **db-migrate.yml** - Миграции базы данных
   - Триггер: manual dispatch
   - Запускает Prisma migrations в production

### Архитектура продакшена

```
CloudFront (new.surefilter.us)
├── Default: App Runner (SSR, no cache)
├── /_next/static/*: S3 (1 year TTL, immutable)
└── /_next/image*: App Runner (image optimization)
```

**Компоненты:**
- **App Runner**: Docker контейнер с Next.js app
- **S3**: Статические файлы (JS, CSS, fonts)
- **CloudFront**: CDN + SSL (ACM certificate)
- **RDS PostgreSQL**: База данных
- **ECR**: Docker registry

### Процесс деплоя

1. **Коммит и пуш в main**
   ```bash
   git add .
   git commit -m "feat: описание изменений"
   git push origin main
   ```

2. **CI автоматически собирает образ** (v0.0.X)

3. **Обновить версию в Terraform**
   ```bash
   # Редактировать infra/envs/prod/app-runner.tf
   image_identifier = "...ecr.../surefilter:v0.0.X"
   ```

4. **Применить Terraform**
   ```bash
   cd infra/envs/prod
   tofu plan
   tofu apply
   ```

5. **Загрузить статику на S3** (через GitHub Actions UI)
   - Workflow: "Static - Upload to S3"
   - Параметры: version=v0.0.X, invalidate=true

6. **Очистить CloudFront кеш** (если нужно)
   ```bash
   aws cloudfront create-invalidation \
     --profile surefilter-local \
     --distribution-id E1TEXCEJ38G3RE \
     --paths "/*"
   ```

### Полезные команды

**Проверить статус деплоя:**
```bash
aws apprunner list-operations \
  --profile surefilter-local \
  --service-arn $(cd infra/envs/prod && tofu output -raw service_arn)
```

**Посмотреть логи App Runner:**
```bash
# Через AWS Console -> App Runner -> surefilter-prod -> Logs
```

**Список файлов на S3:**
```bash
aws s3 ls s3://surefilter-static-prod/_next/static/ \
  --profile surefilter-local \
  --recursive | head -20
```

### Известные проблемы

1. **Статика не обновляется после деплоя**
   - Причина: Забыли запустить static-upload.yml
   - Решение: Запустить workflow с нужной версией

2. **Изменения не видны на сайте**
   - Причина: CloudFront кеш
   - Решение: Создать invalidation (см. команду выше)

3. **App Runner не стартует**
   - Проверить логи в AWS Console
   - Проверить DATABASE_URL и другие secrets в SSM Parameter Store