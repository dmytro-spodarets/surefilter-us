# Shared Sections Documentation

## Overview

Shared Sections - это система переиспользуемых секций контента, которые можно создать один раз и использовать на нескольких страницах. Любые изменения в shared section автоматически применяются на всех страницах, где она используется.

## Архитектура

### База данных

#### Модель SharedSection
```prisma
model SharedSection {
  id          String      @id @default(cuid())
  name        String      // Название для идентификации
  type        SectionType // Тип секции (hero_full, industry_showcase, и т.д.)
  data        Json        // Данные секции
  description String?     // Опциональное описание
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  sections    Section[]   // Связь с использованиями на страницах
  
  @@index([type])
}
```

#### Обновленная модель Section
```prisma
model Section {
  id              String         @id @default(cuid())
  type            SectionType
  data            Json           // Пустой для shared sections
  sharedSectionId String?        // Ссылка на SharedSection
  sharedSection   SharedSection? @relation(fields: [sharedSectionId], references: [id], onDelete: SetNull)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  pages           PageSection[]
  
  @@index([sharedSectionId])
}
```

**Важно:** Когда `Section` связана с `SharedSection`, поле `Section.data` остается пустым, а данные берутся из `SharedSection.data`.

## API Endpoints

### Shared Sections

#### GET /api/admin/shared-sections
Получить список всех shared sections с фильтрацией.

**Query параметры:**
- `type` (optional) - фильтр по типу секции

**Response:**
```json
[
  {
    "id": "...",
    "name": "Industry Showcase",
    "type": "industry_showcase",
    "description": "Reusable industry showcase",
    "data": { ... },
    "usageCount": 3,
    "usedOnPages": [
      { "id": "...", "title": "Agriculture", "slug": "industries/agriculture" }
    ]
  }
]
```

#### POST /api/admin/shared-sections
Создать новую shared section.

**Body:**
```json
{
  "name": "My Shared Section",
  "type": "industry_showcase",
  "description": "Optional description",
  "data": { ... }
}
```

#### GET /api/admin/shared-sections/[id]
Получить одну shared section по ID.

#### PUT /api/admin/shared-sections/[id]
Обновить shared section. Автоматически делает revalidation всех страниц, использующих эту секцию.

**Body:**
```json
{
  "name": "Updated name",
  "type": "industry_showcase",
  "description": "Updated description",
  "data": { ... }
}
```

#### DELETE /api/admin/shared-sections/[id]
Удалить shared section. Возвращает ошибку, если секция используется на страницах.

### Page Sections

#### POST /api/admin/pages/[...slug]
Добавить секцию на страницу. Поддерживает добавление shared section.

**Body для shared section:**
```json
{
  "type": "shared",
  "sharedSectionId": "cmiqgvkdc0000vzjrt8tjq0yk"
}
```

**Body для обычной секции:**
```json
{
  "type": "hero_full",
  "data": { ... }
}
```

## Файловая структура

### Backend

```
src/
├── app/
│   └── api/
│       └── admin/
│           ├── shared-sections/
│           │   ├── route.ts              # GET, POST
│           │   └── [id]/
│           │       └── route.ts          # GET, PUT, DELETE
│           ├── sections/
│           │   └── [id]/
│           │       └── route.ts          # Обновлен для shared sections
│           └── pages/
│               └── [...slug]/
│                   └── route.ts          # Обновлен для shared sections
```

### Frontend Admin UI

```
src/
├── app/
│   └── admin/
│       ├── shared-sections/
│       │   ├── page.tsx                  # Список shared sections
│       │   ├── new/
│       │   │   └── page.tsx              # Создание новой shared section
│       │   └── [id]/
│       │       ├── page.tsx              # Редактирование shared section
│       │       └── SharedSectionFormWrapper.tsx  # Wrapper для форм
│       ├── sections/
│       │   └── [id]/
│       │       └── page.tsx              # Обновлен: показывает инфо для shared
│       ├── pages/
│       │   └── [slug]/
│       │       ├── page.tsx              # Обновлен: показывает badge для shared
│       │       └── sections/
│       │           └── AddSectionForm.tsx  # Обновлен: выбор shared section
│       └── layout.tsx                    # Обновлен: Pages dropdown меню
```

### CMS Rendering

```
src/
├── cms/
│   ├── renderer.tsx                      # Обновлен: использует sharedSection.data
│   └── fetch.ts                          # Обновлен: загружает sharedSection
```

## Использование

### 1. Создание Shared Section

1. Перейти в **Pages → Shared Sections**
2. Нажать **"New Shared Section"**
3. Заполнить форму:
   - **Name**: Название для идентификации (например, "Agriculture Industry Showcase")
   - **Type**: Выбрать тип секции из списка
   - **Description**: Опциональное описание
4. Нажать **"Create"**
5. Заполнить данные секции в динамической форме
6. Нажать **"Save"**

### 2. Добавление Shared Section на страницу

