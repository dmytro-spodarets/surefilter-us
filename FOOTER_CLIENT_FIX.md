# 🔧 Footer Client Component Fix

## 🐛 Проблема

После рефакторинга для SEO-оптимизации `Footer` был переделан в **async Server Component**:

```tsx
// Footer.tsx
export default async function Footer() {
  const footerData = await getFooterContent(); // ✅ SSR
  return <footer>...</footer>;
}
```

Но некоторые страницы являются **Client Components** (`'use client'`), и они пытались импортировать async Server Component `Footer`:

```tsx
'use client'; // ❌ Client Component

import Footer from '@/components/layout/Footer'; // ❌ async Server Component

export default function Page() {
  // ...
  return <Footer />; // ❌ ОШИБКА: Client Component не может импортировать async Server Component
}
```

**Результат:** Страница зависала на "Loading..." и не рендерилась.

---

## ✅ Решение

Создан **`FooterClient`** компонент для использования в Client Components:

### **FooterClient.tsx**
```tsx
'use client';

export default function FooterClient() {
  const [footerData, setFooterData] = useState({});
  
  useEffect(() => {
    fetch('/api/public/site-settings')
      .then(res => res.json())
      .then(data => setFooterData(data.footer));
  }, []);
  
  return <footer>...</footer>;
}
```

**Преимущества:**
- ✅ Работает в Client Components
- ✅ Загружает данные через API
- ✅ Кэшируется через `revalidate` на API endpoint
- ✅ Fallback на дефолтные значения

---

## 📋 Какие файлы были исправлены

### **1. Создан новый компонент:**
- ✅ `src/components/layout/FooterClient.tsx`

### **2. Обновлены Client Components:**

#### `/resources/[slug]/page.tsx`
```tsx
- import Footer from '@/components/layout/Footer';
+ import FooterClient from '@/components/layout/FooterClient';

- <Footer />
+ <FooterClient />
```

#### `/resources/heavy-duty-catalog/page.tsx`
```tsx
- import Footer from '@/components/layout/Footer';
+ import FooterClient from '@/components/layout/FooterClient';

- <Footer />
+ <FooterClient />
```

### **3. Server Components остались без изменений:**

Эти страницы — Server Components, поэтому они продолжают использовать async `Footer`:
- ✅ `/newsroom/page.tsx`
- ✅ `/resources/page.tsx`
- ✅ `/newsroom/[slug]/page.tsx`
- ✅ `/about-us/page.tsx`
- ✅ `/contact-us/page.tsx`
- ✅ `/filters/[code]/page.tsx`
- ✅ `/industries/...`
- ✅ И все остальные Server Pages

---

## 🎯 Архитектурное правило

### **Когда использовать Footer:**
```tsx
// Server Component (async page)
export default async function Page() {
  return (
    <>
      <HeaderWrapper />  {/* ✅ Server Component */}
      <main>...</main>
      <Footer />         {/* ✅ async Server Component */}
    </>
  );
}
```

### **Когда использовать FooterClient:**
```tsx
'use client'; // Client Component

export default function Page() {
  return (
    <>
      <Header />        {/* ✅ Client Component */}
      <main>...</main>
      <FooterClient />  {/* ✅ Client Component */}
    </>
  );
}
```

---

## 🚀 Результат

**До:**
- ❌ Страница `/resources/[slug]` зависала на "Loading..."
- ❌ TypeScript ошибка: "Cannot find name 'Footer'"
- ❌ Бесконечная загрузка

**После:**
- ✅ Страница рендерится корректно
- ✅ Footer загружается через API
- ✅ TypeScript без ошибок
- ✅ Работает в Client и Server Components

---

## 📝 API Endpoint

Footer данные доступны через публичный API:

**GET** `/api/public/site-settings`

```json
{
  "navigation": [...],
  "footer": {
    "description": "...",
    "address": ["..."],
    "phone": "...",
    "companyLinks": [...],
    "socialLinks": [...],
    ...
  }
}
```

**Кэширование:** `revalidate: 300` (5 минут)

---

## ✅ Проверка

1. Откройте `/resources/[slug]` (любой ресурс)
2. Footer должен загрузиться и отобразиться
3. Проверьте Network tab — должен быть запрос к `/api/public/site-settings`

**Готово!** 🎉

