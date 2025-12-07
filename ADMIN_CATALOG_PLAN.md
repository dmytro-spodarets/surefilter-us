# Admin Catalog Pages - Implementation Plan

## 📋 Страницы для создания

### 1. 🏷️ **Product Categories** (`/admin/categories`)

**Назначение:** Управление категориями продуктов (Heavy Duty, Automotive, Industrial и т.д.)

**Функционал:**
- ✅ Список всех категорий с сортировкой по position
- ✅ Создание новой категории
- ✅ Редактирование категории
- ✅ Удаление категории (если нет привязанных продуктов)
- ✅ Активация/деактивация (isActive)
- ✅ Drag & drop для изменения порядка (position)

**Поля формы:**
```typescript
{
  name: string;        // "Heavy Duty"
  slug: string;        // "heavy-duty" (auto-generate from name)
  description?: string;
  icon?: string;       // Icon name or emoji
  position: number;    // Order in UI
  isActive: boolean;
}
```

**UI компоненты:**
- Таблица с колонками: Name, Slug, Products Count, Active, Actions
- Модальное окно для создания/редактирования
- Toggle для isActive
- Drag handles для reorder

---

### 2. 🏢 **Brands** (`/admin/brands`)

**Назначение:** Управление брендами (Sure Filter, Premium Guard и т.д.)

**Функционал:**
- ✅ Список всех брендов
- ✅ Создание нового бренда
- ✅ Редактирование бренда
- ✅ Удаление бренда (если нет привязанных продуктов)
- ✅ Upload логотипа через File Manager
- ✅ Активация/деактивация

**Поля формы:**
```typescript
{
  name: string;        // "Sure Filter"
  code?: string;       // "SF" (для ACES/PIES)
  description?: string;
  logoUrl?: string;    // S3 path from File Manager
  website?: string;    // "https://surefilter.us"
  position: number;
  isActive: boolean;
}
```

**UI компоненты:**
- Таблица с колонками: Logo, Name, Code, Products Count, Active, Actions
- Форма с File Manager интеграцией для логотипа
- Preview логотипа

---

### 3. 📏 **Specification Parameters** (`/admin/spec-parameters`)

**Назначение:** Управление параметрами спецификаций (Height, OD, Thread и т.д.)

**Функционал:**
- ✅ Список всех параметров, сгруппированных по category
- ✅ Создание нового параметра
- ✅ Редактирование параметра
- ✅ Удаление параметра (если нет привязанных значений)
- ✅ Группировка по категориям (Dimensions, Performance, Material)
- ✅ Drag & drop для изменения порядка внутри категории

**Поля формы:**
```typescript
{
  code?: string;       // "HEIGHT" (stable code для ACES/PIES)
  name: string;        // "Height"
  unit?: string;       // "mm", "in", "psi"
  category?: string;   // "Dimensions", "Performance", "Material"
  position: number;
  isActive: boolean;
}
```

**UI компоненты:**
- Accordion по категориям (Dimensions, Performance, etc.)
- Таблица внутри каждой категории
- Модальное окно для создания/редактирования
- Поле для создания новой категории (если не существует)

---

### 4. 📦 **Products** (`/admin/products`) - ОБНОВИТЬ

**Назначение:** Управление продуктами (фильтрами)

**Существующий функционал:**
- ✅ Список продуктов
- ✅ Поиск по коду/названию
- ✅ Создание/редактирование

**Что нужно ОБНОВИТЬ:**

#### A. Основная информация (уже есть)
```typescript
{
  code: string;        // "SFO241"
  name: string;        // "Engine Oil Filter"
  description?: string;
  brandId: string;     // ← НОВОЕ: Dropdown с брендами
  filterTypeId?: string;
  status?: string;
  tags: string[];
  manufacturer?: string;
  industries: string[];
}
```

#### B. Категории (НОВОЕ)
```typescript
categories: [
  {
    categoryId: string;  // Dropdown с ProductCategory
    isPrimary: boolean;  // Checkbox "Primary category"
    position: number;    // Auto-increment
  }
]
```

**UI:**
- Секция "Categories"
- Кнопка "+ Add Category"
- Список выбранных категорий с:
  - Dropdown для выбора категории
  - Checkbox "Primary" (только одна может быть primary)
  - Кнопка удаления
  - Drag handles для reorder

#### C. Изображения (НОВОЕ - заменяет JSON поле)
```typescript
media: [
  {
    assetId: string;     // MediaAsset ID
    isPrimary: boolean;  // Radio button (только одно)
    position: number;
    caption?: string;
  }
]
```

**UI:**
- Секция "Images"
- Кнопка "Add Image" → открывает File Manager
- Gallery view с:
  - Превью изображений
  - Radio button для primary image
  - Input для caption
  - Drag & drop для reorder
  - Кнопка удаления

