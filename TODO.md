# TODO — Sure Filter US

> **Единый документ** для задач, техдолга и планов развития.
> Для быстрой ориентации см. [CLAUDE.md](./CLAUDE.md)

**Последнее обновление:** 25 февраля 2026 (+ dropdown nav, mobile UX, IndustriesList)

---

## Активные задачи

### Критично (блокирует релиз)

- [ ] **FilterType.category Migration** — схема исправлена (relation к `ProductCategory`), но код API/админки использует workarounds
  - Временно: `typescript.ignoreBuildErrors: true` в `next.config.ts`
  - `api/admin/filter-types/route.ts` — всё ещё кастит к enum `'HEAVY_DUTY' | 'AUTOMOTIVE'`, TODO-маркер в коде
  - `admin/filter-types/page.tsx` — фильтрует по pageSlug паттерну вместо category relation
  - Нужно: обновить API для query по `category.id`, рефакторинг админки, убрать `ignoreBuildErrors`

### Высокий приоритет

- [ ] **Активация поиска** — временно отключен для Phase 1
  - Компоненты: Header, HeroCms, SearchHero, CompactSearchHero, QuickSearchCms, SimpleSearch
  - TODO-маркер: `TODO: Uncomment when catalog is ready`

---

## Мобильная оптимизация (аудит февраль 2026)

> Комплексный аудит всех 53+ секций, layout-компонентов, UI-примитивов и форм.
> Проверка на соответствие best practices 2025-2026: Core Web Vitals, WCAG 2.2 AA, modern CSS, mobile UX.
> Приоритеты: 🔴 Высокий, 🟡 Средний, 🟢 Низкий

### 🔴 Высокий приоритет

#### 1. Viewport и Safe Area Insets
- [ ] Добавить `viewport-fit=cover` в viewport meta tag
  - **Где:** `src/components/seo/SEO.tsx` (line 28) или Next.js `metadata.viewport` в `src/app/layout.tsx`
  - **Зачем:** Без этого `env(safe-area-inset-*)` всегда возвращает 0 — контент залезает под Dynamic Island / нотч на iPhone 14-16 Pro
  - **Что сделать:**
    - Изменить viewport: `width=device-width, initial-scale=1.0, viewport-fit=cover`
    - Добавить CSS-утилиты в `globals.css`: `pt-safe`, `pb-safe`, `px-safe` через `env(safe-area-inset-*)`
    - Применить `pt-safe` к `ScrollHeader.tsx` (fixed header, `top-0`)
    - Добавить `<meta name="theme-color" content="#182375">` (sure-blue-900) для окраски адресной строки браузера

#### 2. Hero-секции: `vh` → `dvh`
- [ ] Заменить `vh` на `dvh` (dynamic viewport height) во всех hero-компонентах
  - **Проблема:** `100vh` на мобильных больше видимой области — адресная строка браузера не учитывается, контент обрезается снизу
  - **Файлы для изменения:**
    - `src/components/sections/FullScreenHero.tsx` — `h-[60vh]` → `h-[60dvh]`
    - `src/components/sections/SearchHero.tsx` — `h-[70vh]` / `h-[40vh]` → `h-[70dvh]` / `h-[40dvh]`
    - `src/components/sections/CompactSearchHero.tsx` — `h-[50vh]` → `h-[50dvh]`
    - `src/components/sections/ContactHero.tsx` — `h-[60vh]` → `h-[60dvh]`
    - `src/components/sections/CompactHero.tsx` — `h-[30vh]` → `h-[30dvh]`
  - **Поддержка:** Все современные браузеры с 2023 года

#### 3. Touch Targets ≥ 44px (WCAG 2.2 AA)
- [ ] Увеличить все интерактивные элементы до минимум 44x44px с gap ≥ 8px
  - **Проблемные компоненты:**
    - `src/components/ui/Pagination.tsx` — кнопки `w-8 h-8` (32px) → нужно `w-10 h-10` или `w-11 h-11` + `gap-2`
    - `src/components/layout/Header/MobileMenu.tsx` — гамбургер `p-2` (≈40px) → `p-2.5` или `min-h-[44px] min-w-[44px]`
    - `src/components/sections/ProductGallery.tsx` — thumbnail-кнопки маленькие → добавить `min-h-[44px]`
    - `src/components/sections/FilterTypesGrid.tsx` — clickable area может быть < 44px → добавить padding
  - **Стандарт:** WCAG 2.2 SC 2.5.8 — минимум 24x24px (AA), рекомендация Apple/Google 44-48px

