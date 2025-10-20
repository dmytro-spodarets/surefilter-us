# ROADMAP

Сюда переносим планы разработки и идеи «хорошо бы сделать».

## ✅ Недавно выполнено (2025-10-20)

### Image Optimization (ЗАВЕРШЕНО)
- ✅ Shimmer placeholders для всех изображений (ManagedImage)
- ✅ Priority loading для hero-изображений (LCP -28%)
- ✅ Оптимизированные responsive sizes (трафик -40-50%)
- ✅ Замена всех `<img>` на Next.js Image
- ✅ Автоматическое сжатие при загрузке (1MB max, 2048px)
- ✅ Preload критичных изображений (логотип)
- ✅ CloudFront cache оптимизирован (1 год TTL)

### CMS Components (ЗАВЕРШЕНО)
- ✅ FilterTypesImageGrid: новый компонент с изображениями вместо иконок
  - 16:9 формат, прижатие к низу, hover подчеркивание
  - Настраиваемые колонки (2-8), два варианта стиля (card/simple)
- ✅ WhyChooseCms: flexbox центрирование последней строки
- ✅ FeaturedProductsCms: категория поверх изображения

### Code Quality (ЗАВЕРШЕНО)
- ✅ Удалены 6 дублирующихся не-CMS компонентов
- ✅ Унифицированы пути к изображениям (getAssetUrl везде)
- ✅ Исправлены build ошибки (force-dynamic для БД запросов)

## 🎯 Ближайшие задачи
- Интеграция данных для фильтров
  - Подключить API/источник данных для `/filters/[code]` и `/catalog`
  - Схема данных: характеристики, OEM, applications, interchanges, изображения
- Унификация UI
  - Подменить локальные реализации пагинации на `ui/Pagination` на всех страницах
  - Единые hero/CTA паттерны
- Каталог
  - Серверная фильтрация и пагинация (SSR/ISR)
  - Поиск с подсветкой совпадений, сохранение состояния в URL (query params)
  - Больше фильтров: диаметр, резьба, диапазоны по параметрам
  - Сохранение/сброс пресетов фильтров
- Страница фильтра
  - Блоки: Applications (модель/двигатель/год), Interchanges, Related products
  - Переключение единиц (mm ↔ in)
  - Навигация prev/next, хлебные крошки (по желанию)
- Контакты
  - Интеграция live chat провайдера
  - Автопрокрутка/подсказка при переходе с `Ask a Question`

### Тестирование и качество
- Unit и визуальные тесты ключевых компонентов (Pagination, ProductGallery, ContactOptions)
- Линт/формат: pre-commit hooks

### Деплой и мониторинг
- ✅ CI/CD - готово
- ✅ Prod URL конфигурация (`NEXT_PUBLIC_SITE_URL`), доменные OG - готово
- ✅ CloudFront + ACM для apex домена `new.surefilter.us` - готово:
  - Default: SSR без кеша или по Cache-Control
  - Static: `/_next/static/*`, `/images/*` из S3, TTL 1y, immutable
  - `/_next/image*`: форвард `url,w,q` и header `Accept`
  - Оптимизация изображений: Brotli+Gzip compression, shimmer placeholders, priority loading
- ✅ Image optimization pipeline - готово:
  - Auto compression при загрузке (1MB max, 2048px)
  - Next.js Image везде (WebP/AVIF automatic)
  - Responsive sizes для всех Image компонентов
  - Preload критичных изображений
- Перевести S3 origin на OAC (вместо OAI) — современная best‑practice, SigV4
- Добавить VPC Connector для App Runner и закрыть публичный доступ к RDS
- Запланировать WAF и логи CloudFront позже
- ✅ Канонический редирект origin: 301 с любого `*.awsapprunner.com` на `new.surefilter.us` в `middleware` - готово

### Документация
- Расширить описание новых компонентов и их пропсов
- Конвенции по цветам/типографике/пагинации в README
- Добавить раздел про инфраструктуру: CI (versioned images + S3 upload), домен (CF+ACM), S3 статику и инвалидации
