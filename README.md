# Sure Filter US — UI

Коротко: фронтенд на Next.js (App Router) для сайта Sure Filter US. Минималистичный, быстрый, доступный интерфейс с современным стеком и акцентом на переиспользование готовых решений.

### Состав и версии
- Next.js 15.3.5 (App Router)
- React 19
- Tailwind CSS 4.1
- Библиотеки: `@heroicons/react`, `react-icons`, `clsx` + `tailwind-merge` (утилита `cn`)

### Страницы и навигация (актуально)
- Главные разделы: `/` (home), `/about-us`, `/heavy-duty`, `/automotive`, `/industries`, `/resources`, `/newsroom`, `/warranty`, `/contact-us`, `/test-colors`
- Подстраницы:
  - Heavy Duty: `/heavy-duty/air`, `/heavy-duty/cabin`, `/heavy-duty/fuel`, `/heavy-duty/oil`
  - Industries: `/industries/agriculture`
  - Newsroom: `/newsroom/heavy-duty-filter-launch`
  - Resources: `/resources/heavy-duty-catalog`
- Новые страницы:
  - `/filters/[code]` — страница конкретного фильтра (Hero, описание, `Specifications`, галерея, таблица OEM). Сейчас использует мок‑данные (`SFO241`, `SFG84801E`).
  - `/catalog` — каталог с левой панелью фильтров (поиск, тип, индустрия, марка, параметры), переключение `Gallery/List`, пагинация. CTA на главной ведёт сюда.

### Компоненты (основные)
- `layout/`: `Header`, `Footer`
- `sections/`: `Hero`, `FullScreenHero`, `SingleImageHero`, `PageHero`, `PageHeroReverse`, `CompactHero`, `CompactSearchHero`, `SearchHero`, `QuickSearch`, `FeaturedProducts`, `Industries`, `IndustriesList`, `FilterTypesGrid`, `PopularFilters`, `Products`, `AboutWithStats`, `AboutNews`, `WhyChoose`, `QualityAssurance`, `ContentWithImages`, `RelatedFilters`, `NewsCarousel`, `LimitedWarrantyDetails`, `MagnussonMossAct`, `WarrantyClaimProcess`, `WarrantyContact`, `WarrantyPromise`
- Новые секции: `ProductGallery`, `ProductSpecs` (варианты `cards`/`table`, `contained`), `ContactOptions`
- `ui/`: `Button`, `Card`, `Icon`, `Input`, `Logo`, `Pagination`, `Collapsible`
- `seo/`: `SEO`
- `lib/`: `utils.ts` — `cn(...classes)`

### Иконки
- Компонент `Icon` принимает: `name`, `variant: 'outline' | 'solid'`, `size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`, `color: 'sure-blue' | 'sure-orange' | 'gray' | 'white' | 'current'`.
- Размеры: `xs` 12px, `sm` 16px, `md` 24px, `lg` 32px, `xl` 48px, `2xl` 64px.

### Стиль и цвета
- Заголовки: `text-gray-900`, подзаголовки/описания: `text-gray-600`.
- Брендовые: `sure-blue` и `sure-red`; акценты/фокус — `sure-orange` (например, `Input` имеет `focus:border-sure-orange-500`; `Button` использует `sure-orange` для `primary`).
- В компонентах выдержаны единые отступы и ширина контейнера (`max-w-7xl`).

### SEO
- Базовые метаданные и `metadataBase` задаются в `app/layout.tsx` через переменную окружения `NEXT_PUBLIC_SITE_URL`.

### Изображения
- `next/image`, `object-cover`, `fill`, приоритет на первых экранах.
- Обработка ошибок изображений через `onError` (см. `Industries.tsx`, `ProductGallery.tsx`), есть градиентные фоллбеки.

