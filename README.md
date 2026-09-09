# MedAscend — MRCP Part 1 revision platform

A complete, production-ready web platform for MRCP(UK) Part 1 revision: a best-of-five question bank with Tutor and Timed modes, bespoke past papers, blueprint-weighted mock exams, a high-yield textbook, analytics with peer comparison, an optional AI tutor, Stripe payments, a 48-hour free trial and a full admin panel for managing every piece of content.

Built with **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6 · PostgreSQL**.

---

## Features

### Public site
- Marketing home page, pricing (3 / 6 / 12 months, one-off), MRCP Part 1 exam guide with the official specialty blueprint and 2026 dates, blog, about, help centre, contact form, privacy / terms / refund policy.
- SEO metadata, Open Graph, sitemap and robots.

### Learner app (`/dashboard`)
- **Qbank builder** – filter by specialty, difficulty, familiarity (unseen / incorrect / correct / flagged) and keyword; up to 100 questions; **Tutor mode** (instant feedback) or **Timed mode** (exam conditions, 1.8 min/question or custom).
- **Question player** – best-of-five UI, per-option explanations, learning points, peer "% answered correctly", flags, autosaving notes, question navigator, keyboard shortcuts (A–E, Enter, ←/→, F), countdown timer with auto-submit.
- **Results** – score vs 60% pass line, time per question, peer comparison, specialty breakdown, full review with filters.
- **Past papers & mocks** – fixed papers created by admins plus unlimited randomly generated 100-question mocks weighted to the exam blueprint.
- **Textbook** – markdown topics per specialty with prev/next navigation and "test yourself" links.
- **Analytics** – readiness score, accuracy by specialty vs peers, difficulty breakdown, 30-day activity, score trend, streak.
- **Flagged, Notes (sticky-note board with labels), History, Search, Account** (profile, exam-date countdown, password, light/dark/system theme, reset progress).
- **AI tutor** side panel on every question (Anthropic API; Socratic before answering, full explanation after).
- **Access control** – 48-hour trial with 100 questions + full textbook; paid plans unlock everything. Subscriptions extend rather than overwrite.

### Admin panel (`/admin`)
- Dashboard: users, active subscriptions, revenue, answers, bank coverage vs blueprint, hardest questions.
- **Questions**: create/edit with five options and per-option explanations, difficulty, tags, status (draft/published/archived), trial flag; search & filters; bulk publish/archive/trial; **JSON bulk import** (file or paste) with validation report.
- **Specialties** & blueprint weights. **Papers**: create, search-and-add questions, blueprint auto-fill, publish.
- **Textbook topics** and **blog articles** with markdown editor + live preview.
- **Users**: filter by access, grant/revoke plans, extend trial, change role, reset password, delete.
- **Plans & pricing**, **testimonials**, **contact messages**.

---

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env      # then edit DATABASE_URL, AUTH_SECRET, ADMIN_* etc.

# 3. Database (needs PostgreSQL – see options below)
npx prisma migrate deploy  # or: npm run db:migrate  (creates a new migration if the schema changed)
npm run db:seed            # specialties, plans, admin user, sample content

# 4. Run
npm run dev                # http://localhost:3000
```

Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` → **Admin panel** in the sidebar.
The first user to register on an empty database also becomes an admin.

### PostgreSQL options
- **No Postgres installed (Windows/Mac/Linux, no Docker):** `npm i -D embedded-postgres` once, then `npm run db:local` starts a real PostgreSQL on `127.0.0.1:5544` (data in `./.pgdata`). Use `DATABASE_URL="postgresql://medascend:medascend@127.0.0.1:5544/medascend?schema=public"`.
- **Docker:** `docker compose up db -d` then `DATABASE_URL=postgresql://medascend:medascend@localhost:5432/medascend?schema=public`.
- **Hosted:** Neon, Supabase, Railway, RDS – any Postgres works. Make sure the database encoding is **UTF-8** (the default everywhere except some Windows installs).
- If you connect through a transaction-mode pooler (PgBouncer, Supabase pooler, Prisma Postgres), append `&pgbouncer=true` to `DATABASE_URL`.

