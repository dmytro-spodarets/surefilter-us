# Catalog Admin Implementation Plan

## ✅ СТАТУС: ЗАВЕРШЕНО (7 декабря 2025)

**См. полную документацию:** `CATALOG_ADMIN_COMPLETE.md`

---

# Catalog Admin Implementation Plan (АРХИВ)

## 📁 Структура страниц

```
/admin/
  └─ products/                    # Dropdown menu "Products"
      ├─ page.tsx                 # 📦 All Products (список всех продуктов)
      ├─ new/
      │   └─ page.tsx            # ➕ Add Product (создание)
      ├─ [id]/
      │   └─ page.tsx            # ✏️ Edit Product (редактирование)
      ├─ categories/
      │   ├─ page.tsx            # 🏷️ All Categories (список категорий)
      │   ├─ new/
      │   │   └─ page.tsx        # ➕ Add Category
      │   └─ [id]/
      │       └─ page.tsx        # ✏️ Edit Category
      ├─ brands/
      │   ├─ page.tsx            # 🏢 All Brands (список брендов)
      │   ├─ new/
      │   │   └─ page.tsx        # ➕ Add Brand
      │   └─ [id]/
      │       └─ page.tsx        # ✏️ Edit Brand
      └─ spec-parameters/
          ├─ page.tsx            # 📏 All Parameters (список параметров)
          ├─ new/
          │   └─ page.tsx        # ➕ Add Parameter
          └─ [id]/
              └─ page.tsx        # ✏️ Edit Parameter
```

## 🎯 Dropdown меню "Products"

```
Products ▼
  📦 All Products
  ➕ Add Product
  ─────────────
  🏷️ Categories
  🏢 Brands
  📏 Spec Parameters
```

---

## 📋 Порядок разработки

### Phase 1: Обновить навигацию (10 мин)
- [x] Обновить `/admin/layout.tsx`
- [x] Добавить dropdown для Products
- [x] Добавить state `productsMenuOpen`

### Phase 2: Categories (1-2 часа)
#### 2.1 API Routes
- [ ] `GET /api/admin/categories` - список всех категорий
- [ ] `POST /api/admin/categories` - создание категории
- [ ] `GET /api/admin/categories/[id]` - получить категорию
- [ ] `PUT /api/admin/categories/[id]` - обновить категорию
- [ ] `DELETE /api/admin/categories/[id]` - удалить категорию

#### 2.2 Pages
- [ ] `/admin/products/categories/page.tsx` - список категорий
- [ ] `/admin/products/categories/new/page.tsx` - создание
- [ ] `/admin/products/categories/[id]/page.tsx` - редактирование

#### 2.3 UI Features
- [ ] Таблица с колонками: Name, Slug, Products Count, Active
- [ ] Поиск по названию
- [ ] Фильтр по isActive
- [ ] Форма с полями: name, slug, description, icon, position, isActive
- [ ] Auto-generate slug from name
- [ ] Валидация (unique name, unique slug)

### Phase 3: Brands (1-2 часа)
#### 3.1 API Routes
- [ ] `GET /api/admin/brands` - список всех брендов
- [ ] `POST /api/admin/brands` - создание бренда
- [ ] `GET /api/admin/brands/[id]` - получить бренд
- [ ] `PUT /api/admin/brands/[id]` - обновить бренд
- [ ] `DELETE /api/admin/brands/[id]` - удалить бренд

#### 3.2 Pages
- [ ] `/admin/products/brands/page.tsx` - список брендов
- [ ] `/admin/products/brands/new/page.tsx` - создание
- [ ] `/admin/products/brands/[id]/page.tsx` - редактирование

#### 3.3 UI Features
- [ ] Таблица с колонками: Logo, Name, Code, Products Count, Active
- [ ] Поиск по названию
- [ ] Фильтр по isActive
- [ ] Форма с полями: name, code, description, logoUrl, website, position, isActive
- [ ] File Manager picker для логотипа
- [ ] Preview логотипа
- [ ] Валидация (unique name, unique code)

### Phase 4: Spec Parameters (1-2 часа)
#### 4.1 API Routes
- [ ] `GET /api/admin/spec-parameters` - список всех параметров
- [ ] `POST /api/admin/spec-parameters` - создание параметра
- [ ] `GET /api/admin/spec-parameters/[id]` - получить параметр
- [ ] `PUT /api/admin/spec-parameters/[id]` - обновить параметр
- [ ] `DELETE /api/admin/spec-parameters/[id]` - удалить параметр

#### 4.2 Pages
- [ ] `/admin/products/spec-parameters/page.tsx` - список параметров
- [ ] `/admin/products/spec-parameters/new/page.tsx` - создание
- [ ] `/admin/products/spec-parameters/[id]/page.tsx` - редактирование

#### 4.3 UI Features
- [ ] Группировка по категориям (Dimensions, Performance, Material, etc.)
- [ ] Accordion для каждой категории
- [ ] Таблица внутри каждой категории: Code, Name, Unit, Active
- [ ] Поиск по названию/коду
- [ ] Фильтр по категории
- [ ] Форма с полями: code, name, unit, category, position, isActive
- [ ] Dropdown для выбора существующей категории или создания новой
- [ ] Валидация (unique code if provided)