#### 4. Focus-Visible (клавиатурная навигация)
- [ ] Унифицировать focus-стили: убрать голые `focus:outline-none`, добавить `focus-visible:ring-*`
  - **Проблема:** `HeaderNav.tsx` использует `focus:outline-none` **без** замены → клавиатурная навигация визуально невозможна
  - **Что сделать:**
    - Глобально заменить `focus:outline-none` → `focus:outline-none focus-visible:ring-2 focus-visible:ring-sure-red-500 focus-visible:ring-offset-2`
    - Проверить: `HeaderNav.tsx`, `MobileMenu.tsx`, `Button.tsx`, `Pagination.tsx`, `ProductGallery.tsx`
  - **Результат:** Кольцо видно только при Tab-навигации, не при клике мышкой/тачем

#### 5. Skip Navigation Link
- [ ] Добавить "Skip to main content" ссылку для screen readers и клавиатурной навигации
  - **Где:** Первый элемент в `src/app/layout.tsx` (внутри `<body>`)
  - **Реализация:**
    ```
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg">
      Skip to main content
    </a>
    ```
  - Добавить `id="main-content"` на `<main>` в site layout

#### 6. Image `sizes` — аудит корректности
- [ ] Пройтись по всем использованиям ManagedImage и указать точные `sizes` с breakpoints
  - **Проблема:** `ManagedImage.tsx` — default `sizes="100vw"`. Если карточка продукта в сетке 4 колонки — она занимает 25vw на десктопе, но браузер загружает изображение на 100vw (x4 лишний трафик)
  - **Компоненты для аудита:**
    - `FeaturedProductsCms.tsx` — продукты в grid 1/2/3/4 колонки
    - `PopularFilters.tsx` — фильтры в grid 2/3/4/5 колонок
    - `RelatedNews.tsx` — новости в grid 1/2/4 колонки
    - `ManufacturingFacilities.tsx`, `IndustriesCms.tsx`, `IndustriesList.tsx`
  - **Формат:** `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` (пример для 3-колоночной сетки)
  - **Эффект:** Экономия 40-60% трафика изображений на мобильных

#### 7. Skeleton Loading (`loading.tsx`)
- [ ] Создать `loading.tsx` с skeleton-компонентами для ключевых маршрутов
  - **Зачем:** При навигации на `/catalog`, `/products/[code]`, `/newsroom` пользователь видит белый экран
  - **Файлы для создания:**
    - `src/app/catalog/loading.tsx` — скелетон сетки карточек продуктов
    - `src/app/products/[code]/loading.tsx` — скелетон галереи + спецификаций
    - `src/app/newsroom/loading.tsx` — скелетон карточек новостей
    - `src/app/resources/loading.tsx` — скелетон списка ресурсов
  - **Паттерн:** `animate-pulse` на `bg-gray-200` блоках, повторяющих реальный layout
  - **Важно:** Формы скелетонов должны совпадать с реальным контентом — предотвращает CLS

#### 8. Модальные окна: body scroll lock + aria
- [ ] Исправить модальные окна: scroll lock, focus trap, ARIA-атрибуты
  - **Проблемные компоненты:**
    - `src/components/layout/Header/MobileMenu.tsx` — overlay `fixed inset-0`, но body продолжает скроллиться
    - `src/app/resources/[category]/[slug]/ResourceDownloadForm.tsx` — полноэкранный модал без `aria-modal` и `role="dialog"`
  - **Что сделать:**
    - При открытии: `document.body.style.overflow = 'hidden'` (или класс `overflow-hidden`)
    - При закрытии: восстановить overflow + вернуть фокус на триггер-элемент
    - Добавить `role="dialog"` + `aria-modal="true"` + `aria-label`
    - Реализовать focus trap (Tab циклически внутри модала)

### 🟡 Средний приоритет

