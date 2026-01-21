# Скрипт добавления логирования для оставшихся API

## Products UPDATE/DELETE
**Файл:** `/api/admin/products/[id]/route.ts`

### 1. Добавить импорты в начало:
```typescript
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';
```

### 2. В PUT (после prisma.product.update):
```typescript
// Log action
const session = await getServerSession(authOptions);
if (session) {
  const metadata = getRequestMetadata(request);
  await logAdminAction({
    userId: (session.user as any).id,
    action: 'UPDATE',
    entityType: 'Product',
    entityId: product.id,
    entityName: product.code,
    details: { changes: Object.keys(body) },
    ...metadata,
  });
}
```

### 3. В DELETE (после получения product, перед delete):
```typescript
// Log action
const session = await getServerSession(authOptions);
if (session) {
  const metadata = getRequestMetadata(request);
  await logAdminAction({
    userId: (session.user as any).id,
    action: 'DELETE',
    entityType: 'Product',
    entityId: product.id,
    entityName: product.code,
    ...metadata,
  });
}
```

---

## News CREATE/UPDATE/DELETE
**Файлы:** 
- `/api/admin/news/route.ts` (CREATE)
- `/api/admin/news/[id]/route.ts` (UPDATE/DELETE)

### Импорты:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';
```

### CREATE (после prisma.news.create):
```typescript
const session = await getServerSession(authOptions);
if (session) {
  const metadata = getRequestMetadata(request);
  await logAdminAction({
    userId: (session.user as any).id,
    action: 'CREATE',
    entityType: 'News',
    entityId: news.id,
    entityName: news.title,
    ...metadata,
  });
}
```

### UPDATE (после prisma.news.update):
```typescript
const session = await getServerSession(authOptions);
if (session) {
  const metadata = getRequestMetadata(request);
  await logAdminAction({
    userId: (session.user as any).id,
    action: 'UPDATE',
    entityType: 'News',
    entityId: news.id,
    entityName: news.title,
    details: { changes: Object.keys(body) },
    ...metadata,
  });
}
```

### DELETE (после получения news, перед delete):
```typescript
const session = await getServerSession(authOptions);
if (session) {
  const metadata = getRequestMetadata(request);
  await logAdminAction({
    userId: (session.user as any).id,
    action: 'DELETE',
    entityType: 'News',
    entityId: news.id,
    entityName: news.title,
    ...metadata,
  });
}
```

---

## Resources CREATE/UPDATE/DELETE
**Файлы:**
- `/api/admin/resources/route.ts` (CREATE)
- `/api/admin/resources/[id]/route.ts` (UPDATE/DELETE)

### Импорты:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';
```

### CREATE (после prisma.resource.create):
```typescript
const session = await getServerSession(authOptions);
if (session) {
  const metadata = getRequestMetadata(request);
  await logAdminAction({
    userId: (session.user as any).id,
    action: 'CREATE',
    entityType: 'Resource',
    entityId: resource.id,
    entityName: resource.title,
    ...metadata,
  });
}
```

### UPDATE (после prisma.resource.update):
```typescript
const session = await getServerSession(authOptions);
if (session) {
  const metadata = getRequestMetadata(request);
  await logAdminAction({
    userId: (session.user as any).id,
    action: 'UPDATE',
    entityType: 'Resource',
    entityId: resource.id,
    entityName: resource.title,
    details: { changes: Object.keys(body) },
    ...metadata,
  });
}
```

### DELETE (после получения resource, перед delete):
```typescript
const session = await getServerSession(authOptions);
if (session) {
  const metadata = getRequestMetadata(request);
  await logAdminAction({
    userId: (session.user as any).id,
    action: 'DELETE',
    entityType: 'Resource',
    entityId: resource.id,
    entityName: resource.title,
    ...metadata,
  });
}
```

---

## Итого файлов для изменения:
1. ✅ `/api/admin/products/route.ts` - CREATE (DONE)
2. `/api/admin/products/[id]/route.ts` - UPDATE/DELETE
3. `/api/admin/news/route.ts` - CREATE
4. `/api/admin/news/[id]/route.ts` - UPDATE/DELETE
5. `/api/admin/resources/route.ts` - CREATE
6. `/api/admin/resources/[id]/route.ts` - UPDATE/DELETE

Всего: 6 файлов, ~18 вставок кода (по 3 на файл: импорт + CREATE/UPDATE + DELETE)
