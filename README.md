# ProsParity website

Next.js web app, FastAPI lead API and Postgres, in English and Hindi.

| Path | What it is |
| --- | --- |
| `apps/web` | Next.js, TypeScript, Tailwind, next-intl |
| `apps/web/content/metrics.ts` | Every number on the site |
| `apps/web/messages/` | All copy, in `en.json` and `hi.json` |
| `apps/web/content/legal/` | Legal text from prosparity.in |
| `apps/web/content/news.ts` | Newsroom feed. Text is in the message files |
| `apps/api` | FastAPI, SQLAlchemy, Alembic |
| `packages/api-types` | TypeScript types generated from the API's OpenAPI schema |
| `docs/` | Design system, decisions, sitemap, open items, Hindi review |

## Run locally

```bash
npm install

# API, in one terminal. SQLite needs no database server.
cd apps/api
python3.12 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
cp .env.example .env        # for SQLite, set DATABASE_URL=sqlite:///./dev.db
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --port 8000

# Site, in another terminal, from the repo root
npm run dev
```

The site is at http://localhost:3000. With Docker installed, `docker compose up` runs all three services on Postgres. That file has not been run yet: see `docs/OPEN_ITEMS.md`.

## Checks

```bash
npm run lint && npm run typecheck && npm run build
cd apps/api && .venv/bin/python -m pytest
node scripts/contrast-check.mjs
node scripts/hindi-review.mjs   # after changing copy
```

## Export leads

```bash
curl -H "X-API-Key: $EXPORT_API_KEY" https://your-api/leads/export -o leads.csv
```

## Deploy

1. **Database:** create a Postgres 16 database on Neon.
2. **API:** deploy `apps/api` to Render or Railway from its Dockerfile. Set the variables in `apps/api/.env.example`, with `SITE_ORIGIN` as the site URL and `TRUST_PROXY=true`. Migrations run on start.
3. **Web:** import the repo to Vercel with root directory `apps/web`. Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL`.

Read `docs/OPEN_ITEMS.md` before launch. The legal items in particular need closing.

## Confidentiality

The deck, its extracts and the build brief are gitignored and must stay out of the site and the repository. Only allowlisted figures go in `metrics.ts`.