#### 9. Fluid Typography с `clamp()`
- [ ] Заменить ступенчатые breakpoints на плавное масштабирование через `clamp()`
  - **Проблема:** `text-4xl sm:text-5xl md:text-6xl lg:text-7xl` создаёт резкие скачки размера на границах breakpoints (639→640px)
  - **Замена (примеры):**
    - H1: `text-[clamp(1.75rem,1.25rem+2.5vw,3rem)]` (28px → 48px плавно)
    - H2: `text-[clamp(1.375rem,1rem+1.875vw,2.25rem)]` (22px → 36px)
    - Body: `text-[clamp(1rem,0.95rem+0.25vw,1.125rem)]` (16px → 18px)
  - **Компоненты:** Все hero-секции, заголовки секций, StatsBand, IndustryShowcase
  - **Преимущество:** Лучший UX на планшетах и складных устройствах

#### 10. Container Queries для карточек
- [ ] Перевести переиспользуемые карточки с viewport queries на container queries
  - **Зачем:** Viewport-based breakpoints (`md:`, `lg:`) не работают когда компонент в узком контейнере (sidebar, модал)
  - **Tailwind CSS 4:** Нативная поддержка — `@container` + `@md:`, `@lg:` (без плагина)
  - **Компоненты-кандидаты:**
    - `FeaturedProductsCms.tsx` — карточки продуктов
    - `PopularFilters.tsx` — карточки фильтров
    - `RelatedNews.tsx` — карточки новостей
    - `SidebarWidget.tsx` — виджеты боковой панели
  - **Паттерн:** Обернуть grid в `@container`, заменить `sm:grid-cols-2` → `@sm:grid-cols-2`

#### 11. Auto-hide Header на мобильных
- [ ] Реализовать «hide on scroll down, show on scroll up» для хедера на мобильных
  - **Где:** `src/components/layout/Header/ScrollHeader.tsx`
  - **Проблема:** Header занимает 72-96px (до 15% экрана на мобильных) и всегда видим — потеря пространства при чтении
  - **Реализация:**
    - Отслеживать направление скролла (уже есть scroll listener)
    - Скролл вниз → `transform: translateY(-100%)` + `transition: transform 300ms`
    - Скролл вверх → `transform: translateY(0)`
    - Только на мобильных: `lg:transform-none` (на десктопе хедер всегда виден)
  - **Используют:** Medium, Apple, Airbnb

#### 12. Form UX: autocomplete + mobile keyboard
- [ ] Добавить `autocomplete`, `inputMode`, `enterKeyHint` на формы
  - **Файлы:**
    - `src/components/forms/FormField.tsx` — все типы полей
    - `src/components/sections/ContactForm.tsx` — контактная форма
  - **Что добавить:**
    - `autocomplete="name"` / `"email"` / `"tel"` / `"organization"` — автозаполнение экономит ~60% ввода
    - `inputMode="numeric"` для zip-кода (цифровая клавиатура без стрелок)
    - `enterKeyHint="next"` на промежуточных полях, `enterKeyHint="send"` на последнем
    - Проверить `type="email"` / `type="tel"` — правильная мобильная клавиатура

#### 13. prefers-reduced-motion: granular контроль
- [ ] Заменить глобальный `*` сброс анимаций на точечный контроль через Tailwind `motion-reduce:`
  - **Проблема:** В `globals.css` `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms } }` убивает ВСЕ анимации, включая полезные (loading spinners, form feedback)
  - **Что сделать:**
    - Убрать глобальный `*` сброс
    - Добавить `motion-reduce:transition-none motion-reduce:animate-none` на конкретные анимированные элементы
    - В `HeroCarouselCms.tsx`: проверять `matchMedia('(prefers-reduced-motion: reduce)')` → отключать autoplay Swiper
    - В `AwardsCarousel.tsx`: то же — отключать автопрокрутку
    - Оставить: loading spinners, form success/error анимации

