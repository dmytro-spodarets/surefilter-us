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

### Изображения и файлы
- `next/image`, `object-cover`, `fill`, приоритет на первых экранах.
- Обработка ошибок изображений через `onError` (см. `Industries.tsx`, `ProductGallery.tsx`), есть градиентные фоллбеки.
- **Файл-менеджер**: полная система управления медиафайлами через `/admin/files`
  - S3/MinIO интеграция с CDN (CloudFront)
  - Папки с вложенностью, drag & drop загрузка
  - Превью изображений, видео, PDF в модальных окнах
  - Копирование CDN ссылок для вставки в контент

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

### Продовая инфраструктура (кратко)
- Домен и CDN: `new.surefilter.us` через CloudFront + ACM + Route53. Канонический домен принудительно в `middleware`, origin защищён заголовком `X-Origin-Secret`.
- Хостинг приложения: AWS App Runner (автодеплой вручную по образу из ECR).
- База данных: RDS PostgreSQL (публично на период миграции; далее — VPC Connector и закрытие SG).
- Секреты: SSM параметры `/surefilter/DATABASE_URL`, `/surefilter/NEXTAUTH_SECRET`, `/surefilter/ORIGIN_SECRET`.
- Статика: `/_next/static/*` и `/images/*` в S3 (`surefilter-static-prod`) за CloudFront, TTL 1 год, immutable.

### CloudFront 404 Issue (2025-09-17) — РЕШЕНО ✅

**Проблема**: Сайт работал по прямому App Runner URL (`https://qiypwsyuxm.us-east-1.awsapprunner.com/`) но возвращал 404 через CloudFront (`https://new.surefilter.us/`).

**Причина**: CloudFront передавал viewer headers (включая `Host`) в App Runner, что конфликтовало с middleware логикой проверки канонического домена.

**Решение**:
1. **Создана новая origin request policy** `app_runner_min`:
   - `headers_config.header_behavior = "none"` — НЕ передаёт viewer headers
   - `cookies_config.cookie_behavior = "all"` — передаёт все cookies
   - `query_strings_config.query_string_behavior = "all"` — передаёт все query strings
2. **Обновлён CloudFront distribution** для использования новой policy на всех App Runner behaviors
3. **Исправлена S3 bucket policy** для корректной работы с Origin Access Identity

**Файлы изменены**:
- `infra/envs/prod/cloudfront.tf` — добавлена policy `aws_cloudfront_origin_request_policy.app_runner_min`
- `infra/envs/prod/providers.tf` — временно переключен на local backend для отладки

**Статус**: ✅ Сайт полностью работает через CloudFront

**TODO для будущего**:
- [ ] Настроить кеширование для статических ресурсов (CSS, JS, изображения)
- [ ] Включить обратно origin enforcement в middleware (`ENFORCE_ORIGIN = "1"`)
- [ ] Вернуть state обратно в Scalr после завершения отладки
- [ ] Добавить CloudFront access logs для мониторинга
- [ ] Настроить response headers policy для безопасности

### Локальная работа с OpenTofu

**Настройка для локальной разработки**:

1. **Установка OpenTofu**:
   ```bash
   # macOS
   brew install opentofu
   
   # Проверка версии
   tofu --version
   ```

2. **Настройка AWS профиля**:
   ```bash
   # Создание профиля
   aws configure --profile surefilter-local
   
   # Или через переменную окружения
   export AWS_PROFILE=surefilter-local
   ```

3. **Переключение на локальный backend**:
   - В `infra/envs/prod/providers.tf` backend уже настроен на `local`
   - State файл: `infra/envs/prod/terraform.tfstate`

4. **Экспорт state из Scalr** (если нужно):
   ```bash
   cd infra/envs/prod
   
   # В оригинальной Scalr среде
   tofu state pull > terraform.tfstate
   
   # Инициализация локально
   tofu init -reconfigure
   ```

