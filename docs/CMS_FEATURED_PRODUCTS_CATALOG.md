# Featured Products Catalog - CMS Component

## Обзор

Новый CMS компонент для отображения избранных продуктов из каталога. В отличие от `featured_products` (ручной ввод), этот компонент автоматически загружает данные из базы данных.

**Дата создания:** 8 декабря 2025

---

## Сравнение с Featured Products (Manual)

| Характеристика | Manual | Catalog |
|---------------|--------|---------|
| **Ввод данных** | Ручной | Выбор из каталога |
| **Изображения** | Нужно указывать URL | Автоматически из MediaAsset |
| **Название** | Ручной ввод | Автоматически (code + name) |
| **Описание** | Ручной ввод | Автоматически из Product |
| **Категория/Тип** | Ручной ввод | Автоматически (FilterType) |
| **Ссылки** | Ручной ввод | Автоматически `/catalog/{code}` |
| **Обновления** | Нужно обновлять вручную | Автоматически при изменении продукта |

---

## Структура данных

### Schema (Zod)
```typescript
FeaturedProductsCatalogSchema {
  title: string (default: 'Featured Products')
  description: string (optional)
  fallbackHref: string (default: '/catalog')
  productIds: string[] (array of Product IDs)
}
```

### Database
```prisma
Section {
  type: 'featured_products_catalog'
  data: {
    title: "Featured Products"
    description: "Check out our most popular filters"
    fallbackHref: "/catalog"
    productIds: ["prod1", "prod2", "prod3"]
  }
}
```

---

## Файлы компонента

### 1. Frontend Component
**Путь:** `/src/components/sections/FeaturedProductsCatalogCms.tsx`

**Тип:** Server Component (async)

**Функции:**
- Загружает продукты из БД по массиву `productIds`
- Подгружает связанные данные (media, categories, filterType)
- Сортирует продукты по порядку в `productIds`
- Рендерит карточки продуктов с изображениями

**Загружаемые данные:**
```typescript
Product {
  id, code, name, description
  media { asset { cdnUrl } }
  filterType { name, slug }
  categories { category { name, slug } }
}
```

### 2. Admin Form
**Путь:** `/src/app/admin/pages/[slug]/sections/FeaturedProductsCatalogForm.tsx`

**Тип:** Client Component

**Функции:**
- Поиск продуктов по коду или названию
- Добавление продуктов в список
- Изменение порядка (кнопки ↑↓)
- Удаление продуктов из списка
- Превью с изображениями и категориями

### 3. Schema
**Путь:** `/src/cms/schemas.ts`

Экспорт: `FeaturedProductsCatalogSchema`, `FeaturedProductsCatalogInput`

### 4. API Validation
**Путь:** `/src/app/api/admin/sections/[id]/route.ts`

Валидация при сохранении секции через `FeaturedProductsCatalogSchema.safeParse()`

### 5. Renderer
**Путь:** `/src/cms/renderer.tsx`

Case для `featured_products_catalog` с рендерингом `FeaturedProductsCatalogCms`

---

## Использование в админке

### Создание секции

1. Перейдите в **Pages** → выберите страницу
2. Нажмите **Add Section**
3. Выберите **"Home: Featured Products (Catalog)"**
4. Секция создастся и откроется форма редактирования

### Настройка секции

1. **Заголовок и описание:**
   - Title: "Featured Products"
   - Description: "Check out our most popular filters"
   - Fallback link: "/catalog"

2. **Выбор продуктов:**
   - Используйте поиск по коду или названию
   - Нажмите **Add** для добавления продукта
   - Используйте кнопки **↑↓** для изменения порядка
   - Нажмите **Remove** для удаления

3. **Сохранение:**
   - Нажмите **Save changes**
   - Секция автоматически обновится на сайте

---

## Отображение на сайте

### Карточка продукта

```
┌─────────────────────────┐
│  [Изображение]          │
│  Badge: "Oil Filter" ←─ │  Тип фильтра
├─────────────────────────┤
│  SFO241        ←────────┤  Код продукта
│  Heavy Duty Oil Filter  │  Название
│  Premium filtration...  │  Описание
└─────────────────────────┘
```

