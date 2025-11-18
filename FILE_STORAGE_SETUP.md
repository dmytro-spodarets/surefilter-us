# File Storage Setup - Development & Production

## 📦 Архитектура хранилища

### Production
- **Storage**: AWS S3 (`surefilter-files-prod`)
- **CDN**: CloudFront → `https://new.surefilter.us`
- **Access**: IAM Role (через App Runner)

### Development (Local)
- **Storage**: MinIO (S3-совместимый)
- **URL**: `http://localhost:9000/surefilter-static/`
- **Access**: admin / password123

## 🚀 Быстрый старт локальной разработки

### 1. Запустите MinIO через Docker

```bash
cd docker
docker compose up -d minio
```

Проверьте что MinIO запущен:
```bash
docker compose ps minio
```

Веб-интерфейс MinIO: http://localhost:9001
- Username: `admin`
- Password: `password123`

### 2. Создайте bucket в MinIO

Через веб-интерфейс или CLI:

```bash
# Войдите в контейнер
docker exec -it surefilter-minio sh

# Создайте bucket
mc alias set local http://localhost:9000 admin password123
mc mb local/surefilter-static
mc policy set download local/surefilter-static
```

### 3. Настройте переменные окружения

В файле `surefilter-ui/.env`:

```bash
# НЕ устанавливайте NEXT_PUBLIC_CDN_URL для development!
# Или закомментируйте:
# NEXT_PUBLIC_CDN_URL=

# MinIO credentials (должны совпадать с docker/env)
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123

# AWS Region (для SDK)
AWS_REGION=us-east-1
```

### 4. Перезапустите Next.js

```bash
cd surefilter-ui
npm run dev
```

## 🔄 Как это работает

### Загрузка файлов (Upload)

**s3.ts** автоматически определяет окружение:

```typescript
// Development → MinIO
if (process.env.NODE_ENV === 'development') {
  endpoint: 'http://localhost:9000',
  bucket: 'surefilter-static'
}

// Production → AWS S3
else {
  bucket: 'surefilter-files-prod'
  // IAM credentials from App Runner
}
```

**Возвращаемый CDN URL:**
- Development: `http://localhost:9000/surefilter-static/{key}`
- Production: `https://new.surefilter.us/{key}`

### Отображение файлов (Display)

**assets.ts** генерирует правильные URL:

```typescript
getAssetUrl('images/hero/filter.png')

// Development:
// → http://localhost:9000/surefilter-static/images/hero/filter.png

// Production:
// → https://new.surefilter.us/images/hero/filter.png
```

## 📝 База данных MediaAsset

При загрузке файла создается запись:

```javascript
{
  id: "clx...",
  filename: "filter.png",
  s3Path: "images/filters/1760630235252_filter.png",
  cdnUrl: "http://localhost:9000/surefilter-static/images/filters/1760630235252_filter.png",
  mimeType: "image/png",
  fileSize: 123456,
  width: 800,
  height: 600
}
```

**Важно**: `cdnUrl` сохраняется с полным URL того окружения, где файл был загружен!

## 🔧 Миграция данных между окружениями

### Скопировать файлы из продакшена локально

```bash
# 1. Скачайте файлы из S3
aws s3 sync s3://surefilter-files-prod ./backup-files/

# 2. Загрузите в MinIO
docker cp ./backup-files/ surefilter-minio:/tmp/
docker exec -it surefilter-minio sh
mc cp --recursive /tmp/backup-files/ local/surefilter-static/
```

### Обновить cdnUrl в базе данных

После импорта данных из продакшена нужно обновить URL:

```sql
-- Посмотреть текущие URL
SELECT id, filename, cdnUrl FROM "MediaAsset" LIMIT 5;

-- Обновить на локальные (если нужно)
UPDATE "MediaAsset" 
SET "cdnUrl" = REPLACE("cdnUrl", 
  'https://new.surefilter.us', 
  'http://localhost:9000/surefilter-static'
);
```

## 🐛 Troubleshooting

### Проблема: Изображения не загружаются локально

**Симптом**: 404 или CORS ошибки

**Решение**:
1. Проверьте что MinIO запущен: `docker compose ps minio`
2. Проверьте bucket существует: http://localhost:9001
3. Проверьте что `NEXT_PUBLIC_CDN_URL` НЕ установлена в `.env`
4. Перезапустите Next.js: `npm run dev`

### Проблема: Файлы загружаются, но не отображаются

**Причина**: В базе сохранены production URL

**Решение**:
```sql
-- Проверьте URL в базе
SELECT "cdnUrl" FROM "MediaAsset" LIMIT 1;

-- Если там production URL, обновите (см. выше)
```

### Проблема: Next.js Image error "Invalid src"

**Причина**: localhost:9000 не в remotePatterns

**Решение**: Уже добавлено в `next.config.ts` (строки 40-44)

## 📚 Связанные файлы

- `surefilter-ui/src/lib/s3.ts` - S3/MinIO client
- `surefilter-ui/src/lib/assets.ts` - URL generation
- `surefilter-ui/next.config.ts` - Image domains
- `docker/docker-compose.yml` - MinIO setup
- `surefilter-ui/src/app/api/admin/files/*` - File upload API

---

**Обновлено**: 16 октября 2025

