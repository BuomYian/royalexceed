# Exceed Limited — Website & Admin CMS

Production-ready dealership website and admin dashboard for **Exceed Limited**, the sole
authorized distributor of Soueast and 212 vehicles in South Sudan and Sudan, operating in
partnership with FBM International Co. Built with Next.js 16 (App Router), Prisma + Supabase
(Postgres + Auth), and Cloudinary (media storage).

Full requirements are in [`docs/fbm-international-website-prompt.md`](docs/fbm-international-website-prompt.md)
(the original spec was written under the working name "FBM International" — the company and
partner names were finalized as Exceed Limited / FBM International Co. after the initial build;
see "Rebrand notes" below).

---

## ⚠️ Before go-live

This build ships with **placeholder business data** (neither the spec nor the rebrand supplied
final values). Search the codebase for these and replace with real values before launch:

| Placeholder | Where |
|---|---|
| Phone `+211 92 000 0000`, WhatsApp `211920000000` | `lib/settings.ts` (`DEFAULT_SITE_SETTINGS`), `prisma/seed.ts`, admin → Settings |
| Email `info@exceedlimited.com` + department emails | same as above |
| Opening hours, address, map coordinates (`4.8517, 31.5825` — approximate Juba Town) | same as above |
| Social links (Facebook/Instagram/TikTok/X) | same as above |
| Brand colors (deep burgundy accent on near-black, per spec §5 fallback) | `app/globals.css` |
| Vehicle photography (currently `placehold.co` placeholders) | reseed via the admin Media Library / Models editor |
| First admin credentials `admin@exceedlimited.com` / `ChangeMe123!` | change the password immediately after first login |

All of the above are also editable **without a redeploy** from `/admin/settings`, `/admin/models`,
and `/admin/media` once the site is live — the seed values just need to exist for first boot.

---

## Tech stack

- **Framework:** Next.js 16 (App Router, RSC, TypeScript strict) — see "Next.js 16 notes" below
- **Styling:** Tailwind CSS v4 + shadcn/ui (Base UI primitives, not Radix — see notes below), `lucide-react`
- **Database:** PostgreSQL on Supabase, via **Prisma 6** (see "Prisma 7" note below)
- **Auth:** Supabase Auth (email + password) for `/admin` staff only; public site needs no login
- **Media storage:** **Cloudinary** (not Supabase Storage — see "Media storage" below)
- **Forms:** React Hook Form + Zod, shared client/server schemas
- **Email:** Resend, with a console dev-transport fallback when unconfigured
- **Rich text:** Tiptap, sanitized with DOMPurify on save and on render
- **i18n:** next-intl — `en` fully translated, `ar` scaffolded (RTL-ready, English fallback copy)
- **Tests:** Vitest (unit) + Playwright (2 critical E2E flows)

---

## Local setup

### 1. Prerequisites