### Элементы карточки:
- **Изображение:** из `ProductMedia` (primary)
- **Badge:** тип фильтра (`ProductFilterType.name`)
- **Заголовок:** код продукта (`Product.code`)
- **Подзаголовок:** название (`Product.name`)
- **Описание:** описание продукта (`Product.description`)
- **Ссылка:** `/catalog/{Product.code}`

### Layout:
- Grid: 1 колонка (mobile) → 2 (sm) → 3 (lg) → 4 (xl)
- Hover эффекты: масштабирование изображения, изменение цвета заголовка
- CTA кнопка внизу: "View Full Catalog"

---

## Технические детали

### Производительность
- **Server Component** - рендеринг на сервере
- **Prisma включения** - оптимизированные запросы с `include`
- **Сортировка** - на уровне приложения по `productIds`
- **Кеширование** - Next.js автоматическое кеширование

### SEO
- Семантический HTML
- Alt-теги для изображений
- Структурированные данные (Product schema)

### Доступность
- Keyboard navigation
- ARIA labels
- Focus states
- Screen reader friendly

---

## Миграция

**Файл:** `20251208085148_add_featured_products_catalog_section_type`

**Изменения:**
```sql
ALTER TYPE "SectionType" ADD VALUE 'featured_products_catalog';
```

---

## Примеры использования

### Главная страница
```typescript
{
  type: 'featured_products_catalog',
  data: {
    title: 'Our Best Sellers',
    description: 'Most popular filters for heavy duty equipment',
    fallbackHref: '/catalog',
    productIds: ['prod1', 'prod2', 'prod3', 'prod4']
  }
}
```

### Страница категории
```typescript
{
  type: 'featured_products_catalog',
  data: {
    title: 'Featured Oil Filters',
    description: 'Premium oil filtration solutions',
    fallbackHref: '/catalog?type=oil',
    productIds: ['oil1', 'oil2', 'oil3']
  }
}
```

---

## Troubleshooting

### Продукты не отображаются
- Проверьте что продукты существуют в БД
- Проверьте что `productIds` содержит правильные ID
- Проверьте консоль браузера на ошибки

### Изображения не загружаются
- Проверьте что у продукта есть `ProductMedia` с `isPrimary: true`
- Проверьте что `MediaAsset.cdnUrl` корректный
- Проверьте настройки MinIO/S3

### Форма не сохраняется
- Проверьте консоль браузера на ошибки валидации
- Проверьте что API endpoint `/api/admin/sections/[id]` работает
- Проверьте что `FeaturedProductsCatalogSchema` импортирован

---

## Будущие улучшения

- [ ] Фильтрация по типу фильтра в админке
- [ ] Фильтрация по категории в админке
- [ ] Drag & drop для изменения порядка
- [ ] Bulk actions (добавить несколько продуктов)
- [ ] Превью секции в админке
- [ ] Экспорт/импорт списка продуктов

---

## Связанные файлы

- Schema: `/prisma/schema.prisma` (SectionType enum)
- Migration: `/prisma/migrations/20251208085148_add_featured_products_catalog_section_type/`
- Component: `/src/components/sections/FeaturedProductsCatalogCms.tsx`
- Form: `/src/app/admin/pages/[slug]/sections/FeaturedProductsCatalogForm.tsx`
- Admin Page: `/src/app/admin/sections/[id]/page.tsx` (основной роут редактирования)
- Schema: `/src/cms/schemas.ts`
- Types: `/src/cms/types.ts`
- Renderer: `/src/cms/renderer.tsx`
- API: `/src/app/api/admin/sections/[id]/route.ts`

---

## История изменений

- **2025-12-08:** Создан компонент Featured Products Catalog
- **2025-12-08:** Добавлена форма в `/admin/sections/[id]/page.tsx`
- **2025-12-08:** Удален неиспользуемый роут `/admin/pages/[slug]/sections/[sectionId]`
- **2025-12-08:** Обновлена документация
