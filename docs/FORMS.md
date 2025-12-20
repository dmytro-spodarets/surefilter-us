# Universal Forms System

Полная документация системы форм для Sure Filter US.

---

## 📋 Обзор

Universal Forms System - это гибкая система создания и управления формами с поддержкой:
- 7 типов полей
- Webhook интеграция
- Gated content (скачивание через форму)
- CSV экспорт заявок
- Встраивание в CMS

---

## 🎯 Типы форм

### 1. CONTACT - Контактные формы
Для общих запросов, обратной связи, поддержки.

### 2. DOWNLOAD - Gated Content
Для скачивания ресурсов (каталоги, спецификации, white papers).

---

## 🔧 Типы полей

| Тип | Описание | Валидация |
|-----|----------|-----------|
| `text` | Текстовое поле | Обязательность |
| `email` | Email адрес | Email формат |
| `phone` | Телефон | Phone формат |
| `textarea` | Многострочный текст | Обязательность |
| `select` | Выпадающий список | Обязательность |
| `checkbox` | Чекбокс | Обязательность |
| `radio` | Радио кнопки | Обязательность |

---

## 🎨 Создание формы

### 1. Через админку

1. Перейти в **Forms → New Form**
2. Заполнить основную информацию:
   - **Name**: Название формы
   - **Type**: CONTACT или DOWNLOAD
   - **Description**: Описание (опционально)
3. Добавить поля:
   - Нажать **Add Field**
   - Выбрать тип поля
   - Настроить параметры
   - Drag & drop для изменения порядка
4. Настроить webhook (опционально):
   - URL для отправки данных
   - Retry логика с exponential backoff
5. Сохранить форму

### 2. Программно

```typescript
const form = await prisma.form.create({
  data: {
    name: 'Contact Us',
    type: 'CONTACT',
    description: 'General inquiry form',
    fields: {
      create: [
        {
          type: 'text',
          label: 'Full Name',
          name: 'fullName',
          required: true,
          position: 0,
        },
        {
          type: 'email',
          label: 'Email Address',
          name: 'email',
          required: true,
          position: 1,
        },
        {
          type: 'textarea',
          label: 'Message',
          name: 'message',
          required: true,
          position: 2,
        },
      ],
    },
  },
});
```

---

## 📝 Встраивание в CMS

### Секция form_embed

```typescript
// В CMS добавить секцию типа form_embed
{
  type: 'form_embed',
  data: {
    formId: 'form_id_here',
    title: 'Contact Us',
    description: 'We\'d love to hear from you',
  }
}
```

### Компонент DynamicForm

```tsx
import DynamicForm from '@/components/forms/DynamicForm';

<DynamicForm
  formId="form_id_here"
  onSuccess={(data) => {
    console.log('Form submitted:', data);
  }}
/>
```

---

## 🔗 Webhook Integration

### Конфигурация

```typescript
const form = await prisma.form.update({
  where: { id: formId },
  data: {
    webhookUrl: 'https://your-api.com/webhook',
    webhookEnabled: true,
  },
});
```

### Payload формат

```json
{
  "formId": "cm123abc",
  "formName": "Contact Us",
  "submissionId": "cm456def",
  "submittedAt": "2025-12-20T13:00:00Z",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
  }
}
```

### Retry логика

- **Попытки**: 3 retry с exponential backoff
- **Интервалы**: 1s, 2s, 4s
- **Timeout**: 10 секунд на запрос
- **Статусы**: Отслеживание в админке

---

## 📊 Управление заявками

### Просмотр заявок

1. **Forms → [Form Name] → Submissions**
2. Список всех заявок с фильтрацией
3. Детальный просмотр каждой заявки

### CSV Export

```typescript
// Кнопка Export CSV в админке
// Формат: все поля + timestamp + status
```

### Webhook Retry

```typescript
// В админке для каждой заявки:
// - Статус webhook (success/failed/pending)
// - Кнопка Manual Retry
// - История попыток
```

---

## 🎯 Gated Content

### Настройка ресурса

```typescript
const resource = await prisma.resource.create({
  data: {
    title: 'Heavy Duty Catalog 2025',
    type: 'CATALOG',
    categoryId: 'category_id',
    isGated: true,
    formId: 'download_form_id',
    fileUrl: '/files/catalog-2025.pdf',
  },
});
```

