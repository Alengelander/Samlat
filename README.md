# Samlat

Kisten- und Inhaltsverwaltung mit QR-Code-Etiketten. Kisten in verschiedenen
Größen erfassen, Inhalt katalogisieren, Etiketten drucken und per Handy-Kamera
scannen, um Dinge schnell wiederzufinden.

## Tech-Stack

- **Next.js 15** (App Router, TypeScript) — Frontend + API in einem Projekt
- **PostgreSQL** + **Prisma** — Datenhaltung
- **Tailwind CSS** — mobile-first Oberfläche
- **Auth**: einfacher Login (Benutzer/Passwort), signierte Session-Cookies (`jose`)
- **QR**: `html5-qrcode` (scannen), `qrcode` (erzeugen), `pdf-lib` (Etikett-PDF)
- **Docker Compose**: App + Datenbank

## Schnellstart (Docker)

```bash
cp .env.example .env        # Werte anpassen (Passwörter, AUTH_SECRET)
# AUTH_SECRET erzeugen:  openssl rand -base64 32
docker compose up --build
```

App läuft danach auf http://localhost:3000. Erster Login mit
`ADMIN_USERNAME` / `ADMIN_PASSWORD` aus der `.env`.

Beim Start synchronisiert der Container das DB-Schema (`prisma db push`) und
legt den Admin-Benutzer an.

## Lokale Entwicklung

```bash
npm install
# Postgres bereitstellen und DATABASE_URL in .env setzen
npm run db:push
npm run init:admin
npm run dev
```

## Datenmodell

- **Box** — `code` (QR/URL), `name`, `size` (S/M/L/XL), `location`, `notes`
- **Item** — gehört zu einer Box: `name`, `quantity`, `notes`
- **User** — Login

Der QR-Code einer Kiste zeigt auf `<APP_URL>/b/<code>` und öffnet direkt die
Detailseite.

## Branches

- `main` — stabil
- `develop` — Entwicklung