#### 14. Lazy Loading below-the-fold секций
- [ ] Обернуть тяжёлые below-the-fold компоненты в `Suspense` / `next/dynamic`
  - **Связано с:** Техдолг → UI/UX → "Lazy load секций" (уже есть пункт)
  - **Приоритетные компоненты:**
    - `AwardsCarousel.tsx` — клиентский carousel с анимациями
    - `OurCompany.tsx` — клиентский с табами и большим контентом
    - `ProductGallery.tsx` — галерея с множественными изображениями
    - `IndustriesList.tsx` — async DB fetch
  - **Паттерн:** `const Section = dynamic(() => import('./Section'), { loading: () => <SectionSkeleton /> })`
  - **Эффект:** Улучшение INP (Interaction to Next Paint) — меньше JS на main thread при загрузке

#### 15. Swiper → CSS Scroll Snap (HeroCarouselCms)
- [ ] Мигрировать HeroCarouselCms с Swiper.js на нативный CSS Scroll Snap + минимальный JS
  - **Связано с:** Техдолг → Swiper Migration (уже есть пункт)
  - **Мотивация для мобильных:** Swiper ~35KB gzip + 4 модуля → тяжело для INP
  - **Замена:**
    - `flex snap-x snap-mandatory overflow-x-auto` для контейнера
    - `snap-start shrink-0 w-full` для слайдов
    - Autoplay: `setInterval` + `scrollTo` (~2KB JS)
    - Pagination dots: CSS counter + `:target` или минимальный state
    - Navigation arrows: нативные кнопки с `scrollBy`
  - **Нативные жесты:** Свайп работает из коробки без JS
  - **После миграции:** удалить `swiper` из package.json (последний компонент на Swiper)

### 🟢 Низкий приоритет (стратегические)

#### 16. FilterTypesGrid: улучшить grid layout
- [ ] Исправить 7-колоночный grid на промежуточных экранах
  - **Где:** `src/components/sections/FilterTypesGrid.tsx`
  - **Проблема:** `lg:grid-cols-7` на 1024-1100px создаёт элементы ~130px шириной — тесно
  - **Варианты:**
    - `lg:grid-cols-4 xl:grid-cols-7` — более плавная прогрессия
    - `grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))` — автоматическое распределение

#### 17. Dark Mode
- [ ] Добавить поддержку `prefers-color-scheme: dark` (system-based, без переключателя)
  - **Зачем:** Сайт ослепляет белым фоном при включённом тёмном режиме ОС, особенно вечером
  - **Scope (минимальный):**
    - Root: `bg-white dark:bg-gray-900`, `text-gray-900 dark:text-gray-100`
    - Cards: `bg-white dark:bg-gray-800`, `border-gray-200 dark:border-gray-700`
    - Header: `bg-white/95 dark:bg-gray-900/95`
    - Footer: уже тёмный (`bg-gray-900`) — минимальные изменения
    - Product images: контейнер `dark:bg-gray-100` чтобы фото оставались читаемыми
    - Logo: подготовить светлый вариант
  - **Tailwind CSS 4:** Нативная поддержка `dark:` варианта
  - **Сложность:** Высокая — затрагивает все компоненты, нужно тщательное тестирование

#### 18. Variable Fonts через `next/font`
- [ ] Рассмотреть переход с system font stack на variable font (Inter/Geist) через `next/font`
  - **Текущее состояние:** Системные шрифты — 0ms FOIT, но разный вид на разных ОС
  - **Если переходить:**
    - `next/font` self-host'ит шрифт — 0 внешних запросов
    - 1 variable font file вместо 4-7 статических (~55% экономия по размеру)
    - `font-display: swap` автоматически
  - **Решение:** Только если нужен единый фирменный стиль типографики. Системные шрифты — ОК для производительности

#### 19. CSS Scroll-Driven Animations
- [ ] Добавить плавные анимации появления секций при скролле через нативный CSS
  - **Зачем:** Секции появляются мгновенно — сайт выглядит статично для корпоративного уровня
  - **Реализация:**
    ```css
    @supports (animation-timeline: view()) {
      .section-animate {
        animation: fade-slide-in linear;
        animation-timeline: view();
        animation-range: entry 0% entry 100%;
      }
    }
    ```
  - **Fallback:** Без `@supports` — элемент просто виден (progressive enhancement)
  - **Кандидаты:** StatsBand, QualityAssurance, WhyChoose, ManufacturingFacilities
  - **Поддержка:** Chrome/Edge 115+, Safari/Firefox — fallback
  - **Zero JS:** Не влияет на INP

