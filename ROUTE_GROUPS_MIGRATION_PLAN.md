# 🎯 Route Groups Migration Plan

## Цель: Упрощение архитектуры до 2 компонентов Header + Footer

---

## ✅ Завершено:

1. ✅ Переделан `/resources/[slug]` в Server Component
2. ✅ Переделан `/resources/heavy-duty-catalog` в Server Component
3. ✅ Создан новый `Header` (Server Component) + Client подкомпоненты
4. ✅ `Footer` уже Server Component

**Результат:** Теперь 100% публичных страниц = Server Components!

---

## 📋 Следующие шаги:

### Этап 4: Создать Route Groups структуру

```
app/
├── (public)/              # NEW: Route group для публичных страниц
│   ├── layout.tsx         # NEW: Layout с Header + Footer
│   ├── page.tsx           # MOVE: главная страница
│   ├── about-us/          # MOVE
│   ├── catalog/           # MOVE
│   ├── contact-us/        # MOVE
│   ├── filters/           # MOVE
│   ├── industries/        # MOVE
│   ├── newsroom/          # MOVE
│   ├── resources/         # MOVE
│   ├── warranty/          # MOVE
│   └── (site)/            # MOVE: динамические CMS страницы
├── (admin)/               # NEW: Route group для admin
│   └── admin/             # MOVE: все admin страницы
├── login/                 # KEEP: отдельная страница
└── layout.tsx             # UPDATE: минимальный root layout
```

### Этап 5: Создать layouts

**app/(public)/layout.tsx:**
```tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
```

**app/layout.tsx (обновить):**
```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}  {/* Без Header/Footer - они в (public)/layout */}
      </body>
    </html>
  );
}
```

### Этап 6: Удалить старые компоненты

```
DELETE:
- components/layout/Header.tsx (старый)
- components/layout/HeaderWrapper.tsx
- components/layout/FooterClient.tsx
```

### Этап 7: Обновить импорты

Все страницы будут автоматически использовать Header + Footer из (public)/layout.tsx

---

## 📊 Итоговая структура компонентов:

```
components/layout/
├── Header/
│   ├── Header.tsx          ✅ Server Component (главный)
│   ├── HeaderNav.tsx       ✅ Client Component (навигация)
│   ├── MobileMenu.tsx      ✅ Client Component (меню)
│   └── index.ts
└── Footer.tsx              ✅ Server Component
```

**Всего: 2 основных компонента (Header + Footer)** ✅

---

## 🎯 Преимущества новой архитектуры:

| Аспект | Было | Стало |
|--------|------|-------|
| Компонентов Header/Footer | 4 | **2** ✅ |
| Client Pages | 2 | **0** ✅ |
| Server Components | 14/16 страниц | **16/16** ✅ |
| SEO | Частично | **100%** ✅ |
| Дублирование кода | Да | **Нет** ✅ |
| Сложность | Средняя | **Простая** ✅ |

---

## 📝 Готово к реализации!

Следующий шаг: Создать Route Groups и переместить файлы.

