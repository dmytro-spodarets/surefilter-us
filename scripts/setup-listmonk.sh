#!/usr/bin/env bash
# =============================================================================
# Setup script for listmonk newsletter server
# Target: Ubuntu 24.04 LTS (ARM64) — newsletters.surefilter.us
# Installs: Docker, Docker Compose, Nginx, Certbot, listmonk
# =============================================================================
set -euo pipefail

DOMAIN="newsletters.surefilter.us"
EMAIL="ds@surefilter.us"
LISTMONK_DIR="/opt/listmonk"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# Must run as root
[[ $EUID -eq 0 ]] || err "Run as root: sudo bash $0"

# ─────────────────────────────────────────────────────────────────────────────
# 1. System update
# ─────────────────────────────────────────────────────────────────────────────
log "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# ─────────────────────────────────────────────────────────────────────────────
# 2. Install Docker (official repo)
# ─────────────────────────────────────────────────────────────────────────────
if command -v docker &>/dev/null; then
  log "Docker already installed: $(docker --version)"
else
  log "Installing Docker..."
  apt-get install -y -qq ca-certificates curl

  # Add Docker GPG key (DEB822 format for Ubuntu 24.04+)
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  # Add Docker repository (DEB822 .sources format)
  tee /etc/apt/sources.list.d/docker.sources > /dev/null <<DOCKERREPO
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
DOCKERREPO

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  systemctl enable --now docker
  log "Docker installed: $(docker --version)"
fi

# Add ubuntu user to docker group
usermod -aG docker ubuntu 2>/dev/null || true

# ─────────────────────────────────────────────────────────────────────────────
# 3. Install Nginx
# ─────────────────────────────────────────────────────────────────────────────
if command -v nginx &>/dev/null; then
  log "Nginx already installed: $(nginx -v 2>&1)"
else
  log "Installing Nginx..."
  apt-get install -y -qq nginx
  systemctl enable --now nginx
  log "Nginx installed"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. Install Certbot
# ─────────────────────────────────────────────────────────────────────────────
if command -v certbot &>/dev/null; then
  log "Certbot already installed"
else
  log "Installing Certbot..."
  apt-get install -y -qq certbot python3-certbot-nginx
  log "Certbot installed"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. Setup listmonk directory and docker-compose.yml
# ─────────────────────────────────────────────────────────────────────────────
log "Setting up listmonk in ${LISTMONK_DIR}..."
mkdir -p "${LISTMONK_DIR}/uploads"

# Read DB password from .env (will be created in step 6, but needed here for template)
# On first run .env doesn't exist yet, so we generate password early
if [[ ! -f "${LISTMONK_DIR}/.env" ]]; then
  _DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
  _ADMIN_PASS=$(openssl rand -base64 18 | tr -d '/+=' | head -c 16)
else
  _DB_PASS=$(grep LISTMONK_DB_PASSWORD "${LISTMONK_DIR}/.env" | cut -d= -f2)
  _ADMIN_PASS=$(grep LISTMONK_ADMIN_PASSWORD "${LISTMONK_DIR}/.env" | cut -d= -f2)
fi