#### D. Спецификации (ОБНОВИТЬ существующее)
```typescript
specValues: [
  {
    parameterId: string; // Dropdown с SpecParameter
    value: string;       // Input
    unitOverride?: string; // Optional override
    position: number;
  }
]
```

**UI (улучшить существующее):**
- Секция "Specifications"
- Группировка по категориям параметров
- Autocomplete для выбора параметра
- Показывать unit из SpecParameter
- Возможность override unit

#### E. Cross References (НОВОЕ - заменяет JSON поле oems)
```typescript
crossReferences: [
  {
    refBrandName: string;   // Input
    refCode: string;        // Input
    referenceType: string;  // Dropdown: OEM, Competitor, Supersedes
    isPreferred: boolean;   // Checkbox "Preferred"
    notes?: string;         // Textarea
  }
]
```

**UI:**
- Секция "Cross References / OEM Numbers"
- Таблица с колонками:
  - Brand Name
  - Part Number
  - Type (dropdown)
  - Preferred (checkbox)
  - Notes
  - Actions (delete)
- Кнопка "+ Add Cross Reference"
- Highlight preferred references

---

## 🎨 UI/UX Guidelines

### Общие принципы:
1. **Consistent Layout** - все страницы используют `AdminContainer`
2. **Breadcrumbs** - навигация на всех страницах
3. **Search & Filters** - на всех списках
4. **Pagination** - для больших списков (20 items per page)
5. **Loading States** - skeleton loaders
6. **Error Handling** - toast notifications
7. **Confirmation Modals** - для удаления

### Компоненты для переиспользования:
- `AdminContainer` - wrapper для всех страниц
- `AdminNav` - навигация
- `Breadcrumbs` - хлебные крошки
- `DataTable` - таблица с сортировкой
- `Modal` - модальные окна
- `FileManagerPicker` - выбор файлов из File Manager
- `DragDropList` - drag & drop списки
- `FormField` - обертка для полей формы

---

## 📊 Навигация в админке

Обновить `/admin` navigation:

```typescript
const catalogNav = [
  { label: 'Products', href: '/admin/products', icon: 'CubeIcon' },
  { label: 'Categories', href: '/admin/categories', icon: 'FolderIcon' },
  { label: 'Brands', href: '/admin/brands', icon: 'BuildingStorefrontIcon' },
  { label: 'Spec Parameters', href: '/admin/spec-parameters', icon: 'AdjustmentsHorizontalIcon' },
  { label: 'Filter Types', href: '/admin/filter-types', icon: 'FunnelIcon' },
];
```

---

## 🔄 Порядок реализации

### Phase 1: Базовые CRUD (1-2 дня)
1. ✅ `/admin/categories` - Product Categories
2. ✅ `/admin/brands` - Brands
3. ✅ `/admin/spec-parameters` - Specification Parameters

### Phase 2: Обновление Products (2-3 дня)
1. ✅ Обновить форму - добавить Brand selector
2. ✅ Добавить Categories manager
3. ✅ Добавить Images gallery (ProductMedia)
4. ✅ Улучшить Specifications editor
5. ✅ Добавить Cross References table

### Phase 3: API Endpoints (1 день)
1. ✅ `/api/admin/categories` - CRUD
2. ✅ `/api/admin/brands` - CRUD
3. ✅ `/api/admin/spec-parameters` - CRUD
4. ✅ Обновить `/api/admin/products` - новая схема

### Phase 4: Testing & Polish (1 день)
1. ✅ Тестирование всех CRUD операций
2. ✅ Проверка валидации
3. ✅ UI/UX полировка
4. ✅ Error handling

**Total: ~5-7 дней**

---

## ✅ Checklist

### Categories
- [ ] Список категорий
- [ ] Создание категории
- [ ] Редактирование категории
- [ ] Удаление категории
- [ ] Reorder (drag & drop)

### Brands
- [ ] Список брендов
- [ ] Создание бренда
- [ ] Редактирование бренда
- [ ] Удаление бренда
- [ ] Upload логотипа

### Spec Parameters
- [ ] Список параметров
- [ ] Группировка по категориям
- [ ] Создание параметра
- [ ] Редактирование параметра
- [ ] Удаление параметра
- [ ] Reorder внутри категории

### Products (обновление)
- [ ] Brand selector
- [ ] Categories manager (many-to-many)
- [ ] Images gallery (ProductMedia)
- [ ] Specifications editor (улучшенный)
- [ ] Cross References table
- [ ] Удалить старые JSON поля из UI

---

**Готовы начать с какой страницы?** 🚀
