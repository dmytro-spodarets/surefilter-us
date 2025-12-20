# Development Guides

Руководства по настройке и использованию различных компонентов системы.

---

## 🎠 Hero Carousel (Swiper.js)

### Установка
```bash
npm install swiper
```

### Использование в CMS
Компонент `HeroCarouselCms` использует Swiper.js для создания fullscreen hero слайдера.

**Основные возможности:**
- Автопрокрутка (настраиваемая)
- Навигация стрелками
- Pagination dots
- Keyboard navigation
- Touch/swipe на мобильных
- Loop mode (требуется минимум 3 слайда)
- Accessibility (ARIA labels)

**Конфигурация в админке:**
- Добавление/удаление слайдов
- Изменение порядка (вверх/вниз)
- Настройка autoplay/navigation/pagination
- Загрузка изображений через File Manager

**Файлы:**
- Компонент: `src/components/sections/HeroCarouselCms.tsx`
- Форма: `src/app/admin/pages/[slug]/sections/HeroCarouselForm.tsx`

---

## 📝 Prisma 7 Quick Reference

### Основные изменения

**1. Конфигурация**
- `prisma.config.ts` в корне проекта (не в surefilter-ui/)
- `url` убран из `schema.prisma`
- Используется PostgreSQL driver adapter

**2. Prisma Client инициализация**
```typescript
import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

**3. Важные команды**
```bash
# Генерация клиента
npx prisma generate

# Создание миграции
npx prisma migrate dev --name migration_name

# Применение миграций
npx prisma migrate deploy

# Prisma Studio
npx prisma studio
```

**4. Docker Build**
```dockerfile
# Копировать prisma.config.ts из корня
COPY prisma.config.ts ./prisma.config.ts
COPY prisma ./prisma

# Генерация с dummy URL
ARG DATABASE_URL="postgresql://localhost:5432/buildtime?schema=public"
RUN DATABASE_URL="${DATABASE_URL}" npx prisma generate
```

**Документация:** https://www.prisma.io/docs/orm/overview/databases/postgresql

---

## 📝 TinyMCE Rich Text Editor

### Установка
```bash
npm install @tinymce/tinymce-react
```

### Получение API ключа
1. Зарегистрируйтесь на https://www.tiny.cloud/
2. Создайте проект
3. Скопируйте API key

### Конфигурация

**Environment Variable:**
```env
TINYMCE_API_KEY=your_api_key_here
```

**Использование в компоненте:**
```tsx
import { Editor } from '@tinymce/tinymce-react';

<Editor
  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
  value={content}
  onEditorChange={(newContent) => setContent(newContent)}
  init={{
    height: 500,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
  }}
/>
```

**Используется в:**
- News/Events content editor
- Resource descriptions
- CMS text sections

---

## 📁 File Manager (S3/MinIO)

### Локальная разработка (MinIO)

**1. Запуск MinIO:**
```bash
cd docker
docker compose up -d minio
```

**2. Доступ:**
- Console: http://localhost:9001
- Login: `admin`
- Password: `password123`

**3. Синхронизация с production:**
```bash
./scripts/sync-s3-to-minio.sh
```

### Production (AWS S3)

**Environment Variables:**
```env
# S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=surefilter-files-prod
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# CDN
NEXT_PUBLIC_CDN_URL=https://assets.surefilter.us
```

**Структура папок:**
```
/images/
  /products/
  /news/
  /resources/
/videos/
/documents/
```

**API Endpoints:**
- `POST /api/admin/files/upload` - загрузка файлов
- `GET /api/admin/files/list` - список файлов
- `DELETE /api/admin/files/delete` - удаление
- `GET /api/admin/files/presigned-url` - временные ссылки

**Использование в компонентах:**
```tsx
import { getAssetUrl } from '@/lib/assets';

<Image src={getAssetUrl(imagePath)} alt="..." />
```

**Файловые типы:**
- Изображения: JPG, PNG, WebP, GIF, SVG
- Видео: MP4, WebM
- Документы: PDF
- Максимальный размер: 50MB

---

## 🔐 Environment Variables

### Обязательные переменные

**Database:**
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

**NextAuth:**
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_here
```

**AWS (Production):**
```env
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

**CDN:**
```env
NEXT_PUBLIC_CDN_URL=https://assets.your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

**TinyMCE:**
```env
NEXT_PUBLIC_TINYMCE_API_KEY=your_api_key
```

### Локальная разработка

Создайте `.env.local`:
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

## 📚 Дополнительная документация

- **CMS System**: `surefilter-ui/docs/SHARED_SECTIONS.md`
- **AWS RDS SSL**: `surefilter-ui/docs/AWS-RDS-SSL.md`
- **Infrastructure**: `infra/README.md`
- **Scripts**: `scripts/README.md`
