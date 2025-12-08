# Prisma 7 Quick Reference

Краткая шпаргалка по Prisma 7 для проекта Sure Filter US.

## 📁 Структура файлов

```
surefilter-ui/
├── package.json
├── prisma.config.ts          ⚠️ ВАЖНО: В КОРНЕ проекта!
├── prisma/
│   ├── schema.prisma         (без url в datasource)
│   └── migrations/
└── src/
    ├── lib/
    │   └── prisma.ts         (с PrismaPg adapter)
    └── generated/
        └── prisma/           (сгенерированный client)
```

## ⚙️ Конфигурация

### prisma.config.ts (в корне!)
```typescript
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

### schema.prisma
```prisma
datasource db {
  provider = "postgresql"
  // url убран - теперь в prisma.config.ts
}

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}
```

### lib/prisma.ts
```typescript
import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: ['warn', 'error'],
});
```

## 🔧 Команды

```bash
# Генерация client
npx prisma generate

# Миграции
npx prisma migrate dev
npx prisma migrate deploy

# Статус миграций
npx prisma migrate status

# Prisma Studio
npx prisma studio
```

## 🐳 Docker

```dockerfile
# Копируем config из КОРНЯ проекта
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN npx prisma generate
```

## 🚀 GitHub Actions

```yaml
- name: Run prisma migrate deploy
  working-directory: surefilter-ui
  run: |
    export DATABASE_URL="${{ steps.ssm.outputs.db_url }}"
    npx prisma generate
    npx prisma migrate deploy
```

## ⚠️ Частые ошибки

### Error: The datasource property is required
**Причина:** `prisma.config.ts` не в корне проекта  
**Решение:** Переместить в корень (рядом с `package.json`)

### Error: Cannot find module '@prisma/adapter-pg'
**Причина:** Пакет не установлен  
**Решение:** `npm install @prisma/adapter-pg pg`

### Error: Module not found: Can't resolve 'pg-native'
**Причина:** Webpack пытается резолвить опциональную зависимость  
**Решение:** Добавить в `next.config.ts`:
```typescript
webpack: (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    'pg-native': false,
  };
  return config;
}
```

## 📦 Зависимости

```json
{
  "dependencies": {
    "@prisma/adapter-pg": "^7.1.0",
    "dotenv": "^17.2.3",
    "pg": "^8.16.3"
  },
  "devDependencies": {
    "@prisma/client": "^7.1.0",
    "@types/pg": "^8.11.10",
    "prisma": "^7.1.0"
  }
}
```

## 🔗 Полезные ссылки

- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
- [Полная документация миграции](./PRISMA_7_MIGRATION.md)

---

**Последнее обновление:** 7 декабря 2025