### Phase 5: Products - Обновление (3-4 часа)
#### 5.1 API Routes (обновить существующие)
- [ ] Обновить `GET /api/admin/products` - include brand, categories, media
- [ ] Обновить `POST /api/admin/products` - новая схема
- [ ] Обновить `PUT /api/admin/products/[id]` - новая схема
- [ ] Обновить `DELETE /api/admin/products/[id]`

#### 5.2 Pages (обновить существующие)
- [ ] Обновить `/admin/products/page.tsx` - показывать brand, primary category
- [ ] Обновить `/admin/products/new/page.tsx` - новая форма
- [ ] Обновить `/admin/products/[id]/page.tsx` - новая форма

#### 5.3 UI Features (обновить ProductForm)
- [ ] **Brand Selector** - dropdown с брендами (required)
- [ ] **Categories Manager** - many-to-many с primary checkbox
  - [ ] Список выбранных категорий
  - [ ] Кнопка "+ Add Category"
  - [ ] Radio button для primary category
  - [ ] Drag & drop для reorder
- [ ] **Images Gallery** - заменить JSON поле
  - [ ] Кнопка "Add Image" → File Manager
  - [ ] Grid с превью изображений
  - [ ] Radio button для primary image
  - [ ] Input для caption
  - [ ] Drag & drop для reorder
  - [ ] Кнопка удаления
- [ ] **Specifications Editor** - улучшить существующий
  - [ ] Autocomplete для выбора параметра
  - [ ] Группировка по категориям параметров
  - [ ] Показывать default unit из SpecParameter
  - [ ] Возможность override unit
  - [ ] Drag & drop для reorder
- [ ] **Cross References Table** - заменить JSON поле oems
  - [ ] Таблица с колонками: Brand, Part Number, Type, Preferred, Notes
  - [ ] Кнопка "+ Add Cross Reference"
  - [ ] Dropdown для referenceType (OEM, Competitor, Supersedes)
  - [ ] Checkbox для isPreferred
  - [ ] Highlight preferred references
  - [ ] Кнопка удаления
- [ ] **Удалить старые поля** - убрать из UI:
  - [ ] images (JSON)
  - [ ] specsLeft (JSON)
  - [ ] specsRight (JSON)
  - [ ] oems (JSON)
  - [ ] heightMm, odMm, idMm, thread, model (flat fields)

---

## 🎨 Общие UI компоненты

### Переиспользуемые компоненты:
```typescript
// Уже существуют:
- AdminContainer
- Breadcrumbs
- Modal
- Toast notifications

// Нужно создать:
- DataTable (с сортировкой, пагинацией)
- FileManagerPicker (выбор файлов)
- DragDropList (для reorder)
- CategorySelector (multi-select с primary)
- SpecParameterSelector (autocomplete)
- CrossReferenceTable (таблица с CRUD)
```

---

## 📊 API Validation Schemas (Zod)

### ProductCategory
```typescript
const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  icon: z.string().optional(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
```

### Brand
```typescript
const brandSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
```

### SpecParameter
```typescript
const specParameterSchema = z.object({
  code: z.string().min(1).max(50).regex(/^[A-Z0-9_]+$/).optional(),
  name: z.string().min(1).max(100),
  unit: z.string().max(20).optional(),
  category: z.string().max(50).optional(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
```

### Product (обновленная)
```typescript
const productSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  brandId: z.string().cuid(), // Required!
  filterTypeId: z.string().cuid().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).default([]),
  manufacturer: z.string().optional(),
  industries: z.array(z.string()).default([]),
  
  // Nested creates
  categories: z.array(z.object({
    categoryId: z.string().cuid(),
    isPrimary: z.boolean().default(false),
    position: z.number().int().min(0),
  })).optional(),
  
  media: z.array(z.object({
    assetId: z.string().cuid(),
    isPrimary: z.boolean().default(false),
    position: z.number().int().min(0),
    caption: z.string().optional(),
  })).optional(),
  
  specValues: z.array(z.object({
    parameterId: z.string().cuid(),
    value: z.string(),
    unitOverride: z.string().optional(),
    position: z.number().int().min(0),
  })).optional(),
  
  crossReferences: z.array(z.object({
    refBrandName: z.string(),
    refCode: z.string(),
    referenceType: z.enum(['OEM', 'Competitor', 'Supersedes', 'Superseded By']),
    isPreferred: z.boolean().default(false),
    notes: z.string().optional(),
  })).optional(),
});
```

---

## ⏱️ Временная оценка

| Задача | Время |
|--------|-------|
| Phase 1: Навигация | 10 мин |
| Phase 2: Categories | 1-2 часа |
| Phase 3: Brands | 1-2 часа |
| Phase 4: Spec Parameters | 1-2 часа |
| Phase 5: Products Update | 3-4 часа |
| **Total** | **6-9 часов** |

---

## 🚀 Начинаем!

**Порядок реализации:**
1. ✅ Обновить layout с dropdown
2. ✅ Categories (простая CRUD)
3. ✅ Brands (простая CRUD + File Manager)
4. ✅ Spec Parameters (CRUD + группировка)
5. ✅ Products (сложная форма с nested creates)

**Готовы начать с обновления layout?** 🎯
