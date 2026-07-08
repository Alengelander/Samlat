#!/bin/sh
set -e

echo "[samlat] Warte auf Datenbank & synchronisiere Schema..."
# Wiederholen, bis die DB erreichbar ist (Compose-Healthcheck deckt das i.d.R. ab).
until npx prisma db push --skip-generate --accept-data-loss; do
  echo "[samlat] DB noch nicht bereit, neuer Versuch in 3s..."
  sleep 3
done

echo "[samlat] Lege Admin-Benutzer an/aktualisiere ihn..."
node scripts/init-admin.mjs

echo "[samlat] Starte Next.js..."
exec npx next start -p 3000
