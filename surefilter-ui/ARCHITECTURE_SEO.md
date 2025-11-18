# SEO-Оптимальная архитектура

## Принцип: Контент в HTML при первом рендере

### ✅ Правильно (Server Components):
```tsx
// page.tsx - Server Component
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import Footer from '@/components/layout/Footer';

export default async function Page() {
  return (
    <>
      <HeaderWrapper /> {/* Навигация в HTML ✅ */}
      <main>{/* контент */}</main>
      <Footer /> {/* Ссылки в HTML ✅ */}
    </>
  );
}
```

### ❌ Плохо для SEO (Client Components с useEffect):
```tsx
'use client';

export default function Page() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/...').then(setData); // ❌ Контента нет в HTML
  }, []);
  
  return <div>{data?.content}</div>; // ❌ Пустой div в первом HTML
}
```

---

## Компоненты

### 1. Footer ✅ (уже правильно)
```tsx
// Server Component (async)
export default async function Footer() {
  const footerData = await getFooterContent(); // БД → HTML
  return <footer>...</footer>;
}
```

### 2. Header (нужны 2 варианта)

#### HeaderWrapper (для Server Pages):
```tsx
// Server Component
export default async function HeaderWrapper() {
  const navigation = await getHeaderNavigation(); // БД → HTML
  return <Header navigation={navigation} />;
}
```

#### Header (Client Component):
```tsx
'use client';
export default function Header({ navigation }) {
  // Принимает через props - данные уже в HTML ✅
  return <header>...</header>;
}
```

### 3. Hero секции

#### Для Server Pages:
```tsx
// Server Component
export default async function NewsroomHero() {
  const settings = await getNewsroomPageSettings(); // БД → HTML
  return <CompactHero {...settings} />;
}
```

#### Для Client Pages (Newsroom/Resources):
Нужно передать initial data через props:
```tsx
// page.tsx - миксированный подход
import NewsroomClientContent from './NewsroomClient';
import { getNewsroomPageSettings } from '@/lib/site-settings';

export default async function NewsroomPage() {
  const heroSettings = await getNewsroomPageSettings(); // Server-side
  
  return (
    <NewsroomClientContent initialHeroSettings={heroSettings} />
  );
}
```

---

## Рекомендация

**Для лучшего SEO:**

1. **Footer** - оставить как есть (Server Component) ✅
2. **Header** - использовать `HeaderWrapper` везде, где возможно
3. **Hero** - переделать в Server Components или передавать initial data
4. **Newsroom/Resources** - рассмотреть разделение на Server (layout) + Client (interactive parts)

**Результат:**
- ✅ Все критичные для SEO элементы в HTML
- ✅ Поисковики видят весь контент сразу
- ✅ Быстрая загрузка (меньше HTTP запросов)
- ✅ Работает без JavaScript

