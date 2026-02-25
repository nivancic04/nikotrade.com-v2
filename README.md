# NikoTrade v2

NikoTrade v2 je Next.js web aplikacija za prikaz proizvoda, slanje upita i siguran pregled vlastitih upita putem email "magic link" prijave.

## Glavne funkcionalnosti

- landing stranica i katalog proizvoda
- detalji proizvoda po slug-u (`/proizvodi/[slug]`)
- kontakt forma koja sprema upit u bazu i salje email obavijest
- "Moji upiti" pristup preko jednokratnog linka poslanog na email
- rate limit + osnovne sigurnosne kontrole (honeypot, security headers, no-store)
- Neon PostgreSQL kao primarni storage
- fallback za proizvode iz lokalne tablice ako DB nije dostupna

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Framer Motion
- Neon/PostgreSQL (`postgres` driver)
- Nodemailer

## Struktura projekta

```txt
app/
  api/
    contact/
    inquiries/
    products/
  kontakt/
  moji-upiti/
  proizvodi/
components/
lib/
public/
  img/
sql/
```

## Pokretanje lokalno

1. Instaliraj ovisnosti:

```bash
npm install
```

2. Kopiraj env template:

```bash
cp .env.example .env
```

3. Popuni varijable u `.env` (pogledaj sekciju "Env varijable").

4. Pokreni dev server:

```bash
npm run dev
```

5. Otvori:

`http://localhost:3000`

## Env varijable

Primjer se nalazi u `.env.example`.

Obavezno za punu funkcionalnost:

- `DATABASE_URL` - Neon/PostgreSQL konekcija
- `INQUIRY_SESSION_SECRET` - tajni kljuc za session token (u produkciji mora biti jak i unikatan)
- `APP_BASE_URL` - npr. `https://tvoja-domena.com` (obavezno u produkciji)

SMTP (za slanje emailova):

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_APP_PASSWORD`
- `SMTP_SEND_TIMEOUT_MS` (opcionalno)
- `SMTP_SEND_RETRIES` (opcionalno)
- `CONTACT_RECEIVER_EMAIL`

Podesavanje trajanja tokena/sesije:

- `INQUIRY_SESSION_TTL_HOURS`
- `INQUIRY_ACCESS_TOKEN_TTL_MINUTES`
- `INQUIRY_RETENTION_DAYS`

## Baza podataka (Neon)

Pokreni SQL skripte u Neon SQL Editoru:

1. `sql/neon-init.sql` - tablice za upite i access tokene
2. `sql/neon-products-init.sql` - tablice za proizvode + inicijalni seed

Napomena:
- Ako `DATABASE_URL` nije postavljen, proizvodi ce ici iz lokalnog fallbacka (`lib/products-db.ts`).
- Upiti (`inquiries`) zahtijevaju bazu.

## API pregled

- `GET /api/products` - lista proizvoda
- `GET /api/products/[slug]` - detalji proizvoda
- `POST /api/contact` - slanje i spremanje upita
- `POST /api/inquiries/request-link` - trazi magic link za "Moji upiti"
- `GET /api/inquiries/session?token=...` - validira token i postavlja session cookie
- `GET /api/inquiries/mine` - vraca upite prijavljenog korisnika
- `POST /api/inquiries/logout` - odjava (brisanje session cookie-ja)

## Slike i static assets

Sve sto stavis u `public/` je dostupno kao static URL.

Primjer:
- datoteka: `public/img/hero-bg.png`
- URL: `/img/hero-bg.png`

## Skripte

- `npm run dev` - development
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - ESLint

## Deploy

Preporuceno: Vercel.

Prije deploya provjeri:
- sve produkcijske env varijable su postavljene
- `APP_BASE_URL` odgovara produkcijskoj domeni
- Neon baza je inicijalizirana (SQL skripte iz `sql/`)

## License

Private project / all rights reserved.
