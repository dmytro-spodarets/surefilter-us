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

## setup-listmonk.sh

Полная автоматическая установка [listmonk](https://listmonk.app/) (self-hosted newsletter manager) на EC2 сервер.

### Целевой сервер

- **EC2**: `surefilter-prod` (t4g.medium, Ubuntu 24.04 LTS ARM64)
- **Домен**: `newsletters.surefilter.us`
- **DNS**: Elastic IP, Route53 A-запись (настроена через Terraform)

### Что устанавливает

| Компонент | Версия | Назначение |
|-----------|--------|------------|
| Docker + Compose | Latest (official repo) | Контейнеризация |
| Nginx | Ubuntu package | Reverse proxy |
| Certbot | Ubuntu package | SSL (Let's Encrypt) |
| listmonk | Latest Docker image | Newsletter app (порт 9000) |
| PostgreSQL | 17-alpine | База данных listmonk |

### Что настраивает

1. **Docker** — из официального репозитория (DEB822 формат для Ubuntu 24.04)
2. **listmonk** — `docker-compose.yml` в `/opt/listmonk/`, порт привязан к `127.0.0.1:9000`
3. **PostgreSQL** — в Docker, данные в named volume `listmonk-data`
4. **Пароли** — автогенерация (DB + admin), сохраняются в `/opt/listmonk/.env`
5. **Nginx** — reverse proxy `newsletters.surefilter.us` → `127.0.0.1:9000`
6. **SSL** — Let's Encrypt через `certbot --nginx`, auto-redirect HTTP → HTTPS
7. **Auto-renewal** — systemd timer для обновления сертификата

### Использование

```bash
# Скопировать на сервер
scp -i ~/.ssh/surefilter-prod.pem scripts/setup-listmonk.sh \
  ubuntu@$(cd infra/envs/prod && tofu output -raw ec2_public_ip):/home/ubuntu/

# Подключиться и запустить
ssh -i ~/.ssh/surefilter-prod.pem ubuntu@<EC2_IP>
sudo bash setup-listmonk.sh
```

### После установки

- **URL**: `https://newsletters.surefilter.us`
- **Credentials**: `cat /opt/listmonk/.env`

### Управление

```bash
cd /opt/listmonk

# Логи
docker compose logs -f

# Перезапуск
docker compose restart

# Обновление listmonk
docker compose pull && docker compose up -d

# Бэкап БД
docker exec listmonk_db pg_dump -U listmonk listmonk > backup.sql
```

### Безопасность

- Порт `9000` listmonk привязан к `127.0.0.1` — не доступен снаружи напрямую
- PostgreSQL привязан к `127.0.0.1:5432` — только локальный доступ
- Nginx проксирует весь трафик с HTTPS
- Пароли в `.env` с правами `600` (только root)