### Структура проекта (расширенно)
```
docker/
  docker-compose.yml
  env.example
surefilter-ui/
  src/app/
    page.tsx
    layout.tsx
    globals.css
    about-us/page.tsx
    automotive/page.tsx
    heavy-duty/page.tsx
    heavy-duty/air/page.tsx
    heavy-duty/cabin/page.tsx
    heavy-duty/fuel/page.tsx
    heavy-duty/oil/page.tsx
    industries/page.tsx
    industries/agriculture/page.tsx
    newsroom/page.tsx
    newsroom/heavy-duty-filter-launch/page.tsx
    resources/page.tsx
    resources/heavy-duty-catalog/page.tsx
    warranty/page.tsx
    contact-us/page.tsx
    test-colors/page.tsx
    filters/[code]/page.tsx        # детальная страница фильтра
    catalog/page.tsx               # каталог с фильтрами и пагинацией
  src/components/layout/
    Header.tsx
    Footer.tsx
  src/components/sections/
    Hero.tsx
    FullScreenHero.tsx
    SingleImageHero.tsx
    PageHero.tsx
    PageHeroReverse.tsx
    CompactHero.tsx
    CompactSearchHero.tsx
    SearchHero.tsx
    QuickSearch.tsx
    FeaturedProducts.tsx
    Industries.tsx
    IndustriesList.tsx
    FilterTypesGrid.tsx
    PopularFilters.tsx
    Products.tsx
    AboutWithStats.tsx
    AboutNews.tsx
    WhyChoose.tsx
    QualityAssurance.tsx
    ContentWithImages.tsx
    RelatedFilters.tsx
    NewsCarousel.tsx
    LimitedWarrantyDetails.tsx
    MagnussonMossAct.tsx
    WarrantyClaimProcess.tsx
    WarrantyContact.tsx
    WarrantyPromise.tsx
    ProductGallery.tsx
    ProductSpecs.tsx
    ContactOptions.tsx
  src/components/ui/
    Button.tsx
    Card.tsx
    Icon.tsx
    Input.tsx
    Logo.tsx
    Pagination.tsx
    Collapsible.tsx
  src/components/seo/SEO.tsx
  src/lib/utils.ts
```

### Запуск
```bash
cd surefilter-ui
npm install
npm run dev
# build: npm run build; start: npm start; lint: npm run lint
```

### Docker (Postgres) для разработки
1) Подготовьте переменные окружения и поднимите контейнер:
```bash
cp docker/env.example docker/.env
docker compose -f docker/docker-compose.yml up -d
```

2) Проверка логов/healthcheck:
```bash
docker compose -f docker/docker-compose.yml logs -f postgres | cat
```

3) Остановка/удаление контейнера:
```bash
docker compose -f docker/docker-compose.yml down
```

### CMS: редактирование контента и кеш
- Главная страница полностью рендерится из CMS (БД) в порядке, заданном в админке.
- Админка: `/admin` → Pages → выберите страницу → SEO и список секций; редактирование конкретной секции по клику Edit.
- Поддерживаемые секции на главной: `hero_full`, `featured_products`, `why_choose`, `quick_search`, `industries`, `about_news`.
- Кеш: используется tag‑based кеширование. После сохранения секции выполняется `revalidateTag` и HTML обновляется автоматически. В dev при необходимости перезапустите `npm run dev`.
- Сидинг контента:
  - Создание без перезаписи: `npm run seed:content`
  - Принудительное обновление существующих секций: `npm run seed:content:force`

### Как вести разработку
- Рабочий процесс
  - Ветки: `feature/<кратко>`, `fix/<кратко>`; мелкие правки можно в `main`, если без риска.
  - Коммиты: `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`.
  - CHANGELOG: на каждое заметное изменение — одна строка в формате `YYYY-MM-DD — описание`.
  - Изменили публичные API/страницы/цветовую политику — обновите `README.md`.
- Код и типы
  - TypeScript везде; явные типы пропсов; избегайте `any`.
  - Именование: осмысленные названия, без аббревиатур; функции — глаголы, переменные — существительные.
  - Утилита классов: используйте `cn()` для слияния Tailwind‑классов.