### Seed content
`npm run db:seed` loads specialties with blueprint weights, the three plans, testimonials, the admin user and – if present – the sample content in `prisma/seed-data/` (`questions.json`, `topics.json`, `articles.json`). It is idempotent. Add your real question bank via **Admin → Bulk import** (same JSON format – see the import page for the schema) or the question editor.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AUTH_SECRET` | yes | 32+ random chars for signing session cookies (`openssl rand -base64 48`) |
| `NEXT_PUBLIC_APP_URL` | yes | Public URL, e.g. `https://medascend.app` (used in emails, Stripe redirects, sitemap) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | seed only | Initial admin account |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | optional | Enables card checkout. Without them, the checkout page shows a "contact us" notice and admins grant access manually |
| `ANTHROPIC_API_KEY` | optional | Enables the AI tutor for paid users |
| `RESEND_API_KEY`, `EMAIL_FROM` | optional | Password-reset emails via Resend. Without it the reset link is printed to the server log |

---

## Deployment

### Vercel (recommended)
1. Push the repo to GitHub and import it in Vercel.
2. Add the environment variables above (use Neon/Supabase for `DATABASE_URL`).
3. Build command: `npm run build` (runs `prisma generate` automatically). Set the **Install Command** to `npm ci` and add a build step or a one-off `npx prisma migrate deploy` (e.g. via Vercel's "Deploy Hooks" or run it locally against the production DB before the first deploy).
4. After the first deploy run `npm run db:seed` locally with the production `DATABASE_URL` to create the admin user and plans.
5. Stripe → Developers → Webhooks → add `https://<your-domain>/api/stripe/webhook` listening to `checkout.session.completed`; copy the signing secret to `STRIPE_WEBHOOK_SECRET`.

### Docker / any VPS
```bash
cp .env.example .env   # set AUTH_SECRET, NEXT_PUBLIC_APP_URL, keys…
docker compose up -d --build
docker compose exec web npx tsx prisma/seed.ts   # first run only
```
The container runs `prisma migrate deploy` on start, so schema changes apply automatically on redeploy. Put a reverse proxy (Caddy / nginx) with TLS in front of port 3000.

### Health check
`GET /api/health` returns `{ ok: true }` when the app and database are reachable.

---

## Project structure

```
prisma/               schema, migrations, seed script and seed-data/
src/app/(marketing)   public pages (home, pricing, exam guide, blog, legal…)
src/app/(auth)        login, register, forgot/reset password (+ server actions)
src/app/(app)         learner app: dashboard, qbank, session player, papers, textbook, analytics…
src/app/admin         admin panel (+ actions.ts with all admin server actions)
src/app/api           route handlers: session answers, flags, AI tutor, Stripe webhook, health
src/components        ui primitives, marketing sections, app & admin shells, charts
src/lib               db client, auth/session, access rules, session builder, analytics, stripe, email
src/proxy.ts          route protection (Next 16 "proxy", formerly middleware)
```

## Scripts
| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server / production build / serve |
| `npm run typecheck` / `lint` | TypeScript and ESLint |
| `npm run db:migrate` | create + apply a migration in development |
| `npm run db:deploy` | apply pending migrations (production) |
| `npm run db:seed` | seed reference data & sample content |
| `npm run db:local` | run a local PostgreSQL without Docker (needs `embedded-postgres` dev dependency) |
| `npm run db:studio` | Prisma Studio GUI |

## Security notes
- Passwords are hashed with bcrypt; sessions are HS256 JWTs in `httpOnly`, `sameSite=lax`, `secure` cookies.
- All mutations run through server actions / route handlers that re-check the user and role server-side.
- Timed sessions never send correct answers to the browser before completion.
- Security headers are set in `next.config.ts`; robots disallow private routes.

## Licence
Proprietary – all rights reserved. MedAscend is an independent revision resource and is not affiliated with MRCP(UK).