#### 20. Bottom Navigation Bar для мобильных
- [ ] Добавить фиксированную нижнюю панель навигации на мобильных
  - **Зачем:** Гамбургер-меню требует 2 тапа (открыть + выбрать). Исследования Airbnb: +40% скорость навигации с bottom bar
  - **Реализация:**
    - `fixed bottom-0 left-0 right-0 pb-safe` (с safe area inset для home indicator)
    - `lg:hidden` — только на мобильных/планшетах
    - 4-5 пунктов: Home | Catalog | About | Contact (иконки + labels)
    - Active state highlight для текущей страницы
    - `z-40` — ниже header overlay, выше контента
  - **Важно:** Учесть padding `pb-[calc(60px+env(safe-area-inset-bottom))]` на `<main>` чтобы контент не перекрывался
  - **Сложность:** Высокая — нужен дизайн, тестирование на всех размерах, анимации

---

## Техдолг

### CMS Forms (секции без редакторов)
- [ ] `hero_compact`, `products`, `news_carousel`
- [ ] `product_gallery`, `product_specs`
- [ ] Warranty секции: `warranty_claim_process`, `warranty_promise` (2 из 5, остальные 3 готовы)

### UI/UX
- [ ] ManagedImage: error boundary, onError handler (сейчас только shimmer placeholder, нет retry)
- [ ] Admin: drag-and-drop для секций (сейчас только кнопки вверх/вниз), bulk operations, preview mode
- [ ] Lazy load секций (dynamic imports) — все 40+ секций импортируются статически в renderer → см. также **Мобильная оптимизация #14**

### Swiper Migration
- [ ] HeroCarouselCms — единственный компонент, всё ещё использующий Swiper (swiper/react) → см. также **Мобильная оптимизация #15** (CSS Scroll Snap замена)
- После миграции — удалить `swiper` из package.json

---

## Инфраструктура

### Завершено
- [x] CI/CD (GitHub Actions)
- [x] CloudFront + ACM для `new.surefilter.us`
- [x] Static Upload Workflow
- [x] Image optimization pipeline (клиентская компрессия `browser-image-compression`, 1MB max, 2048px)
- [x] Admin action logging (`/admin/logs`)
- [x] ISR + CloudFront кэширование (on-demand invalidation)
- [x] ISR для параметрических роутов (`generateStaticParams` + revalidate re-export)
- [x] CloudFront gzip/brotli compression
- [x] Чистые Docker билды (Prisma build-time stub)

### В планах
- [ ] S3 OAC вместо OAI (SigV4)
- [ ] VPC Connector для App Runner (закрыть публичный RDS)
- [ ] WAF и логи CloudFront
- [ ] Rate limiting для admin API
- [ ] Server-side image resize (Sharp, 320/768/1920px variants) — опционально, оценить необходимость

---

## Мониторинг и качество

### Тестирование
- [ ] E2E тесты (Playwright)
- [ ] Unit tests для утилит
- [ ] Visual regression tests
- [ ] Accessibility audit (axe-core)

### Analytics
- [x] Google Analytics 4 (GA Measurement ID из админки, @next/third-parties/google)
- [x] Google Tag Manager (GTM Container ID из админки)
- [ ] Error tracking (Sentry)
- [ ] Web Vitals мониторинг (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 — актуальные пороги 2026)

### Security
- [ ] CSRF protection review
- [ ] Input sanitization audit
- [ ] npm audit регулярный

---

## Бэклог (когда-нибудь)

- Интеграция live chat
- PWA / Service Worker → связано с **Мобильная оптимизация** (bottom nav, safe areas, theme-color)
- Переключение единиц (mm ↔ in)
- Structured data (JSON-LD) для продуктов
- Per-page SEO meta tags (отдельная задача)

---

## Завершено (архив)

<details>
<summary>Декабрь 2025 - Февраль 2026</summary>

### Image Optimization
- ✅ Shimmer placeholders (ManagedImage)
- ✅ Priority loading для hero (LCP -28%)
- ✅ Responsive sizes (трафик -40-50%)
- ✅ Auto compression при загрузке (browser-image-compression, 1MB max, 2048px)
- ✅ CloudFront cache (1 год TTL)