5. **Основные команды**:
   ```bash
   cd infra/envs/prod
   
   # Планирование изменений
   tofu plan
   
   # Применение изменений
   tofu apply
   
   # Применение без подтверждения
   tofu apply -auto-approve
   
   # Просмотр state
   tofu state list
   tofu state show <resource_name>
   
   # Уничтожение ресурсов (осторожно!)
   tofu destroy
   ```

6. **Возврат в Scalr** (после отладки):
   ```bash
   # Вернуть backend в providers.tf на remote
   # Затем мигрировать state
   tofu init -reconfigure -migrate-state
   ```

**Важно**:
- Локальные файлы (`.terraform/`, `terraform.tfstate*`) добавлены в `.gitignore`
- Не коммитьте локальные state файлы в репозиторий
- При работе с командой убедитесь, что никто не запускает Scalr параллельно

### Search Disabled for Phase 1 Release (2025-09-17)

**Цель**: Подготовить сайт к релизу первой фазы без каталога, временно отключив все функции поиска.

**Изменения**:
1. **Header.tsx** — закомментирована форма поиска в шапке, добавлена кнопка "Browse Catalog"
2. **Hero.tsx** — закомментирована форма поиска, оставлена ссылка "Browse our complete catalog"
3. **HeroCms.tsx** — закомментирована форма поиска (используется для `hero_full` секций)
4. **SearchHero.tsx** — закомментирована форма поиска, добавлена кнопка "Browse Full Catalog"
5. **CompactSearchHero.tsx** — закомментирована форма поиска, добавлена кнопка "Browse Full Catalog"
6. **QuickSearch.tsx** — закомментирована форма поиска, добавлена кнопка "Browse Full Catalog"
7. **QuickSearchCms.tsx** — закомментирована форма поиска, добавлена кнопка "Browse Full Catalog"
8. **SimpleSearch.tsx** — закомментирована форма поиска, добавлена кнопка "Browse Full Catalog"

**Как вернуть поиск обратно**:
1. Найти все TODO комментарии с текстом "Uncomment when catalog is ready"
2. Раскомментировать закомментированные формы поиска (убрать `/*` и `*/`)
3. Удалить временные кнопки "Browse Full Catalog" и "Browse Catalog"
4. Настроить функциональность поиска для работы с каталогом
5. Протестировать все поисковые формы

**Файлы для изменения**:
- `src/components/layout/Header.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/HeroCms.tsx`
- `src/components/sections/SearchHero.tsx`
- `src/components/sections/CompactSearchHero.tsx`
- `src/components/sections/QuickSearch.tsx`
- `src/components/sections/QuickSearchCms.tsx`
- `src/components/sections/SimpleSearch.tsx`

**Дополнительно исправлено**:
- Добавлены недостающие формы редактирования для `search_hero` и `compact_search_hero` секций в админке
- `src/app/admin/pages/[slug]/sections/SearchHeroForm.tsx` — новая форма
- `src/app/admin/pages/[slug]/sections/CompactSearchHeroForm.tsx` — новая форма
- `src/app/admin/sections/[id]/page.tsx` — добавлена обработка новых типов секций
- Подключены формы редактирования для `filter_types_grid` и `popular_filters` секций (заголовок и описание)
- Улучшен лейаут админки — создан `AdminContainer` компонент с шириной `max-w-7xl` для больших мониторов
- Обновлены ВСЕ страницы админки для использования нового широкого лейаута
- Проверен компонент `SimpleSearch` — полностью готов для редактирования в админке
- Обновлен `FilterTypesGrid` — изменено количество колонок с 6 на 7 для больших экранов
- Обновлен `.gitignore` — добавлены все Terraform/OpenTofu локальные файлы

### CI/CD (ручной запуск)
- Сборка образа и выгрузка статики: GitHub Actions → “CI - Build and Push to ECR”
  - inputs: `version` (обяз.), `static_bucket` (по умолчанию `surefilter-static-prod`), `invalidate` (true/false)
  - шаги: build image → push ECR → extract `/app/.next/static` и `/app/public` → upload в S3 → (опц.) invalidate CF
- База данных: “DB - Prisma Migrate Deploy”, “DB - Restore from Repo Dump”

### Админ-панель и CMS
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