- Клиент/сервер компоненты
  - С обработчиками событий — только Client Components (`'use client'`).
  - Не передавайте обработчики событий в Server Components.
  - В Next 15 динамические параметры в роуте следует `await` в async‑компоненте: `const { code } = await params`.
- UI/стили
  - Заголовки/подзаголовки: см. раздел «Стиль и цвета».
  - Единая пагинация через `ui/Pagination` на страницах со списками.
  - Ширина секций — `max-w-7xl`; следите за вертикальными отступами секций.
  - Изображения с внешних источников — добавляйте фоллбек.
- Роутинг и ссылки
  - Все кнопки «View Full Catalog» ведут на `/catalog`.
  - Карточки продуктов ссылаются на `/filters/{code}`.
- Переменные окружения
  - `NEXT_PUBLIC_SITE_URL` — база для абсолютных ссылок в метаданных.
  - `DATABASE_URL` — строка подключения к локальной PostgreSQL (см. `docker/env.example`).
- Качество
  - Линт: `npm run lint`. Покрывайте новые компоненты простыми юнит‑тестами, где это уместно.
  - A11y: focus‑states, контраст, семантические теги, `aria` при необходимости.

### Дополнительно
- Планы развития: см. `ROADMAP.md`.
- История изменений и правила записей: см. `CHANGELOG.md`.

### Products & Specs updates (2025-09-04)
- Админка спецификаций продуктов:
  - Новый раздел `/admin/spec-parameters` — список, создание и редактирование параметров (название, единица измерения, категория, позиция, активность).
- Редактор спецификаций в формах продуктов:
  - Компонент `src/app/admin/products/ProductForm.tsx` поддерживает редактирование `specValues` — набор записей `{ parameterId, value, unitOverride?, position? }`.
  - На странице нового продукта и редактирования продукта доступен блок «Specifications» с добавлением/удалением строк и выбором параметров.
- API:
  - `POST /api/admin/products` и `PUT /api/admin/products/[id]` принимают поле `specValues` и сохраняют его транзакционно.
  - `GET /api/admin/products` и `GET /api/admin/products/[id]` возвращают `specValues` с вложенными `parameter` и сортировкой по `position`.
  - CRUD для `/api/admin/spec-parameters`.
- База данных и Prisma:
  - Модели `SpecParameter` и `ProductSpecValue` добавлены в схему Prisma; связи с `Product` настроены.
  - Схема синхронизирована (`prisma db push`), клиент сгенерирован в `src/generated/prisma`.
- Быстрый тест:
  - Создайте несколько параметров в `/admin/spec-parameters`.
  - Создайте/отредактируйте продукт в `/admin/products/new` или `/admin/products/[id]` и заполните спецификации.

### CMS & Admin updates (2025-08-25)
- **Generic CMS routing**: `src/app/(site)/[slug]/page.tsx` рендерит верхнеуровневые страницы из CMS по `slug` и формирует метаданные из SEO полей страницы.
  - Для многоуровневых страниц используется `src/app/(site)/[...slug]/page.tsx`; в dev временно используется некешированная загрузка `loadPageBySlug`.
- **Admin Pages**:
  - **Создание страницы** в модальном окне: `slug`, `title`, `description`, `ogImage`.
  - **Редактирование slug** в блоке SEO на странице редактирования.
  - **Удаление страницы**: доступно только для незашищённых слегов; для защищённых кнопка отключена.
  - **Хелперы**: `src/lib/pages.ts` — `RESERVED_SLUGS`, `isProtectedSlug`, `isValidNewSlug`.
- **Industries**:
  - Новый раздел `/admin/industries` — список страниц с `type=INDUSTRY`, кнопка “New industry page” (префикс `industries/`).
  - Редактор секций доступен универсально по `admin/sections/{id}`.
  - Динамический список на `/industries` рендерится секцией `industries_list` из страниц `type=INDUSTRY` c их `industry_meta` (title/description/image/popularFilters). Компонент `IndustriesCms` подтягивает данные из БД.
  - Добавлены секции: `compact_search_hero`, `simple_search`, `popular_filters`, `related_filters`.
