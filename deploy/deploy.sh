#!/usr/bin/env bash
# Executado na VPS: ssh vps "bash -s -- <commit>" < deploy/deploy.sh
set -euo pipefail

SHA="${1:?informe o commit}"
APP_DIR="${APP_DIR:-/var/www/taverna}"
APP_PORT="${APP_PORT:-3010}"
REPO="${REPO:-https://github.com/sergiofisio/new-pokedex.git}"
KEEP=3

RELEASE="$APP_DIR/releases/$(date +%Y%m%d%H%M%S)-${SHA:0:7}"
PREVIOUS="$(readlink -f "$APP_DIR/current" 2>/dev/null || true)"

if [ ! -f "$APP_DIR/shared/.env.production" ]; then
  echo "Falta $APP_DIR/shared/.env.production" >&2
  exit 1
fi

exec 9>"$APP_DIR/deploy.lock"
flock -n 9 || { echo "Outro deploy em andamento" >&2; exit 1; }

echo "==> Baixando $SHA"
mkdir -p "$RELEASE"
git -C "$RELEASE" init -q
git -C "$RELEASE" remote add origin "$REPO"
git -C "$RELEASE" fetch -q --depth 1 origin "$SHA"
git -C "$RELEASE" checkout -q FETCH_HEAD
ln -s "$APP_DIR/shared/.env.production" "$RELEASE/.env.production"

echo "==> Instalando dependências"
cd "$RELEASE"
yarn install --frozen-lockfile --non-interactive --network-timeout 600000

echo "==> Compilando"
NODE_OPTIONS="--max-old-space-size=3072" NEXT_TELEMETRY_DISABLED=1 yarn build

switch_to() {
  ln -sfn "$1" "$APP_DIR/current.tmp"
  mv -Tf "$APP_DIR/current.tmp" "$APP_DIR/current"
  APP_DIR="$APP_DIR" APP_PORT="$APP_PORT" pm2 startOrReload "$APP_DIR/current/ecosystem.config.cjs" --update-env
}

healthy() {
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null "http://127.0.0.1:$APP_PORT/robots.txt"; then
      return 0
    fi
    sleep 2
  done
  return 1
}

echo "==> Publicando"
switch_to "$RELEASE"

if ! healthy; then
  echo "A nova versão não respondeu" >&2
  if [ -n "$PREVIOUS" ] && [ -d "$PREVIOUS" ]; then
    echo "==> Voltando para $(basename "$PREVIOUS")" >&2
    switch_to "$PREVIOUS"
  fi
  exit 1
fi

pm2 save >/dev/null

echo "==> Limpando versões antigas"
ls -1dt "$APP_DIR"/releases/* | tail -n +$((KEEP + 1)) | xargs -r rm -rf

echo "==> Publicado: $(basename "$RELEASE")"
