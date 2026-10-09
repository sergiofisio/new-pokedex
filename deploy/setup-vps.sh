#!/usr/bin/env bash
# Preparação única da VPS (Ubuntu 24.04), executar como root:
#   curl -fsSL https://raw.githubusercontent.com/sergiofisio/new-pokedex/main/deploy/setup-vps.sh | bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/taverna}"
RAW="https://raw.githubusercontent.com/sergiofisio/new-pokedex/main/deploy"

echo "==> Pacotes do sistema"
apt-get update -qq
apt-get install -y -qq git curl ufw debian-keyring debian-archive-keyring apt-transport-https gnupg

echo "==> Yarn e PM2"
command -v yarn >/dev/null || npm install -g yarn
command -v pm2 >/dev/null || npm install -g pm2

echo "==> Caddy"
if ! command -v caddy >/dev/null; then
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq
  apt-get install -y -qq caddy
fi
mkdir -p /etc/caddy/certs /var/log/caddy
chown caddy:caddy /var/log/caddy
curl -fsSL "$RAW/Caddyfile" -o /etc/caddy/Caddyfile

echo "==> Swap"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Firewall"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

echo "==> Pastas do app"
mkdir -p "$APP_DIR/releases" "$APP_DIR/shared"
touch "$APP_DIR/shared/.env.production"
chmod 600 "$APP_DIR/shared/.env.production"

echo "==> PM2 na inicialização"
pm2 startup systemd -u root --hp /root >/dev/null

cat <<EOF

Pronto. Falta:
  1. Colar as variáveis em $APP_DIR/shared/.env.production
  2. Colar o certificado de origem do Cloudflare em
     /etc/caddy/certs/origin.pem e /etc/caddy/certs/origin.key
     e rodar: chown -R caddy:caddy /etc/caddy/certs && chmod 600 /etc/caddy/certs/origin.key && systemctl reload caddy
  3. Rodar o primeiro deploy pelo GitHub Actions
EOF