cat > "${LISTMONK_DIR}/docker-compose.yml" << COMPOSE
services:
  app:
    image: listmonk/listmonk:latest
    container_name: listmonk_app
    restart: unless-stopped
    ports:
      - "127.0.0.1:9000:9000"
    networks:
      - listmonk
    hostname: newsletters.surefilter.us
    depends_on:
      db:
        condition: service_healthy
    command:
      - sh
      - -c
      - "./listmonk --install --idempotent --yes --config '' && ./listmonk --upgrade --yes --config '' && ./listmonk --config ''"
    environment:
      LISTMONK_app__address: "0.0.0.0:9000"
      LISTMONK_db__user: "listmonk"
      LISTMONK_db__password: "${_DB_PASS}"
      LISTMONK_db__database: "listmonk"
      LISTMONK_db__host: "db"
      LISTMONK_db__port: "5432"
      LISTMONK_db__ssl_mode: "disable"
      LISTMONK_db__max_open: "25"
      LISTMONK_db__max_idle: "25"
      LISTMONK_db__max_lifetime: "300s"
      TZ: "America/New_York"
      LISTMONK_ADMIN_USER: "admin"
      LISTMONK_ADMIN_PASSWORD: "${_ADMIN_PASS}"
    volumes:
      - ./uploads:/listmonk/uploads:rw

  db:
    image: postgres:17-alpine
    container_name: listmonk_db
    restart: unless-stopped
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      - listmonk
    environment:
      POSTGRES_USER: "listmonk"
      POSTGRES_PASSWORD: "${_DB_PASS}"
      POSTGRES_DB: "listmonk"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U listmonk"]
      interval: 10s
      timeout: 5s
      retries: 6
    volumes:
      - listmonk-data:/var/lib/postgresql/data

networks:
  listmonk:

volumes:
  listmonk-data:
COMPOSE

# ─────────────────────────────────────────────────────────────────────────────
# 6. Create .env file for listmonk credentials
# ─────────────────────────────────────────────────────────────────────────────
# Save credentials to .env (passwords were generated in step 5)
cat > "${LISTMONK_DIR}/.env" << EOF
LISTMONK_DB_PASSWORD=${_DB_PASS}
LISTMONK_ADMIN_USER=admin
LISTMONK_ADMIN_PASSWORD=${_ADMIN_PASS}
EOF

chmod 600 "${LISTMONK_DIR}/.env"
log "Credentials saved to ${LISTMONK_DIR}/.env"

# ─────────────────────────────────────────────────────────────────────────────
# 7. Configure Nginx reverse proxy (HTTP first, then SSL)
# ─────────────────────────────────────────────────────────────────────────────
log "Configuring Nginx for ${DOMAIN}..."

cat > /etc/nginx/sites-available/listmonk << NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    # Certbot webroot
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        client_max_body_size 50M;
    }
}
NGINX

# Enable site, disable default
ln -sf /etc/nginx/sites-available/listmonk /etc/nginx/sites-enabled/listmonk
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
log "Nginx configured (HTTP)"

# ─────────────────────────────────────────────────────────────────────────────
# 8. Start listmonk
# ─────────────────────────────────────────────────────────────────────────────
log "Starting listmonk..."
cd "${LISTMONK_DIR}"
docker compose up -d

# Wait for app to be healthy
log "Waiting for listmonk to start..."
for i in {1..30}; do
  if curl -sf http://127.0.0.1:9000 > /dev/null 2>&1; then
    log "listmonk is running!"
    break
  fi
  sleep 2
done

# ─────────────────────────────────────────────────────────────────────────────
# 9. SSL certificate via Let's Encrypt
# ─────────────────────────────────────────────────────────────────────────────
log "Obtaining SSL certificate for ${DOMAIN}..."
certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" --redirect

log "SSL certificate installed"

# ─────────────────────────────────────────────────────────────────────────────
# 10. Setup auto-renewal cron
# ─────────────────────────────────────────────────────────────────────────────
systemctl enable --now certbot.timer 2>/dev/null || {
  # Fallback: add cron job if systemd timer not available
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | sort -u | crontab -
  log "Certbot renewal cron added"
}

# ─────────────────────────────────────────────────────────────────────────────
# Done!
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════"
log "listmonk is ready!"
echo ""
echo "  URL:    https://${DOMAIN}"
echo "  Admin:  See credentials in ${LISTMONK_DIR}/.env"
echo ""
echo "  Useful commands:"
echo "    cd ${LISTMONK_DIR}"
echo "    docker compose logs -f        # View logs"
echo "    docker compose restart        # Restart"
echo "    docker compose pull && docker compose up -d  # Update"
echo "═══════════════════════════════════════════════════════════════"