1. Открыть страницу для редактирования
2. В разделе **"Sections"** найти **"Add Section"**
3. Переключить на **"Use Shared Section"**
4. Выбрать нужную shared section из списка
5. Нажать **"Add Section"**

### 3. Редактирование Shared Section

**Способ 1: Из списка**
1. **Pages → Shared Sections**
2. Найти нужную секцию
3. Нажать **"Edit"**

**Способ 2: Со страницы**
1. На странице редактирования найти секцию с фиолетовым badge **"Shared: [Name]"**
2. Нажать **"Edit Shared"**

**Важно:** Изменения применяются автоматически на всех страницах!

### 4. Удаление Shared Section со страницы

1. Нажать **"Edit"** на секции с фиолетовым badge
2. Прокрутить вниз до раздела **"Remove from this page"**
3. Нажать **"Delete Section"**

**Важно:** Удаляется только использование на этой странице. Сама shared section остается доступной.

### 5. Удаление Shared Section полностью

1. **Pages → Shared Sections**
2. Найти секцию
3. Нажать **"Delete"**

**Важно:** Нельзя удалить shared section, которая используется на страницах. Сначала нужно удалить её со всех страниц.

## UI Индикаторы

### На странице редактирования страницы

Секции с shared section отображаются с фиолетовым badge:

```
1. hero_full  [Shared: Agriculture Industry Showcase]  [Edit Shared]
```

### На странице редактирования секции

Если секция является shared, показывается информационная страница:

- 🟣 Фиолетовый блок с иконкой shared
- Название и описание shared section
- Кнопка **"Edit Shared Section"**
- Информация о том, что изменения применятся везде
- Кнопка удаления со страницы

### В списке Shared Sections

- Название и тип секции
- Описание
- Количество использований: **"Used on X page(s)"**
- Список страниц, где используется
- Кнопки **Edit** и **Delete**

## Технические детали

### Рендеринг

В `src/cms/renderer.tsx`:

```typescript
export function renderSection(section: CmsSection) {
  // Если секция использует shared section, берем данные из неё
  const sectionData = (section as any).sharedSection 
    ? (section as any).sharedSection.data 
    : section.data;
  
  const sectionType = (section as any).sharedSection 
    ? (section as any).sharedSection.type 
    : (section as any).type;

  // Используем sectionData вместо section.data
  switch (sectionType) {
    case 'industry_showcase': {
      const d = sectionData as any;
      return <IndustryShowcase {...d} />;
    }
    // ...
  }
}
```

### Загрузка данных

В `src/cms/fetch.ts`:

```typescript
export async function loadPageBySlug(slug: string) {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { position: 'asc' },
        include: { 
          section: {
            include: {
              sharedSection: true  // Загружаем shared section
            }
          }
        },
      },
    },
  });
  // ...
}
```

### Revalidation

При обновлении shared section автоматически делается revalidation всех страниц:

```typescript
// В PUT /api/admin/shared-sections/[id]
const { revalidateTag } = await import('next/cache');
const uniqueSlugs = new Set<string>();

sharedSection.sections.forEach(section => {
  section.pages.forEach(pageSection => {
    uniqueSlugs.add(pageSection.page.slug);
  });
});

uniqueSlugs.forEach(slug => {
  revalidateTag(`page:${slug}`);
});
```

### SharedSectionFormWrapper

Компонент-обертка для форм секций, который перехватывает fetch запросы:

```typescript
// src/app/admin/shared-sections/[id]/SharedSectionFormWrapper.tsx
// Перехватывает PUT /api/admin/sections/[id]
// Перенаправляет на PUT /api/admin/shared-sections/[id]
```

## Поддерживаемые типы секций

Все 45 типов секций поддерживаются:

- **Home**: hero_full, hero_carousel, hero_compact, featured_products, why_choose, quick_search, industries, about_news
- **Page Heroes**: page_hero, page_hero_reverse, single_image_hero
- **Search**: compact_search_hero, search_hero, simple_search
- **Industries**: industries_list, listing_card_meta, industry_showcase, popular_filters, related_filters, filter_types_grid, filter_types_image_grid
- **About**: about_with_stats, manufacturing_facilities, our_company, stats_band, awards_carousel, quality_assurance
- **Content**: content_with_images, news_carousel
- **Products**: products, product_gallery, product_specs
- **Contact**: contact_hero, contact_options, contact_form, contact_info, contact_details, contact_form_info
- **Forms**: form_embed
- **Warranty**: limited_warranty_details, magnusson_moss_act, warranty_claim_process, warranty_contact, warranty_promise
- **Widgets**: sidebar_widget

## Безопасность

1. **Авторизация**: Все API endpoints требуют ADMIN роль
2. **Защита от удаления**: Нельзя удалить shared section, используемую на страницах
3. **Валидация**: Все данные валидируются через Zod schemas
4. **Cascade delete**: При удалении shared section (если не используется), связи автоматически очищаются через `onDelete: SetNull`