- **Filter Types**:
  - БД: `FilterCategory` (HEAVY_DUTY, AUTOMOTIVE), `FilterType` (иерархия, fullSlug, pageSlug).
  - Админка: `/admin/filter-types` (списки по категориям), создание типов, быстрые ссылки “Edit page content” на страницы типов, карточки для редактирования лендингов категорий `/heavy-duty`, `/automotive`.
  - Сидинг: верхнеуровневые типы для обеих категорий; автосоздание CMS‑страниц с базовым Hero для каждого типа; страницы типов скрыты из общего списка Pages.

- **Heavy Duty**:
  - Страница `/heavy-duty` рендерится из CMS; добавлены секции `search_hero` и `filter_types_grid`, перенесён контент из статической версии.
- **Новые секции и формы**:
  - About: `manufacturing_facilities`, `our_company` (без поля `image`), `stats_band`, `awards_carousel`.
  - Contact: `contact_hero`, `contact_options`, `contact_form_info`.
  - Industries: `industries_list`, `industry_meta`, `compact_search_hero`, `simple_search`, `popular_filters`, `related_filters`.
- **Кеш/инвалидация**: все CRUD‑эндпойнты админки вызывают `revalidateTag('page:{slug}')`.
- **Сидинг**: `npm run seed:content` (без перезаписи) и `SEED_FORCE_UPDATE=1 npm run seed:content` (форс‑обновление). Обновлён `seed_content.mjs` для новых секций и очистки устаревших контактных блоков при наличии `contact_form_info`.
- **Изображения**: `next.config.ts` — добавлен `http://localhost:3000` в `images.remotePatterns` для dev.

### CMS & Admin updates (2025-08-26)
- **Замена industry_meta на listing_card_meta**
  - Универсальная мета‑секция для карточек списков: `listing_card_meta` (title/description/image/popularFilters).
  - Полный отказ от `industry_meta` в коде и БД. Добавлены миграции для конвертации и очистки enum.
  - Формы и рендереры обновлены; Add Section предлагает “Listing Card Meta (for list cards)”.
- **Related Filters (переработка)**
  - Вернули исходный UI‑карусель и сделали серверный враппер `FilterTypesCms`, который подтягивает список типов фильтров по категории.
  - Заголовок/описание/иконка карточек берутся из страниц типов через `listing_card_meta` (fallback не нужен).
  - Категория определяется по полю секции или автоматически по slug страницы (`/heavy-duty*` → HEAVY_DUTY, `/automotive*` → AUTOMOTIVE).
- **Admin UX**
  - Кнопка удаления секции возвращена в универсальный редактор `/admin/sections/[id]`. Back‑ссылка ведёт на страницу‑родителя.
  - Добавление секции теперь показывает текст ошибки из API и при успехе перекидывает сразу в редактор новой секции.
- **API и валидация**
  - `POST /api/admin/pages/[...slug]`: добавлена защита/сообщения об ошибках, возвращает `{ id }` новой секции.
  - Разрешены многоуровневые слеги с префиксами `heavy-duty`/`automotive`; обновлена валидация при обновлении slug.
  - Единый маршрут для reorder через `PUT action=reorder`.
- **Страницы типов фильтров**
  - Сидинг: для верхнеуровневых типов добавлены иконки, связка `FilterType.pageSlug`, создание `listing_card_meta` на страницах типов.
  - Обновлены страницы `heavy-duty/oil` и `heavy-duty/air`: добавлены все секции (hero, контент, popular/related, search, industries), рендерятся из CMS.
- **Миграции (Prisma/Postgres)**
  - `20250826080000_drop_industry_meta` — конвертация данных и пересоздание enum без `industry_meta`.
  - `20250826090000_add_listing_and_convert` — гарантия наличия `listing_card_meta` и финальная конвертация остатков.
  - После миграций требуется перезапуск dev‑сервера и `npx prisma generate`.