### Процесс скачивания

1. Пользователь нажимает "Download"
2. Показывается форма (если `isGated: true`)
3. После заполнения формы:
   - Данные сохраняются в БД
   - Webhook отправляется (если настроен)
   - Файл становится доступен для скачивания
4. Пользователь получает ссылку на файл

---

## 🔒 Валидация

### Клиентская валидация

```typescript
// Автоматическая валидация на основе типа поля
{
  type: 'email',
  required: true,
  // Валидация: email формат + обязательность
}

{
  type: 'phone',
  required: true,
  // Валидация: phone формат + обязательность
}
```

### Серверная валидация

```typescript
// API endpoint: POST /api/forms/[formId]/submit
// Zod schema валидация всех полей
// Проверка required полей
// Проверка форматов (email, phone)
```

---

## 📡 API Endpoints

### Forms Management

```
GET    /api/admin/forms              - Список форм
POST   /api/admin/forms              - Создать форму
GET    /api/admin/forms/[id]         - Получить форму
PUT    /api/admin/forms/[id]         - Обновить форму
DELETE /api/admin/forms/[id]         - Удалить форму
```

### Submissions

```
GET    /api/admin/forms/[id]/submissions     - Список заявок
POST   /api/forms/[id]/submit                - Отправить форму (public)
POST   /api/admin/forms/[id]/submissions/[submissionId]/retry - Retry webhook
GET    /api/admin/forms/[id]/submissions/export - Export CSV
```

---

## 🎨 Кастомизация

### Стили формы

```tsx
// В DynamicForm компоненте
<form className="space-y-6">
  <input className="w-full px-4 py-2 border rounded-lg" />
  <button className="bg-sure-blue-600 text-white px-6 py-2 rounded-lg">
    Submit
  </button>
</form>
```

### Success/Error сообщения

```tsx
<DynamicForm
  formId="form_id"
  onSuccess={(data) => {
    toast.success('Thank you for your submission!');
  }}
  onError={(error) => {
    toast.error('Something went wrong. Please try again.');
  }}
/>
```

---

## 🧪 Тестирование

### Тест форма

1. Создать тестовую форму в админке
2. Добавить все типы полей
3. Настроить webhook на https://webhook.site
4. Отправить тестовую заявку
5. Проверить:
   - Сохранение в БД
   - Webhook payload
   - Retry логику (отключить webhook.site)
   - CSV export

### Webhook тестирование

```bash
# Используйте webhook.site или requestbin.com
# Для тестирования payload и retry логики
```

---

## 📚 Примеры использования

### Контактная форма

```typescript
// Форма с базовыми полями
{
  name: 'Contact Us',
  type: 'CONTACT',
  fields: [
    { type: 'text', label: 'Name', required: true },
    { type: 'email', label: 'Email', required: true },
    { type: 'phone', label: 'Phone', required: false },
    { type: 'select', label: 'Subject', options: ['Sales', 'Support', 'Other'] },
    { type: 'textarea', label: 'Message', required: true },
  ]
}
```

### Download форма

```typescript
// Минимальная форма для gated content
{
  name: 'Catalog Download',
  type: 'DOWNLOAD',
  fields: [
    { type: 'text', label: 'Full Name', required: true },
    { type: 'email', label: 'Email', required: true },
    { type: 'text', label: 'Company', required: false },
  ]
}
```

---

## 🔍 Troubleshooting

### Форма не отправляется

1. Проверьте валидацию полей
2. Откройте DevTools Console
3. Проверьте Network tab для API errors
4. Убедитесь что formId правильный

### Webhook не работает

1. Проверьте URL в настройках формы
2. Проверьте что webhookEnabled: true
3. Посмотрите логи в админке (submission details)
4. Используйте Manual Retry для тестирования

### CSV export пустой

1. Убедитесь что есть submissions
2. Проверьте права доступа (admin only)
3. Проверьте формат данных в БД

---

## 📖 Связанная документация

- **CMS Integration**: `surefilter-ui/docs/SHARED_SECTIONS.md`
- **Resources System**: См. раздел Resources в STATUS.md
- **API Documentation**: См. код в `src/app/api/forms/`