### CMS & Components
- ✅ FilterTypesImageGrid (16:9, Flexbox)
- ✅ WhyChooseCms (центрирование)
- ✅ FeaturedProductsCatalogCms
- ✅ PopularFiltersCatalogCms
- ✅ Product Pages (`/products/[code]`)
- ✅ Resource Preview System
- ⏳ HeroCarouselCms — всё ещё на Swiper.js (TODO: мигрировать на кастомную реализацию)
- ✅ Shared Sections система
- ✅ Industry Showcase overrides
- ✅ CMS формы: PageHeroReverseForm, LimitedWarrantyDetailsForm, MagnussonMossActForm, WarrantyContactForm

### Swiper Migration (3 из 4 карусели)
- ✅ AwardsCarousel — кастомная реализация (CSS translateX)
- ✅ NewsroomClient Events — кастомная реализация (CSS translateX)
- ✅ RelatedFilters — native scroll-snap
- ⏳ HeroCarouselCms — всё ещё на Swiper (TODO)

### Infrastructure
- ✅ Prisma 7 Migration
- ✅ Catalog Integration
- ✅ Admin Logging System
- ✅ FilterType schema — relation к ProductCategory (код API ещё использует workarounds)

### Database Cleanup
- ✅ fullSlug удалено — используется pageSlug

### Analytics & SEO (February 2026)
- ✅ Google Analytics 4 (@next/third-parties/google)
- ✅ Google Tag Manager
- ✅ Dynamic robots.txt (seoRobotsBlock toggle)
- ✅ Dynamic sitemap.xml (pages, products, news, resources)
- ✅ llms.txt + llms-full.txt (llmstxt.org format)
- ✅ News Article Page Settings (configurable hero)

### Performance & Caching (February 2026)
- ✅ ISR caching (revalidate на публичных страницах)
- ✅ CloudFront on-demand invalidation (invalidatePages utility)
- ✅ CloudFront gzip/brotli compression
- ✅ Admin layout isolation (force-dynamic via server wrapper)
- ✅ Build-time Prisma stub (NEXT_BUILD_SKIP_DB)
- ✅ IAM cloudfront:CreateInvalidation permission
- ✅ Post-deploy warm-up (/api/warm-up + scripts/warm-up.sh)
- ✅ Terraform cycle fix (CLOUDFRONT_DISTRIBUTION_ID → SSM parameter)
- ✅ CloudFront RSC cache key (RSC + Next-Router-Prefetch в cache policy)

### SEO & Redirects (February 2026)
- ✅ URL Redirects management (SiteSettings.redirects JSON, admin UI с CRUD + bulk import)
- ✅ Server component redirect matching (catch-all page, case-insensitive, trailing slash tolerant)
- ✅ permanentRedirect()/redirect() вне try/catch (Next.js бросает специальные ошибки)

### Error Pages & UI Fixes (February 2026)
- ✅ Custom 404 page (not-found.tsx с Header/Footer, SEO noindex+follow)
- ✅ Runtime error boundary (error.tsx, client component, logo + retry)
- ✅ Root layout fallback (global-error.tsx, inline styles, own html/body)
- ✅ PageHero mobile fix (w-full на grid контейнерах, исправлены невидимые картинки)
- ✅ PageHero spacing (фон за хедером через absolute -top-24, responsive padding)

### Admin UX Overhaul (February 2026)
- ✅ Стандартизация лайаутов ~46 админ-страниц (единый p-6, text-2xl font-bold, inline loading spinners)
- ✅ Sign Out + email пользователя в хедере админки (UserMenu, useSession + signOut)
- ✅ Контент ограничен max-w-7xl (как хедер) через AdminClientLayout
- ✅ Удалены breadcrumbs из всех админ-страниц (оставлен только FolderBreadcrumbs в файл-менеджере)
- ✅ AdminContainer упрощён (убран вложенный `<main>` + max-w-7xl → простой `<div className="p-6">`)
- ✅ Созданы страницы /admin/users/new и /admin/users/[id]/edit
- ✅ Удалены /admin/settings/system-health, /admin/settings/debug и 5 API routes
- ✅ Admin Dashboard: 5 виджетов (stats grid, quick actions, content health, recent submissions, recent activity)

</details>
