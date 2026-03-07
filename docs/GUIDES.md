# Development Guides

Технические руководства по настройке и работе с проектом Sure Filter US.

**Последнее обновление:** 20 февраля 2026

---

## Содержание

1. [Quick Start](#-quick-start)
2. [Environment Variables](#-environment-variables)
3. [Database (Prisma 7)](#-database-prisma-7)
4. [File Manager (S3/MinIO)](#-file-manager-s3minio)
5. [Universal Forms System](#-universal-forms-system)
6. [Admin Logging](#-admin-logging)
7. [Analytics (GA4 + GTM)](#-analytics-ga4--gtm)
8. [SEO/GEO Dynamic Files](#-seogeo-dynamic-files)
9. [Deployment](#-deployment)
10. [Component Guides](#-component-guides)

---

## 🚀 Quick Start

```bash
cd surefilter-ui

# Установка зависимостей
npm install

# Настройка окружения
cp env.example .env.local
# Отредактируйте .env.local

# Локальная БД и MinIO
cd ../docker && docker compose up -d

# Генерация Prisma client
npx prisma generate

# Запуск dev сервера
npm run dev
```

---

## 🔐 Environment Variables

### Production

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Auth
NEXTAUTH_URL=https://surefilter.us
NEXTAUTH_SECRET=your_secret_here

# AWS S3
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=surefilter-files-prod
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# CDN & Site
NEXT_PUBLIC_CDN_URL=https://assets.surefilter.us
NEXT_PUBLIC_SITE_URL=https://surefilter.us

# TinyMCE
NEXT_PUBLIC_TINYMCE_API_KEY=your_api_key
```

### Local Development

```env
DATABASE_URL="postgresql://surefilter:password@localhost:5432/surefilter?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local_dev_secret

# MinIO (local S3)
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=surefilter-static
AWS_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=admin
AWS_SECRET_ACCESS_KEY=password123

NEXT_PUBLIC_CDN_URL=http://localhost:9000/surefilter-static
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📝 Database (Prisma 7)

### Ключевые особенности

- **Config**: `prisma.config.ts` в корне `surefilter-ui/` (не в prisma/)
- **Schema**: `prisma/schema.prisma` без `url` в datasource
- **Adapter**: PostgreSQL driver adapter (`@prisma/adapter-pg`)

### Инициализация клиента

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

### Команды

```bash
npx prisma generate              # Генерация client
npx prisma migrate dev --name X  # Новая миграция
npx prisma migrate deploy        # Применение миграций
npx prisma studio                # GUI для БД
```

### Docker Build

```dockerfile
COPY prisma.config.ts ./prisma.config.ts
COPY prisma ./prisma
ARG DATABASE_URL="postgresql://localhost:5432/buildtime?schema=public"
RUN DATABASE_URL="${DATABASE_URL}" npx prisma generate
```

---

## 📁 File Manager (S3/MinIO)

### Локальная разработка

```bash
cd docker && docker compose up -d minio
```

- Console: http://localhost:9001
- Login: `admin` / `password123`

### Структура папок

```
/images/products/
/images/news/
/images/resources/
/videos/
/documents/
```

### API Endpoints

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/admin/files/upload` | Загрузка |
| GET | `/api/admin/files/list` | Список |
| DELETE | `/api/admin/files/delete` | Удаление |

### Использование в коде

```tsx
import { getAssetUrl } from '@/lib/assets';

<Image src={getAssetUrl(imagePath)} alt="..." />
```

**Лимиты:** 50MB, форматы: JPG, PNG, WebP, GIF, SVG, MP4, WebM, PDF

---

## 📋 Universal Forms System

### Типы форм

- **CONTACT** — обратная связь, поддержка
- **DOWNLOAD** — gated content (скачивание через форму)

### Типы полей

| Тип | Описание |
|-----|----------|
| `text` | Текстовое поле |
| `email` | Email с валидацией |
| `phone` | Телефон |
| `textarea` | Многострочный текст |
| `select` | Выпадающий список |
| `checkbox` | Чекбокс |
| `radio` | Радио кнопки |

### Создание формы (админка)

1. `/admin/forms` → New Form
2. Добавить поля (drag & drop)
3. Настроить webhook (опционально)
4. Сохранить

### Webhook Integration

```json
{
  "formId": "cm123abc",
  "formName": "Contact Us",
  "submissionId": "cm456def",
  "submittedAt": "2026-01-20T13:00:00Z",
  "data": { "name": "John", "email": "john@example.com" }
}
```

- Retry: 3 попытки с exponential backoff (1s, 2s, 4s)
- Timeout: 10 секунд

### Встраивание в CMS

```tsx
import DynamicForm from '@/components/forms/DynamicForm';

<DynamicForm formId="form_id" onSuccess={(data) => {...}} />
```

### API

| Endpoint | Описание |
|----------|----------|
| `GET /api/admin/forms` | Список форм |
| `POST /api/forms/[id]/submit` | Отправка (public) |
| `GET /api/admin/forms/[id]/submissions/export` | CSV экспорт |

---

## 📊 Admin Logging

### Что логируется

- **Pages**: CREATE, UPDATE, DELETE
- **Products**: CREATE, UPDATE, DELETE
- **Users**: CREATE, UPDATE, DELETE
- **Settings**: UPDATE

### Просмотр логов

`/admin/settings` → Activity Logs (`/admin/logs`)

### Добавление логирования

```typescript
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';

const metadata = getRequestMetadata(req);
await logAdminAction({
  userId: session.user.id,
  action: 'CREATE', // UPDATE, DELETE
  entityType: 'Product',
  entityId: entity.id,
  entityName: entity.name,
  details: { ... },
  ...metadata,
});
```

---

## 📊 Analytics (GA4 + GTM)

### Настройка

GA Measurement ID и GTM Container ID хранятся **только в БД** (не в env), настраиваются через:
`/admin/settings/site` → Special Pages → Analytics & Tag Manager

### Архитектура

```
root layout (src/app/layout.tsx)
├── GoogleTagManager (перед <head>)
├── <head> ... </head>
├── <body> {children} </body>
└── GoogleAnalytics (после <body>)
```

- Библиотека: `@next/third-parties/google`
- Применяется только к публичным страницам (admin layout изолирован)
- GA4 Enhanced Measurement автоматически трекает SPA-навигации

### Client-side Events

```typescript
import { trackFormSubmit, trackButtonClick, trackEvent } from '@/lib/analytics';

// Трекинг формы
trackFormSubmit('contact-form');

// Трекинг клика
trackButtonClick('cta-button', '/catalog');

// Произвольное событие
trackEvent('popup_open', { popup_name: 'warranty' });
```

### Добавление нового трекинга

1. Импортировать хелпер из `src/lib/analytics.ts`
2. Вызвать в обработчике события (Client Component)
3. Или добавить новый хелпер в `analytics.ts`

---

## 🔍 SEO/GEO Dynamic Files

### Обзор

Все SEO-файлы генерируются динамически из БД:

| Файл | Источник | Тип |
|------|----------|-----|
| `/robots.txt` | `src/app/robots.ts` | Next.js Metadata API |
| `/sitemap.xml` | `src/app/sitemap.ts` | Next.js Metadata API |
| `/llms.txt` | `src/app/llms.txt/route.ts` | API Route |
| `/llms-full.txt` | `src/app/llms-full.txt/route.ts` | API Route |

### robots.txt

Управляется через админку: `/admin/settings/site` → SEO & LLM → "Block All Search Engines"

- **Обычный режим**: Allow `/`, Disallow `/admin/`, `/api/`, `/login`, `/catalog-viewer`, ссылка на sitemap
- **Блокировка**: `Disallow: /` для всех user-agents (для staging)

### sitemap.xml

Автоматически включает:
- Статические страницы (home, newsroom, resources, catalog)
- CMS страницы (`Page` model, status: published)
- Продукты (`Product` model, все)
- Новости (`NewsArticle`, status: PUBLISHED, publishedAt <= now)
- Ресурсы (`Resource`, status: PUBLISHED, с category slug)

### llms.txt

Формат: Markdown по стандарту [llmstxt.org](https://llmstxt.org)
- Описание сайта из `SiteSettings.llmsSiteDescription` (настраивается в админке)
- Автоматический список CMS-страниц, ссылки на каталог, ресурсы, новости
- `llms-full.txt` — расширенная версия с деталями продуктов (по filter type), новостями (последние 20), ресурсами (по категориям)

### Кэширование

Все файлы: `Cache-Control: public, max-age=3600` (1 час для llms.txt), `force-dynamic` (без static generation)

---

## 🚀 Deployment

### Pre-deployment

```bash
npm run build  # Убедиться что билд проходит
```

### Health Check

1. `/admin/settings` → System Health
2. Click "Refresh" для проверки
3. "Fix Issues" если есть проблемы

### Rollback

1. Откатить код на предыдущую версию
2. Запустить health check
3. Исправить несоответствия данных
4. Перезапустить деплой

### Инфраструктура

- **IaC**: OpenTofu (см. `infra/README.md`)
- **Hosting**: AWS App Runner
- **Database**: AWS RDS PostgreSQL
- **Files**: S3 + CloudFront CDN

---

## 🎨 Component Guides

### Hero Carousel (Swiper.js)

**Файлы:**
- `src/components/sections/HeroCarouselCms.tsx`
- `src/app/admin/pages/[slug]/sections/HeroCarouselForm.tsx`

**Возможности:**
- Autoplay, navigation, pagination
- Touch/swipe, keyboard navigation
- Loop mode (минимум 3 слайда)

### TinyMCE Editor

```tsx
import { Editor } from '@tinymce/tinymce-react';

<Editor
  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
  value={content}
  onEditorChange={setContent}
  init={{ height: 500, menubar: false, ... }}
/>
```

Используется: News, Resources, CMS текстовые секции.

---

## 📚 Дополнительно

- **CMS Shared Sections**: `surefilter-ui/docs/SHARED_SECTIONS.md`
- **AWS RDS SSL**: `surefilter-ui/docs/AWS-RDS-SSL.md`
- **Infrastructure**: `infra/README.md`
