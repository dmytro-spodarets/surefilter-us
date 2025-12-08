# CHANGELOG

Правила ведения истории изменений проекта.

### Как писать записи
- Формат: `YYYY-MM-DD — короткое описание изменения одной строкой`
- Язык: коротко и по делу, без подробностей реализации
- Каждая запись — новая строка, последние изменения добавляем выше

### Пример
- 2025-01-20 — Обновлён README, вынесены ROADMAP и CHANGELOG
- 2025-01-18 — Добавлена секция WhyChoose на главной странице
- 2025-01-15 — Настроена оптимизация изображений (Unsplash, WebP)

### История
- 2025-12-07 — Обновление на Prisma 7.1.0: Node.js 20.19.6, PostgreSQL driver adapter (@prisma/adapter-pg), prisma.config.ts в корне проекта для CLI, убран url из schema.prisma, shared prisma instance в API routes, обновлены Dockerfile и GitHub Actions workflows, build без warnings
- 2025-11-18 — Hero Carousel: исправлена логика loop mode (требуется минимум 3 слайда, автоматическое отключение при 1-2 слайдах), оптимизирован autoplay (3sec вместо 5sec), убрана пауза при наведении мыши, исправлена TypeScript ошибка с loading prop, production build успешен
- 2025-11-18 — Hero Carousel: добавлен HeroCarouselCms компонент с Swiper.js (slide transitions, autoplay, loop, navigation arrows, pagination dots, keyboard support, touch/swipe на мобильных, accessibility), админ-форма с управлением слайдами (вверх/вниз), настройки autoplay/navigation/pagination, поддержка prefers-reduced-motion
- 2025-11-18 — Консолидация Header/Footer компонентов: оставлены 2 основных (Header и Footer как Server Components), Header разделён на sub-components (ScrollHeader, HeaderNav, MobileMenu), все публичные страницы конвертированы в Server Components для SEO, удалены дублирующие компоненты
- 2025-11-18 — Оптимизация архитектуры Resources: страница /resources/[slug] переведена на Server Component с Client sub-component для формы, удалена статичная страница /resources/heavy-duty-catalog (весь функционал через админку), карточки ресурсов полностью кликабельны с hover эффектами
- 2025-11-01 — Site Settings система: управление Header Navigation и Footer через админку, настройки Special Pages (Newsroom/Resources hero и SEO), отдельные кнопки сохранения для каждой секции, данные автоматически загружаются в Header/Footer компоненты
- 2025-10-28 — Система News и Events: единая модель с полем type (NEWS/EVENT), категории новостей, TinyMCE редактор для контента, featured events на главной странице, автоматическая загрузка последних новостей в AboutNewsCms, публичная страница /newsroom с каруселью событий и списком новостей
- 2025-10-26 — Универсальная система форм (Universal Forms System): конструктор форм с 7 типами полей, drag-and-drop, webhook интеграция с retry логикой, экспорт в CSV, встраивание через CMS, система Resources с категориями и gated downloads через формы, улучшенная навигация админки с dropdown меню и breadcrumbs
- 2025-10-20 — Оптимизация изображений: shimmer placeholders, priority loading для hero, оптимизированные sizes для всех Image компонентов, автоматическое сжатие при загрузке (1MB max, 2048px), preload логотипа
- 2025-10-20 — Замена всех `<img>` на Next.js Image компонент: PopularFilters, ManufacturingFacilities, AwardsCarousel, ContactHero (WebP/AVIF, lazy loading, responsive)
- 2025-10-20 — Новый CMS компонент FilterTypesImageGrid с изображениями вместо иконок: 16:9 формат, прижатие к низу, hover подчеркивание, настраиваемые колонки (2-8) и варианты стиля (card/simple)
- 2025-10-20 — Улучшения CMS компонентов: WhyChooseCms (flexbox центрирование последней строки), FeaturedProductsCms (категория поверх изображения)
- 2025-10-20 — Очистка кодовой базы: удалены 6 дублирующихся компонентов (Hero, AboutNews, QuickSearch, FeaturedProducts, WhyChoose, Industries), оставлены только CMS версии
- 2025-10-20 — Исправления изображений: добавлен getAssetUrl для правильных путей к CDN во всех CMS компонентах (IndustriesCms, IndustriesList, PopularFilters и др.)
- 2025-10-20 — Исправление сборки: страница /industries/agriculture переведена на dynamic rendering из-за использования БД запросов
- 2025-09-23 — Полная система управления файлами: S3/MinIO интеграция, папки с вложенностью, превью изображений/видео/PDF, копирование CDN ссылок для контента
- 2025-09-10 — Прод: домен `new.surefilter.us` через CloudFront+ACM+Route53, канонический домен (middleware) и защита origin заголовком; статика вынесена в S3+CloudFront
- 2025-09-10 — CI: сборка и публикация образа с input `version`; извлечение статики из образа и выгрузка в S3; опциональная инвалидация CloudFront
- 2025-09-10 — DB: добавлены workflows `DB - Prisma Migrate Deploy` и `DB - Restore from Repo Dump`; миграции запускаются вручную, восстановление из локального дампа поддержано
- 2025-09-10 — Infra: ECR репозиторий, App Runner сервис, RDS PostgreSQL (public, minimal), SSM параметры (`/surefilter/DATABASE_URL`, `/surefilter/NEXTAUTH_SECRET`, `/surefilter/ORIGIN_SECRET`)
- 2025-09-10 — Безопасность: Dockerfile обновлён (apt-get upgrade) для закрытия CVE (pam), URL‑эскейп пароля в `DATABASE_URL`
- 2025-09-04 — Добавлена админ‑панель для параметров спецификаций продуктов; редактор спецификаций в ProductForm; API продуктов принимает/сохраняет specValues и возвращает их; Prisma схема синхронизирована и клиент сгенерирован
- 2025-08-26 — Полный переход на listing_card_meta вместо industry_meta (миграции, формы, рендер); возвращена кнопка удаления секций в универсальном редакторе
- 2025-08-26 — Related Filters: сохранён исходный дизайн, авто-наполнение по категории через FilterTypesCms; мета карточек берётся из listing_card_meta
- 2025-08-26 — Админка: улучшено добавление секций (ошибки API и редирект на редактор новой секции)
- 2025-08-26 — Валидация слугов: разрешены многоуровневые слуги с префиксами heavy-duty/automotive (создание/обновление)
- 2025-08-25 — Heavy Duty страница переведена на CMS: добавлены секции search_hero и filter_types_grid; рендер страницы из CMS; сидинг контента
- 2025-08-25 — Секция Industries (CMS) стала динамической: `IndustriesCms` подтягивает список INDUSTRY‑страниц и их `industry_meta` из БД
- 2025-08-25 — Категории/типы фильтров: добавлены модели FilterCategory/FilterType; раздел админки /admin/filter-types; сид верхнеуровневых типов; автосоздание CMS‑страниц для каждого типа; страницы типов скрыты из общего списка Pages
- 2025-08-25 — Индустрии в CMS: добавлены секции compact_search_hero, simple_search, popular_filters, related_filters; industries_list рендерит список из INDUSTRY‑страниц по их industry_meta; формы в админке
- 2025-08-25 — Админка: раздел /admin/industries (список INDUSTRY‑страниц), редактор секций по id /admin/sections/[id]; единый catch‑all API /api/admin/pages/[...slug] с POST (добавление секции) и PUT action=reorder; удалены дублирующие одиночные роуты
- 2025-08-25 — Роутинг сайта: catch‑all /(...)/[...slug] рендерит CMS‑страницы, временно использует некешированный загрузчик для dev; исправлен рендер compact_search_hero
- 2025-08-25 — Конфиг изображений: next.config.ts разрешает http://localhost:3000 для next/image
- 2025-08-25 — Подключена страница Contact Us к CMS; добавлены секции contact_hero, contact_options, contact_form_info; формы в админке; рендерер; сидинг
- 2025-08-25 — Добавлен роут для верхнеуровневых CMS‑страниц `/(site)/[slug]` с рендером секций и метаданными
- 2025-08-25 — Админка: модальное создание страниц, редактирование slug, удаление страниц; защита от удаления core‑страниц; список защищённых слегов
- 2025-08-25 — Обновлён сидер и AddSectionForm: актуальные типы секций, удалены legacy‑контактные блоки при наличии contact_form_info; валидация и revalidateTag в API
- 2025-08-25 — Подключена страница About Us к CMS; добавлены типы секций page_hero, about_with_stats, content_with_images, quality_assurance; формы в админке; сидинг контента
- 2025-08-21 — Внедрён CMS для главной страницы: секции hero_full, featured_products, why_choose, quick_search, industries, about_news; добавлена админка страниц/секций, порядок секций, рендер на сервере, кеширование с revalidateTag
- 2025-08-20 — Добавлена Docker-конфигурация Postgres (docker-compose), пример env; переход на единый глобальный .gitignore
- 2025-08-11 — Восстановлен и расширен раздел «Как вести разработку», дополнена структура и разделы README без удаления существующего
- 2025-08-10 — Добавлены страницы filters/[code] и catalog, компоненты ProductGallery/ProductSpecs/ContactOptions/Pagination; обновлён CTA на главной; обновлены README/ROADMAP
- 2025-08-10 — README разделён; добавлены ROADMAP.md и CHANGELOG.md; README упрощён и актуализирован
