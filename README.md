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
- Качество
  - Линт: `npm run lint`. Покрывайте новые компоненты простыми юнит‑тестами, где это уместно.
  - A11y: focus‑states, контраст, семантические теги, `aria` при необходимости.

### Дополнительно
- Планы развития: см. `ROADMAP.md`.
- История изменений и правила записей: см. `CHANGELOG.md`.