## Миграция

Для применения изменений в базе данных:

```bash
npx prisma migrate dev --name add_shared_sections
```

## Troubleshooting

### Shared section не отображается на странице

1. Проверьте консоль браузера на наличие ошибок
2. Убедитесь, что данные сохранены в shared section
3. Сделайте hard reload (Ctrl+Shift+R)
4. Проверьте, что в renderer.tsx используется `sectionData` вместо `section.data`

### Не удается удалить shared section

Shared section используется на страницах. Сначала удалите её со всех страниц.

### Изменения не применяются

1. Проверьте, что сохранение прошло успешно
2. Сделайте hard reload страницы
3. Проверьте, что revalidation работает (логи в терминале)

## Будущие улучшения

- [ ] Bulk операции (добавить shared section на несколько страниц)
- [ ] Версионирование shared sections
- [ ] Предпросмотр shared section
- [ ] Дублирование shared section
- [ ] Конвертация обычной секции в shared
- [ ] Отвязка shared section (convert to regular section)
- [ ] Поиск и фильтрация shared sections
- [ ] Экспорт/импорт shared sections

## Sidebar Widget

### Описание

`sidebar_widget` - это специальный тип shared section, который позволяет создавать переиспользуемые sidebar виджеты с множественными блоками. Один sidebar widget может содержать несколько блоков разных типов.

### Типы блоков

1. **Benefits** - список преимуществ с иконками
2. **Stats** - статистика с числовыми показателями
3. **Badge** - trust badge с брендом и сертификацией
4. **Custom HTML** - произвольный HTML контент

### Использование

#### 1. Создание Sidebar Widget

1. **Pages → Shared Sections → New Shared Section**
2. Выбрать тип **"Widget: Sidebar (Benefits/Stats/Badge/HTML)"**
3. Добавить блоки:
   - Нажать кнопку типа блока (+ Benefits, + Stats, + Badge, + HTML)
   - Заполнить данные блока
   - Повторить для добавления нескольких блоков
4. Использовать кнопки ↑/↓ для изменения порядка блоков
5. Сохранить

#### 2. Добавление в ContentWithImages

1. Редактировать секцию `content_with_images`
2. В dropdown **"Sidebar Widget (Optional)"** выбрать созданный виджет
3. Сохранить

#### 3. Результат

- Контент отображается слева (8 колонок на desktop)
- Sidebar справа (4 колонки) с sticky позиционированием
- Все блоки отображаются в порядке добавления с отступами

### Пример структуры данных

```json
{
  "blocks": [
    {
      "id": "block-1",
      "widgetType": "benefits",
      "title": "Key Benefits",
      "items": [
        { "label": "99.9% Filtration Efficiency" },
        { "label": "Extended Service Life" },
        { "label": "ISO 9001:2015 Certified" }
      ]
    },
    {
      "id": "block-2",
      "widgetType": "stats",
      "title": "Quality Assurance",
      "items": [
        { "value": "40+", "label": "Years Experience" },
        { "value": "100%", "label": "Quality Tested" }
      ]
    },
    {
      "id": "block-3",
      "widgetType": "badge",
      "brandName": "SURE®",
      "tagline": "Trusted Worldwide",
      "certification": "ISO 9001:2015 Certified"
    }
  ]
}
```

### Технические детали

- **Schema**: `SidebarWidgetSchema` с массивом `SidebarWidgetBlockSchema`
- **Компонент**: `src/components/sections/SidebarWidget.tsx`
- **Форма**: `src/app/admin/pages/[slug]/sections/SidebarWidgetForm.tsx`
- **Интеграция**: Автоматическая загрузка данных в `src/cms/fetch.ts` для `content_with_images`

## Changelog

### v1.2.0 (Dec 28, 2025)
- ✅ Добавлен новый тип секции `sidebar_widget`
- ✅ Поддержка множественных блоков в одном sidebar widget
- ✅ Интеграция с `content_with_images` для двухколоночного layout
- ✅ Динамическая форма с add/remove/reorder блоков
- ✅ 4 типа блоков: Benefits, Stats, Badge, Custom HTML
- ✅ Автоматическая загрузка sidebar данных из shared sections

### v1.1.0 (Dec 20, 2025)
- ✅ Исправлено центрирование неполных рядов в `FilterTypesImageGrid` (используется `justify-center`)
- ✅ Оптимизирован API `/api/admin/products` - возвращает `_count` вместо полных данных для списка
- ✅ Исправлена обработка пустых `code` в `ProductFilterType` (конвертация в `null`)

### v1.0.0 (Dec 3, 2025)
- ✅ Базовая реализация Shared Sections
- ✅ CRUD API для shared sections
- ✅ Admin UI для управления
- ✅ Интеграция с существующими формами
- ✅ Автоматическая revalidation
- ✅ Визуальные индикаторы
- ✅ Защита от удаления используемых секций
- ✅ Поддержка всех типов секций
