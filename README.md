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

## Lokale Entwicklung (ohne Docker, SQLite)

Für schnelles Entwickeln ohne PostgreSQL/Docker. Nutzt eine SQLite-Datei über
das separate Schema `prisma/schema.dev.prisma` (Modelle mit dem Postgres-Schema
synchron halten!).

```bash
cp .env.example .env   # AUTH_SECRET setzen, DEV_DATABASE_URL=file:./dev.db
npm install
npm run dev:db         # SQLite-Schema anlegen -> prisma/dev.db
npm run dev:init       # Admin-Benutzer aus .env anlegen
npm run dev            # http://localhost:3000
```

> Hinweis: `npm install` regeneriert den Prisma-Client gegen das Postgres-Schema.
> Danach für lokale SQLite-Arbeit erneut `npm run dev:db` ausführen.

## Datenmodell

- **BoxType** (Kistenart) — `name`, `liters`, `dimensions`, `image` (in DB), verwaltet
  unter **Einstellungen**. Vorbefüllt mit den IKEA-SAMLA-Größen.
- **Box** — `code` (Nummer, QR/URL), `name`, `type` → BoxType, `location`, `notes`
- **Item** — gehört zu einer Box: `name`, `quantity`, `notes`
- **User** — Login

Die Kisten-Nummer beginnt mit der Litergröße der Kistenart, z.B. `45-001`
(1. Kiste der 45-l-Größe) — so ist die Größe direkt ablesbar. Der QR-Code zeigt
auf `<APP_URL>/b/<nummer>` und öffnet direkt die Detailseite.

## Branches

- `main` — stabil
- `develop` — Entwicklung
