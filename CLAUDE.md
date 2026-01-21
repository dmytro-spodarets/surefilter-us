# CLAUDE.md - Quick Reference for AI Assistants

> Этот документ создан для быстрой ориентации в проекте Sure Filter US.
> Последнее обновление: 21 января 2026

---

## Обзор проекта

**Sure Filter US** — корпоративный сайт производителя автомобильных фильтров с полнофункциональной CMS системой.

**Технологический стек:**
- **Framework:** Next.js 15.5.7 (App Router, Server Components)
- **React:** 19.0.0
- **Styling:** Tailwind CSS 4.1.11
- **Database:** PostgreSQL + Prisma ORM 7.1.0 (с pg adapter)
- **Storage:** AWS S3 + CloudFront CDN
- **Hosting:** AWS App Runner
- **Auth:** NextAuth.js (credentials)

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
│   │   │   ├── prisma.ts       # Prisma client
│   │   │   ├── assets.ts       # CDN URL helpers
│   │   │   ├── auth.ts         # NextAuth config
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
- `SiteSettings` — глобальные настройки (header, footer)

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

### Админка (`/admin/*`)
- `/admin/pages` — управление страницами
- `/admin/products` — каталог продуктов
- `/admin/news` — новости
- `/admin/resources` — ресурсы
- `/admin/forms` — конструктор форм
- `/admin/files` — файл-менеджер (S3)
- `/admin/settings/site` — настройки сайта
- `/admin/users` — пользователи
- `/admin/logs` — логи действий

---

## Важные API Endpoints

### Публичные
- `GET /api/health` — health check
- `POST /api/forms/[slug]/submit` — отправка формы
- `GET /api/news`, `GET /api/resources`

### Админские (`/api/admin/*`)
- CRUD для pages, sections, products, news, resources, forms
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

# CDN
NEXT_PUBLIC_CDN_URL="https://assets.surefilter.us"
NEXT_PUBLIC_SITE_URL="https://new.surefilter.us"

# TinyMCE (для редактора контента)
NEXT_PUBLIC_TINYMCE_API_KEY="..."
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

---

## Паттерны и соглашения

### Компоненты
- **Server Components** — по умолчанию для страниц и секций
- **Client Components** — только при необходимости интерактивности (`'use client'`)
- **CMS компоненты** — суффикс `Cms` (например, `HeroCms`, `WhyChooseCms`)

### Стили
- Утилита `cn()` из `lib/utils.ts` для объединения Tailwind классов
- Цвета: `sure-blue`, `sure-orange`, `sure-red`
- Контейнер: `max-w-7xl mx-auto px-4`

### Изображения
- Компонент `ManagedImage` — с shimmer placeholder и retry
- Утилита `getAssetUrl()` — конвертирует S3 path в CDN URL
- Next.js `<Image>` везде вместо `<img>`

### API
- Валидация через Zod
- Ответы: `{ data }` или `{ error, message }`
- Логирование через `logAdminAction()`

---

## Известные особенности

1. **Prisma 7**: `prisma.config.ts` должен быть в корне surefilter-ui/, не в prisma/
2. **Поиск отключен**: Временно закомментирован для Phase 1 (TODO в компонентах)
3. **ISR**: Product pages кэшируются 24 часа
4. **Dynamic rendering**: `force-dynamic` в root layout
5. **TypeScript**: `ignoreBuildErrors: true` в next.config.ts (техдолг)

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

### Дополнительно

- `infra/README.md` — инфраструктура AWS
- `surefilter-ui/docs/` — CMS-специфичная документация

---

## Быстрые ответы

**Где схема БД?**
→ `surefilter-ui/prisma/schema.prisma`

**Где добавить новый тип секции?**
→ 1) Enum в schema.prisma 2) Компонент в sections/ 3) Форма в admin/pages/[slug]/sections/ 4) Обработка в cms/section-renderer.tsx

**Где настройки Header/Footer?**
→ `/admin/settings/site` → `SiteSettings` модель

**Как добавить изображение?**
→ `/admin/files` → загрузить → скопировать CDN URL

**Как создать страницу?**
→ `/admin/pages` → New Page → добавить секции

---

*Этот файл предназначен для AI ассистентов. Для полной документации см. README.md*
