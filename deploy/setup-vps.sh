#!/usr/bin/env bash
# Preparação única da VPS (Ubuntu 24.04 com Nginx e PM2), executar como root:
#   curl -fsSL https://raw.githubusercontent.com/sergiofisio/new-pokedex/main/deploy/setup-vps.sh | bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/taverna}"
SITE=tavernadosjogos.com.br
RAW="https://raw.githubusercontent.com/sergiofisio/new-pokedex/main/deploy"

echo "==> Yarn e PM2"
command -v yarn >/dev/null || npm install -g yarn
command -v pm2 >/dev/null || npm install -g pm2

echo "==> Swap"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Pastas do app"
mkdir -p "$APP_DIR/releases" "$APP_DIR/shared"
touch "$APP_DIR/shared/.env.production"
chmod 600 "$APP_DIR/shared/.env.production"

echo "==> Nginx"
if [ ! -f "/etc/nginx/sites-available/$SITE" ]; then
  curl -fsSL "$RAW/nginx.conf" -o "/etc/nginx/sites-available/$SITE"
  ln -sfn "/etc/nginx/sites-available/$SITE" "/etc/nginx/sites-enabled/$SITE"
  nginx -t
  systemctl reload nginx
fi

echo "==> PM2 na inicialização"
systemctl is-enabled pm2-root >/dev/null 2>&1 || pm2 startup systemd -u root --hp /root >/dev/null

cat <<EOF

Pronto. Falta:
  1. Colar as variáveis em $APP_DIR/shared/.env.production
  2. Rodar o primeiro deploy pelo GitHub Actions
  3. Depois de apontar o DNS para esta VPS:
     certbot --nginx -d $SITE -d www.$SITE --redirect
EOF
