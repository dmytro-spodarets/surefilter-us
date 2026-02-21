# TODO — Sure Filter US

> **Единый документ** для задач, техдолга и планов развития.
> Для быстрой ориентации см. [CLAUDE.md](./CLAUDE.md)

**Последнее обновление:** 21 февраля 2026

---

## Активные задачи

### Критично (блокирует релиз)

- [ ] **FilterType.category Migration** — использует старый enum вместо relation к `ProductCategory`
  - Временно: `typescript.ignoreBuildErrors: true` в `next.config.ts`
  - Файлы: `api/admin/filter-types/route.ts`, `FilterTypesCms.tsx`, `admin/filter-types/page.tsx`

### Высокий приоритет

- [ ] **Image Optimization при загрузке** — предварительная оптимизация вместо динамической
  - Sharp для resize/WebP
  - Размеры: 320px, 768px, 1920px, original
  - Интеграция в File Manager API

- [ ] **Активация поиска** — временно отключен для Phase 1
  - Компоненты: Header, HeroCms, SearchHero, CompactSearchHero, QuickSearchCms, SimpleSearch
  - TODO-маркер: `TODO: Uncomment when catalog is ready`

---

## Техдолг

### Swiper Migration (карусели)
- [x] HeroCarouselCms — завершено
- [ ] AwardsCarousel — кастомная реализация (medium priority)
- [ ] NewsroomClient Events — кастомная реализация (medium priority)
- [ ] RelatedFilters — оценить после миграции других (low priority)

### CMS Forms (секции без редакторов)
- [ ] `hero_compact`, `page_hero_reverse`, `products`, `news_carousel`
- [ ] `product_gallery`, `product_specs`
- [ ] Warranty секции (5 штук) — low priority

### Database Cleanup
- [x] ~~fullSlug~~ — удалено, используется pageSlug
- [ ] FilterType.name — дублирует Page.title, рассмотреть удаление

### UI/UX
- [ ] ManagedImage: error boundary, retry логика
- [ ] Admin: drag-and-drop для секций, bulk operations, preview mode
- [ ] Lazy load секций (dynamic imports)

---

## Инфраструктура

### Завершено
- [x] CI/CD (GitHub Actions)
- [x] CloudFront + ACM для `new.surefilter.us`
- [x] Static Upload Workflow
- [x] Image optimization pipeline
- [x] Admin action logging (`/admin/logs`)
- [x] ISR + CloudFront кэширование (on-demand invalidation)
- [x] CloudFront gzip/brotli compression
- [x] Чистые Docker билды (Prisma build-time stub)

### В планах
- [ ] S3 OAC вместо OAI (SigV4)
- [ ] VPC Connector для App Runner (закрыть публичный RDS)
- [ ] WAF и логи CloudFront
- [ ] Rate limiting для admin API

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
<summary>Декабрь 2025 - Январь 2026</summary>

### Image Optimization
- ✅ Shimmer placeholders (ManagedImage)
- ✅ Priority loading для hero (LCP -28%)
- ✅ Responsive sizes (трафик -40-50%)
- ✅ Auto compression при загрузке
- ✅ CloudFront cache (1 год TTL)

### CMS & Components
- ✅ FilterTypesImageGrid (16:9, Flexbox)
- ✅ WhyChooseCms (центрирование)
- ✅ FeaturedProductsCatalogCms
- ✅ PopularFiltersCatalogCms
- ✅ Product Pages (`/products/[code]`)
- ✅ Resource Preview System
- ✅ HeroCarouselCms (Swiper.js)
- ✅ Shared Sections система
- ✅ Industry Showcase overrides

### Infrastructure
- ✅ Prisma 7 Migration
- ✅ Catalog Integration
- ✅ Admin Logging System

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

</details>
