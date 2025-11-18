# Scripts

Вспомогательные скрипты для разработки и деплоя.

## 📥 sync-s3-to-minio.sh

Синхронизация файлов из production S3 в локальный MinIO для разработки.

### Что делает

- Загружает все файлы из production S3 buckets
- Загружает их в локальный MinIO
- Позволяет работать с реальными файлами локально

### Prerequisites

1. **AWS CLI** установлен:
   ```bash
   brew install awscli
   ```

2. **MinIO Client (mc)** установлен:
   ```bash
   brew install minio/stable/mc
   ```

3. **AWS Profile** настроен:
   ```bash
   aws configure --profile surefilter-local
   ```
   
   Вам нужны:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `us-east-1`

4. **MinIO запущен**:
   ```bash
   cd docker
   docker compose up -d minio
   ```

### Использование

```bash
# Из корня проекта
./scripts/sync-s3-to-minio.sh
```

### Что синхронизируется

| S3 Bucket | MinIO Bucket | Описание |
|-----------|--------------|----------|
| `surefilter-files-prod` | `surefilter-static` | Файлы из File Manager |
| `surefilter-static-prod` | `surefilter-static` | Статические assets |

### Проверка результата

После синхронизации:

1. **MinIO Console**: http://localhost:9001
   - Login: `admin`
   - Password: `password123`

2. **Direct URL**: http://localhost:9000/surefilter-static/{file-path}

3. **В приложении**: Файлы будут доступны через `/admin/files`

### Troubleshooting

#### AWS profile not found
```bash
# Проверьте существующие профили
aws configure list-profiles

# Создайте профиль surefilter-local
aws configure --profile surefilter-local
```

#### MinIO not running
```bash
# Проверьте статус
cd docker
docker compose ps minio

# Запустите MinIO
docker compose up -d minio

# Проверьте логи
docker compose logs minio
```

#### Permission denied
```bash
# Сделайте скрипт исполняемым
chmod +x scripts/sync-s3-to-minio.sh
```

#### Cannot access S3 bucket
- Проверьте AWS credentials
- Убедитесь что у IAM пользователя есть доступ к S3 buckets
- Проверьте что buckets существуют:
  ```bash
  aws s3 ls --profile surefilter-local
  ```

### Частота синхронизации

Запускайте скрипт:
- При первой настройке локального окружения
- После добавления новых файлов в production
- Когда нужны актуальные данные для тестирования

### Production Safety

✅ **Read-only операции** — скрипт только читает из S3, ничего не изменяет  
✅ **Local-only writes** — записывает только в локальный MinIO  
✅ **No destructive actions** — не удаляет файлы ни в S3, ни в MinIO  

---

## Другие скрипты

_Будут добавлены по мере необходимости_