- Node.js 20.9+ (this repo was built/tested on Node 24)
- Docker (for the local Supabase stack)
- The [Supabase CLI](https://supabase.com/docs/guides/cli) (invoked here via `npx supabase`, no global install needed)

### 2. Install dependencies

```bash
npm install
```

### 3. Start local Supabase (Postgres + Auth)

```bash
npm run supabase:start
```

> We pass `--ignore-health-check` because this stack's Docker healthchecks are flaky on
> resource-constrained hosts even once every service is actually up — `supabase status` after
> start confirms the real state. If ports `54321-54324` are already in use by another local
> Supabase project, this repo is pre-configured to use `55321-55329` instead
> (see `supabase/config.toml`).

Grab your local credentials:

```bash
npx supabase status -o json
```

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55322/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:55322/postgres"
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:55321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<ANON_KEY from supabase status>"
SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY from supabase status>"
```

(Ports above match this repo's `supabase/config.toml`; adjust if you changed them.)

### 4. Media storage — Cloudinary

Create a free [Cloudinary](https://cloudinary.com) account, then from the dashboard copy:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

No bucket/preset setup needed — `lib/media.ts` uploads directly into `fbm/{vehicles,inventory,news,brand,documents}` folders under your Cloudinary account on first use, and Cloudinary strips EXIF metadata from uploads by default.

### 5. Run migrations and seed the database

```bash
npm run db:migrate   # applies prisma/migrations/* (includes an RLS-enable migration — see below)
npm run db:seed      # creates the super admin, site settings, 5 Soueast + 2 212 models, inventory, news, testimonials
```

The seed script prints the super admin's email/password — sign in at `/admin/login`.

### 6. Run the app

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- Supabase Studio (DB/Auth browser): http://localhost:55323 (or whatever `STUDIO_URL` `supabase status` reports)

---

## Creating additional admin users

Sign in as the seeded `SUPER_ADMIN` → `/admin/users` → **Invite staff**. This calls
`supabase.auth.admin.inviteUserByEmail` and creates the matching `User` row with the role you
pick. Roles and their permissions are documented in `lib/rbac.ts`.

---

## Tests

```bash
npm run build          # production build — passes with full TypeScript type-checking, all 48 routes
npm run test:unit      # Vitest — schemas, currency, slug, rbac (31 tests)
npm run test:e2e       # Playwright — the 2 critical flows from spec §14
```

All three pass as of this build, verified against the seeded local Supabase stack (`npm run
build && npm run start`, then the full Vitest + Playwright suite green in ~35s total).

The E2E suite (`playwright.config.ts`) reuses whatever's already running on `localhost:3000`
(`npm run dev` or `npm run start`) if present, otherwise it starts `npm run start` itself — so
run `npm run build` first if nothing is running.

**Sandbox note:** if you're running this in a minimal/headless Linux container, Playwright's
bundled Chromium needs a handful of shared libraries (`libatk-1.0`, `libnss3`,
`libwayland-server0`, etc.) that `apt-get install` may need root for. If you don't have root,
`apt-get download <pkg>` + `dpkg-deb -x <pkg>.deb <dir>` + `LD_LIBRARY_PATH=<dir>/usr/lib/x86_64-linux-gnu`
works without it. On a memory-constrained host, run `npx playwright test` with only the app +
Postgres/Auth containers up (stop `supabase_studio`/`supabase_realtime`/`supabase_inbucket` if
needed) — Chromium alongside `next dev` + Docker Postgres can OOM on <4GB free RAM, which
surfaces as flaky "Target page, context or browser has been closed" failures unrelated to the
app itself.

---

## Deployment

### Supabase (hosted project)

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. `npx supabase link --project-ref <ref>`, then `npx prisma migrate deploy` against the
   project's **direct** connection string (port 5432) to apply all migrations, including the
   RLS-enable migration.
3. Copy the hosted project's `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` into your production env.
4. Set `DATABASE_URL` to the **pooler** connection string (port 6543, `?pgbouncer=true&connection_limit=1`)
   and `DIRECT_URL` to the **direct** connection string (port 5432) — this split matters in
   serverless (Vercel) deployments to avoid exhausting Postgres connections.
5. Run `SEED_SUPER_ADMIN_EMAIL=... SEED_SUPER_ADMIN_PASSWORD=... npx tsx prisma/seed.ts` once
   against production (or just create the first admin manually via Supabase Auth + a matching
   `User` row — the seed script is idempotent either way).

### Vercel (frontend)

1. Import the repo, set the framework to Next.js.
2. Add every variable from `.env.example` in Project Settings → Environment Variables.
3. Deploy. `vercel.json` is included for any project-level overrides you need.

### Cloudinary

No extra production setup — the same cloud name/API key/secret work in any environment. Consider
a dedicated Cloudinary "production" account/folder if you want to keep dev and prod media fully
separate.

---

## Architecture notes & deviations from the spec's "starting point"

The spec explicitly frames its Prisma schema and stack list as a **starting point — extend as
needed**. Everything below was extended or adjusted for a concrete, working build, and is
reversible if requirements change:

- **Media storage is Cloudinary, not Supabase Storage.** The spec's default was Supabase Storage
  buckets; the client redirected to Cloudinary mid-build. `lib/media.ts` is the single seam —
  swapping back to Supabase Storage means rewriting that file only (`uploadMedia`/`deleteMedia`/
  `isMediaInUse`) plus `lib/data/media.ts`'s listing function; every call site just passes a
  `folder`/`bucket` name and gets back a URL, so nothing above that layer needs to change.
- **Next.js 16, not 15.** `create-next-app` scaffolded 16.3.1 (satisfies the spec's "15+"). Two
  16-specific changes worth knowing:
  - `middleware.ts` is renamed to **`proxy.ts`** (exported function must be named `proxy`,
    edge runtime no longer supported there). Auth/locale routing logic is unchanged, just the
    filename/export name.
  - Because this app has **two root layouts** (`app/[locale]/layout.tsx` for the public site,
    `app/admin/layout.tsx` for the CMS — no shared `app/layout.tsx`), a global 404 needs
    `experimental.globalNotFound` (see `next.config.ts` and `app/global-not-found.tsx`).
- **Prisma pinned to 6.x, not 7.** Prisma 7 removed `url`/`directUrl` from the `datasource` block
  in `schema.prisma` in favor of a `prisma.config.ts` + driver-adapter pattern. The spec's schema
  (and most Prisma+Supabase tutorials) assume the classic pattern, so this repo pins
  `prisma`/`@prisma/client` to the latest 6.x rather than adopting the 7.x config rewrite.
- **`@tanstack/react-table` pinned to 8.x, not 9.** v9 is a ground-up API redesign (no
  `useReactTable`/`getCoreRowModel`/`ColumnDef` — a different hooks-based API entirely).
  `components/admin/data-table.tsx` (and everything built on it: models/inventory tables) uses
  the stable, widely-documented v8 API.
- **shadcn/ui here is built on [Base UI](https://base-ui.com)**, not Radix — this project's
  `components.json` uses the `base-nova` style. The practical difference: composing a component
  as another element uses Base UI's **`render` prop** (`<Button render={<Link href="/x" />} />`),
  not Radix's `asChild` boolean pattern. `lucide-react` v1 also dropped trademarked brand icons
  (Facebook/Instagram/TikTok/X) — see `components/shared/social-icons.tsx` for small inline SVG
  replacements.
- **`Sequence` and `RateLimitHit` models** were added to the Prisma schema beyond the spec's
  listing: `Sequence` backs atomic `TD-2026-0143`/`SV-2026-0087` reference numbers (raw
  `INSERT ... ON CONFLICT DO UPDATE`), and `RateLimitHit` backs IP+phone rate limiting on public
  forms without adding a Redis dependency the spec didn't call for.
- **Row Level Security**: enabled on every table (see
  `prisma/migrations/20260818074503_enable_row_level_security`) with **zero policies** — the app
  never queries Postgres through Supabase's REST/Data API (Prisma connects directly as the
  `postgres` role, which owns the tables and bypasses RLS), so this exists purely as a safety net
  in case that API is ever reachable with the anon/authenticated key.
- **Currency is USD only, not dual USD/SSP.** The spec's §4 called for a USD/SSP toggle backed by
  an admin-editable exchange rate; the client confirmed pricing is purely USD. `SiteSetting.usdToSsp`
  was dropped from the schema (see the corresponding migration), `PriceDisplay` no longer has a
  currency-toggle button, and `lib/currency.ts` only formats USD. If SSP pricing is needed later,
  reintroduce `usdToSsp` on `SiteSetting` and restore the toggle in `PriceDisplay`/`lib/currency.ts`
  — every call site already passes a plain USD amount, so the conversion layer would slot back in
  without touching pages.
- **Finance page** renders the spec's own documented fallback ("coming soon" enquiry variant) —
  no financing partners were confirmed.
- **Admin CMS is English-only** — the i18n requirement targets the public site; localizing ~80
  internal admin strings for a staff-only tool wasn't judged worth the added complexity.
- **`useForm()` is called without an explicit generic** across every form in this repo (e.g.
  `useForm({ resolver: zodResolver(schema) })`, not `useForm<SchemaType>({...})`). With Zod v4 +
  `@hookform/resolvers`, schemas that use `z.coerce`/`z.preprocess` (see `optionalNumber` above)
  have a different *input* type (what the DOM produces before validation) than *output* type
  (`z.infer<>`, after coercion) — forcing the output type onto `useForm`'s generic breaks the
  resolver's own type and fails `next build`'s type-check (dev mode doesn't catch it). Letting
  `useForm` infer from the resolver, and inlining `onSubmit` as
  `const onSubmit = form.handleSubmit((values) => {...})` instead of a separately-typed named
  function, sidesteps this cleanly. Keep this pattern for any new form.

## Rebrand notes

The site was originally built for a company named "FBM International" per the original spec
(`docs/fbm-international-website-prompt.md`). Partway through the build, the actual business
identity was clarified:

- **Exceed Limited** is the company operating this site — sole authorized distributor of
  **Soueast and 212** vehicles in **South Sudan and Sudan**.
- **FBM International Co.** is Exceed Limited's principal in-market partner (named throughout
  the trust/partnership copy — hero trust bar, footer tagline, About page, JSON-LD description —
  but not the operating company itself).
- The vehicle lineup expanded from Soueast-only to **Soueast + 212** (212 is a retro-styled,
  off-road-focused brand): two new seeded models, `212 T01` and `212 T02`, follow the exact same
  data shape as the five Soueast models (variants, colors, spec groups, feature blocks) — no
  schema change was needed, since `Model.name`/`displayName` already carries the brand
  (`"S07"` / `"Soueast S07"`, `"T01"` / `"212 T01"`). `lib/seo.ts`'s `vehicleProductJsonLd` derives
  the JSON-LD `brand` from the first word of `displayName` rather than hardcoding "Soueast", so
  this scales to a third brand without another code change.
- One showroom (Juba Town) serves both South Sudan and Sudan for now — no second physical
  location was added. If Sudan gets its own showroom later, extend `SiteSetting.data` with a
  `locations: []` array (currently a single `address` object) and update `LocationBlock`/`/contact`
  to render multiple entries.
- Inventory stock-number prefixes changed from `FBM-*` to `EXL-*` (e.g. `EXL-S07-0001`) to match
  the new company name.
- Contact email domain placeholders moved from `fbminternational.com` to `exceedlimited.com`
  (still flagged "REPLACE BEFORE GO-LIVE" like every other placeholder above).

## Known gaps / follow-ups

- **Label↔control association**: most public form fields (`TestDriveForm`, `ServiceBookingForm`,
  the admin `ModelForm`'s text fields) now properly associate `<Label htmlFor>` with their input's
  `id` (fixed after the E2E tests caught screen-reader/automation issues from unassociated
  labels). A few less-trafficked forms (`PartsEnquiryForm`, `FinanceEnquiryForm`,
  `ContactForm`) still use sibling `<Label>`/`<Input>` pairs without explicit `id`/`htmlFor` —
  visually and functionally fine, but a screen reader won't announce the field's purpose on
  focus. Same fix pattern as `TestDriveForm` (add an `id`/`htmlFor` pair, or the auto-`useId()`
  pattern in `ModelForm`'s `Field` helper).
- **Lighthouse ≥90 mobile**: not run against a real deployed build in this environment (only
  directional `next dev` testing). Run `npx lighthouse <deployed-url> --preset=perf
  --form-factor=mobile` after your first Vercel deploy to confirm.
- **Turnstile / Resend**: both degrade gracefully without real keys (dev pass-through / console
  log respectively) so local dev and the E2E suite aren't blocked. Add real keys before
  go-live — see `.env.example`.
- **Arabic translation**: `messages/ar.json` is currently an English-copy scaffold with RTL
  wired up structurally (`dir="rtl"`, logical CSS properties throughout). Translating the actual
  copy is a content task, not a code task.

---

## Project structure

```
app/
  [locale]/                   # public site root layout (dark theme, next-intl)
    (public)/                 # /, /models, /models/[slug], /compare, /inventory, ...
  admin/                      # admin CMS root layout (light theme)
    login/
    (dashboard)/              # authenticated shell: sidebar/topbar + all admin modules
  api/leads/                  # REST example for external clients (spec §9)
  sitemap.ts, robots.ts
  global-not-found.tsx, global-error.tsx   # multi-root-layout fallbacks (Next 16)
lib/
  actions/                    # Server Actions (mutations) — one file per domain
  data/                       # read-only query helpers for public pages
  validations/                # Zod schemas, shared by forms (client) and actions (server)
  supabase/                   # server/client/middleware Supabase clients
  rbac.ts, auth.ts            # role matrix + session helpers
  media.ts, currency.ts, seo.ts, whatsapp.ts, ...
components/
  ui/                         # shadcn/ui primitives (Base UI)
  layout/ marketing/ vehicle/ forms/ admin/ shared/
prisma/
  schema.prisma, seed.ts, migrations/
tests/
  unit/                       # Vitest
  e2e/                        # Playwright
proxy.ts                      # Next 16's middleware.ts equivalent
```

---

## Environment variables

See [`.env.example`](.env.example) for the full annotated list.
