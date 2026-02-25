# TODO — Sure Filter US

> **Единый документ** для задач, техдолга и планов развития.
> Для быстрой ориентации см. [CLAUDE.md](./CLAUDE.md)

**Последнее обновление:** 25 февраля 2026

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

## Техдолг

### CMS Forms (секции без редакторов)
- [ ] `hero_compact`, `products`, `news_carousel`
- [ ] `product_gallery`, `product_specs`
- [ ] Warranty секции: `warranty_claim_process`, `warranty_promise` (2 из 5, остальные 3 готовы)

### UI/UX
- [ ] ManagedImage: error boundary, onError handler (сейчас только shimmer placeholder, нет retry)
- [ ] Admin: drag-and-drop для секций (сейчас только кнопки вверх/вниз), bulk operations, preview mode
- [ ] Lazy load секций (dynamic imports) — все 40+ секций импортируются статически в renderer

### Swiper Migration
- [ ] HeroCarouselCms — единственный компонент, всё ещё использующий Swiper (swiper/react)
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
- [ ] Web Vitals мониторинг

### Security
- [ ] CSRF protection review
- [ ] Input sanitization audit
- [ ] npm audit регулярный

---

## Бэклог (когда-нибудь)

- Интеграция live chat
- PWA / Service Worker
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
