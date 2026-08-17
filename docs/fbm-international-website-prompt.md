# Website Generation Prompt — FBM International (Soueast South Sudan)

---

## 1. Role and objective

You are a senior full-stack engineer and product designer. Build a **production-ready, modern car dealership website with a separate admin dashboard (CMS)** for **FBM International**, the **sole authorized partner of Soueast Motor in South Sudan**.

Deliver a complete, runnable monorepo-free Next.js application — not a mockup, not pseudocode. Every page, route, API handler, database model, and seed script must exist and work end to end.

---

## 2. Business context

| Field            | Value                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Company          | FBM International                                                                                              |
| Business         | Authorized new-vehicle dealership, sales, service, genuine parts                                               |
| Brand            | Soueast Motor (Chinese OEM, part of the Chery group)                                                           |
| Status           | **Sole / exclusive partner of Soueast Cars in South Sudan** — make this prominent, it is the core trust signal |
| Showroom         | Juba Town, near Muduria Roundabout, Juba, Central Equatoria, South Sudan                                       |
| Phone / WhatsApp | `[[+211 ...]]`                                                                                                 |
| Email            | `[[info@fbminternational.com]]`                                                                                |
| Hours            | `[[Mon–Sat 8:00–18:00, Sun closed]]`                                                                           |
| Socials          | `[[Facebook, Instagram, TikTok, X]]`                                                                           |

### Product lineup to seed (confirm final local availability with client)

- **Soueast S05** — compact urban SUV
- **Soueast S06** — C-segment urban crossover SUV (1.6T petrol)
- **Soueast S06 DM** — plug-in hybrid variant of the S06
- **Soueast S07** — C-segment family SUV, 12.3" connected screens, ADAS
- **Soueast S09** — flagship D-segment 7-seat SUV, 2.0T

Model data must be **CMS-driven**, never hardcoded in components. The client adds/edits/removes models without a developer.

---

## 3. Market realities that must shape the build

This is South Sudan. Design for it explicitly, do not build a Dubai dealership site and rename it.

1. **Mobile-first, low bandwidth.** Most traffic is Android on 3G/4G. Target < 200 KB initial JS, LCP < 2.5s on Slow 4G. Aggressive image optimization (AVIF/WebP, responsive `sizes`, blur placeholders, lazy loading below the fold).
2. **WhatsApp is the primary sales channel.** A persistent floating WhatsApp button on every page, plus per-model "Enquire on WhatsApp" deep links with a prefilled message (e.g. `https://wa.me/[[number]]?text=Hello%20FBM%2C%20I'm%20interested%20in%20the%20Soueast%20S07`).
3. **No online checkout.** Card penetration is low and vehicles are high-value. The conversion goal is a **lead**: test drive booking, quote request, callback, or WhatsApp chat. Do not build a cart or payment gateway.
4. **Single currency.** Display prices in **USD**. Store `priceUsd` and an admin-editable `usdToSspRate` in site settings; never hardcode a rate. Support "Price on request" when a model has no public price.
5. **Language.** English is the official language; **Juba Arabic** is widely spoken. Build i18n-ready from day one (`en` default, `ar` scaffolded with RTL support), even if `ar` copy ships later.
6. **Offline / flaky networks.** Graceful loading and error states, retry on failed form submits, no hard dependency on third-party scripts for core content to render.
7. **Trust signals matter.** Exclusive-partner status, physical showroom address with map, warranty terms, genuine-parts guarantee, after-sales service capability. Buyers here are cautious about Chinese-brand parts availability — answer that objection directly on the site.

---

## 4. Technical stack (mandatory)

- **Framework:** Next.js 15+, **App Router**, React Server Components, TypeScript strict mode
- **Styling:** Tailwind CSS + **shadcn/ui** components, `lucide-react` icons
- **Database:** **PostgreSQL hosted on Supabase**
- **ORM:** **Prisma** — connect via Supabase **connection pooler** (`DATABASE_URL`, port 6543, `pgbouncer=true`) and **direct connection** for migrations (`DIRECT_URL`, port 5432)
- **Auth:** Supabase Auth (email + password, magic link optional) for admin/staff **only**. Public site requires no login. Map `auth.users.id` → a Prisma `User` row for roles and profile.
- **Media:** Supabase Storage buckets — `vehicles`, `inventory`, `news`, `brand`, `documents`. Public read, authenticated write. Server-side signed upload URLs from the admin.
- **Forms & validation:** React Hook Form + **Zod**, with the same Zod schemas reused server-side. Never trust the client.
- **Email:** Resend (or Nodemailer/SMTP) for lead notifications to sales, plus autoresponder to the customer
- **Rich text:** Tiptap editor in the admin, stored as sanitized HTML or JSON
- **Analytics:** Vercel Analytics + optional GA4, plus Meta Pixel slot (Facebook drives traffic in this market)
- **Deployment:** Vercel (frontend) + Supabase (DB, auth, storage). Include `vercel.json` if needed.
- **Testing:** Vitest for unit/schema tests, Playwright for two critical E2E flows (submit a test-drive lead; admin creates and publishes a vehicle)

---

## 5. Design direction

Modern, confident, premium-but-accessible automotive. Think manufacturer-grade, not template.

- **Layout:** Full-bleed hero imagery, generous whitespace, wide max-width container (1280–1440px), 8pt spacing scale.
- **Palette:** Deep near-black `#0B0D0F` and graphite as the base; crisp white surfaces; one saturated accent for CTAs — **use the client's actual brand colors if provided**, otherwise a deep automotive red/burgundy. High contrast, WCAG AA minimum.
- **Typography:** A geometric or neo-grotesque sans for headings with tight tracking (e.g. Inter Tight, Sora, or Geist) and a highly legible body face. Large, editorial headline sizes on desktop; never below 16px body on mobile.
- **Motion:** Restrained. Fade/slide reveals on scroll, subtle hover lifts on cards, smooth image zoom on vehicle cards. Respect `prefers-reduced-motion`. No parallax-heavy hero that stutters on cheap Androids.
- **Dark/light:** Ship a dark-first public site with a light admin dashboard, or a coherent theme toggle — pick one and be consistent.
- **Imagery:** Cars must be the hero. Enforce a consistent aspect ratio (16:9 exterior, 4:3 interior) and never distort uploads.

---

## 6. Public site — sitemap and page requirements

### `/` Home

- Full-viewport hero: rotating featured models, headline, dual CTA ("Book a Test Drive" / "Explore the Range")
- **"Sole authorized Soueast partner in South Sudan"** trust bar directly under the hero
- Model range grid (cards: image, name, body type, starting price, key specs, "View details")
- Featured / arriving-soon inventory strip
- Why FBM: genuine parts, factory-backed warranty, trained technicians, Juba service center
- Services overview (Sales, Service, Parts, Fleet/Corporate)
- Testimonials + client logos (NGOs, government, corporates are the key fleet buyers here)
- Latest news/offers (3 cards)
- Location block: map embed, address, hours, directions to Muduria Roundabout
- Lead capture band + footer

### `/models` Model range

- Grid of all published models, filterable by body type, fuel type (petrol / hybrid / PHEV), price band, seating capacity, transmission; sortable by price and newest

### `/models/[slug]` Model detail — the most important page

- Hero gallery with lightbox, exterior/interior tabs
- Color/trim switcher that swaps the hero image
- Price block (USD with SSP toggle) or "Price on request"
- Full spec table grouped into sections: Engine & Performance, Dimensions, Safety, Comfort & Technology, Warranty
- Feature highlight sections with imagery
- Downloadable brochure (PDF from Supabase Storage)
- Sticky CTA bar on mobile: **Book Test Drive | Request Quote | WhatsApp**
- Related/compare models
- Structured data: `Product` + `Vehicle` JSON-LD

### `/compare`

- Side-by-side comparison of up to 3 models, spec rows aligned, difference highlighting

### `/inventory`

- Units physically in stock or in transit: model, trim, year, color, VIN (masked publicly), mileage (0 for new), status (`AVAILABLE`, `RESERVED`, `SOLD`, `IN_TRANSIT`), price, photo set
- Filters + `/inventory/[stockNumber]` detail page with reserve/enquire CTA
- Support a `Certified Pre-Owned` flag for trade-ins

### `/test-drive`

- Booking form: name, phone (with `+211` country handling), email, preferred model, preferred date + time slot, location (showroom / office visit), notes, consent checkbox
- Prevent double-booking a slot; confirmation screen + email/WhatsApp handoff

### `/services`

- Service booking form (vehicle model, VIN/plate, mileage, service type, preferred date, description of issue)
- Service menu and what's covered; scheduled maintenance intervals

### `/parts`

- Genuine Soueast parts, accessories catalog, parts enquiry form (part name/number, VIN, quantity)

### `/finance`

- Financing and leasing partner info, corporate/fleet purchase pathway, required documents, finance enquiry form
- Only include if the client confirms partners; otherwise render a "coming soon" enquiry variant

### `/about`

- Company story, the Soueast partnership, leadership, facilities, CSR

### `/news` and `/news/[slug]`

- News, promotions, launch events. Full CMS-managed article with cover image, rich body, tags, author, publish date

### `/contact`

- Full contact details, embedded map centered on Juba Town / Muduria Roundabout, department-specific contacts (Sales / Service / Parts / Fleet), general enquiry form

### Utility pages

`/privacy`, `/terms`, `/sitemap.xml`, `/robots.txt`, `404`, `500`

---

## 7. Admin dashboard (CMS) — `/admin`

A **completely separate authenticated area** with its own layout, sidebar navigation, and no public-site chrome. Middleware-protected; unauthenticated users hitting `/admin/*` redirect to `/admin/login`.

### Roles

| Role          | Permissions                                                       |
| ------------- | ----------------------------------------------------------------- |
| `SUPER_ADMIN` | Everything, including user management and site settings           |
| `ADMIN`       | All content, inventory, and leads; no user management             |
| `SALES`       | Leads, test drives, inventory status updates; read-only on models |
| `SERVICE`     | Service bookings only                                             |
| `EDITOR`      | News, pages, media only                                           |

Enforce roles **server-side** on every mutation, not just by hiding UI.

### Modules

1. **Dashboard home** — KPI cards (new leads today/week, test drives pending, vehicles in stock, units sold this month, top-viewed model), leads-over-time chart, recent activity feed
2. **Models** — full CRUD; variants/trims, colors (name + hex + image), spec groups and spec rows, feature blocks, gallery ordering via drag-and-drop, brochure upload, publish/draft toggle, SEO fields, slug auto-generation with uniqueness check
3. **Inventory** — CRUD stock units linked to a model variant; stock number, VIN, year, color, status, cost/list price, arrival date, photos; bulk CSV import; status change history
4. **Leads** — unified inbox for all form submissions (general, quote, finance, parts, callback). Filters by type/status/assignee/date. Kanban or table with `NEW → CONTACTED → QUALIFIED → NEGOTIATION → WON → LOST`. Assign to a sales user, add internal notes, log activity, export CSV, click-to-WhatsApp/call
5. **Test drives** — calendar + list view, approve/reschedule/cancel, assign vehicle and salesperson, mark completed/no-show
6. **Service bookings** — same pattern, with service type and workshop assignment
7. **News & offers** — Tiptap rich text, cover image, tags, scheduled publishing, preview
8. **Testimonials** — CRUD with approve/reject moderation
9. **Media library** — browse Supabase Storage, upload with drag-and-drop, alt text, delete with in-use protection
10. **Site settings** — contact details, WhatsApp number, address, map coordinates, opening hours, socials, **USD→SSP rate**, homepage hero slides, featured models, global SEO defaults, maintenance-mode switch
11. **Users** — invite staff, assign roles, deactivate (`SUPER_ADMIN` only)
12. **Audit log** — who changed what and when, for every create/update/delete

### Admin UX requirements

- Data tables with server-side pagination, search, sorting, and column filters (TanStack Table)
- Optimistic UI with toast feedback and proper error surfacing
- Unsaved-changes guard on forms
- Image upload with client-side compression before hitting Storage
- Fully responsive — the sales team will use this on phones
- Global command palette (⌘K) for quick navigation

---

## 8. Prisma schema (starting point — extend as needed)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Supabase pooler, pgbouncer=true
  directUrl = env("DIRECT_URL")        // Supabase direct, for migrations
}

enum Role { SUPER_ADMIN ADMIN SALES SERVICE EDITOR }
enum BodyType { SUV CROSSOVER SEDAN HATCHBACK PICKUP MPV VAN }
enum FuelType { PETROL DIESEL HYBRID PLUGIN_HYBRID ELECTRIC }
enum Transmission { MANUAL AUTOMATIC DCT CVT }
enum Drivetrain { FWD RWD AWD FOUR_WD }
enum PublishStatus { DRAFT PUBLISHED ARCHIVED }
enum StockStatus { IN_TRANSIT AVAILABLE RESERVED SOLD }
enum Condition { NEW CERTIFIED_PRE_OWNED USED }
enum LeadType { GENERAL QUOTE TEST_DRIVE SERVICE PARTS FINANCE FLEET CALLBACK }
enum LeadStatus { NEW CONTACTED QUALIFIED NEGOTIATION WON LOST }
enum BookingStatus { PENDING CONFIRMED RESCHEDULED COMPLETED CANCELLED NO_SHOW }
enum Currency { USD SSP }

model User {
  id           String   @id @db.Uuid            // mirrors Supabase auth.users.id
  email        String   @unique
  fullName     String
  phone        String?
  role         Role     @default(SALES)
  avatarUrl    String?
  isActive     Boolean  @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  assignedLeads    Lead[]           @relation("LeadAssignee")
  leadNotes        LeadNote[]
  testDrives       TestDriveBooking[]
  serviceBookings  ServiceBooking[]
  articles         Article[]
  auditLogs        AuditLog[]
}

model Model {
  id             String        @id @default(cuid())
  slug           String        @unique
  name           String                          // "S07"
  displayName    String                          // "Soueast S07"
  tagline        String?
  description    String        @db.Text
  bodyType       BodyType
  seats          Int
  startingPriceUsd Decimal?    @db.Decimal(12, 2)
  priceOnRequest Boolean       @default(false)
  year           Int
  heroImageUrl   String?
  thumbnailUrl   String?
  brochureUrl    String?
  status         PublishStatus @default(DRAFT)
  isFeatured     Boolean       @default(false)
  sortOrder      Int           @default(0)
  viewCount      Int           @default(0)
  metaTitle      String?
  metaDescription String?
  ogImageUrl     String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  variants     Variant[]
  colors       ModelColor[]
  images       ModelImage[]
  specGroups   SpecGroup[]
  features     FeatureBlock[]
  inventory    InventoryUnit[]
  leads        Lead[]
  testDrives   TestDriveBooking[]

  @@index([status, isFeatured])
  @@index([bodyType])
}

model Variant {
  id            String       @id @default(cuid())
  modelId       String
  model         Model        @relation(fields: [modelId], references: [id], onDelete: Cascade)
  name          String                            // "Comfort 1.5T 2WD"
  priceUsd      Decimal?     @db.Decimal(12, 2)
  engine        String?                           // "1.5L Turbo GDI"
  powerHp       Int?
  torqueNm      Int?
  fuelType      FuelType
  transmission  Transmission
  drivetrain    Drivetrain
  sortOrder     Int          @default(0)

  inventory     InventoryUnit[]
  @@unique([modelId, name])
}

model ModelColor {
  id        String  @id @default(cuid())
  modelId   String
  model     Model   @relation(fields: [modelId], references: [id], onDelete: Cascade)
  name      String
  hexCode   String
  imageUrl  String?
  sortOrder Int     @default(0)
}

model ModelImage {
  id        String  @id @default(cuid())
  modelId   String
  model     Model   @relation(fields: [modelId], references: [id], onDelete: Cascade)
  url       String
  alt       String
  category  String  @default("exterior")   // exterior | interior | detail
  sortOrder Int     @default(0)
}

model SpecGroup {
  id        String     @id @default(cuid())
  modelId   String
  model     Model      @relation(fields: [modelId], references: [id], onDelete: Cascade)
  title     String                              // "Engine & Performance"
  sortOrder Int        @default(0)
  specs     SpecItem[]
}

model SpecItem {
  id        String    @id @default(cuid())
  groupId   String
  group     SpecGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  label     String
  value     String
  unit      String?
  sortOrder Int       @default(0)
}

model FeatureBlock {
  id          String  @id @default(cuid())
  modelId     String
  model       Model   @relation(fields: [modelId], references: [id], onDelete: Cascade)
  title       String
  description String  @db.Text
  imageUrl    String?
  layout      String  @default("image-right")
  sortOrder   Int     @default(0)
}

model InventoryUnit {
  id           String      @id @default(cuid())
  stockNumber  String      @unique
  vin          String?     @unique
  modelId      String
  model        Model       @relation(fields: [modelId], references: [id])
  variantId    String?
  variant      Variant?    @relation(fields: [variantId], references: [id])
  year         Int
  colorName    String
  mileageKm    Int         @default(0)
  condition    Condition   @default(NEW)
  status       StockStatus @default(IN_TRANSIT)
  priceUsd     Decimal?    @db.Decimal(12, 2)
  arrivalDate  DateTime?
  soldAt       DateTime?
  notes        String?     @db.Text
  images       InventoryImage[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([status])
  @@index([modelId])
}

model InventoryImage {
  id        String        @id @default(cuid())
  unitId    String
  unit      InventoryUnit @relation(fields: [unitId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int           @default(0)
}

model Lead {
  id          String     @id @default(cuid())
  type        LeadType   @default(GENERAL)
  status      LeadStatus @default(NEW)
  fullName    String
  phone       String
  email       String?
  message     String?    @db.Text
  modelId     String?
  model       Model?     @relation(fields: [modelId], references: [id])
  source      String?                       // organic | facebook | whatsapp | referral
  pageUrl     String?
  assigneeId  String?    @db.Uuid
  assignee    User?      @relation("LeadAssignee", fields: [assigneeId], references: [id])
  notes       LeadNote[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([status, createdAt])
  @@index([type])
}

model LeadNote {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  authorId  String   @db.Uuid
  author    User     @relation(fields: [authorId], references: [id])
  body      String   @db.Text
  createdAt DateTime @default(now())
}

model TestDriveBooking {
  id            String        @id @default(cuid())
  reference     String        @unique          // "TD-2026-0143"
  fullName      String
  phone         String
  email         String?
  modelId       String?
  model         Model?        @relation(fields: [modelId], references: [id])
  preferredDate DateTime
  timeSlot      String                         // "10:00-11:00"
  location      String        @default("Showroom - Juba Town")
  notes         String?       @db.Text
  status        BookingStatus @default(PENDING)
  assigneeId    String?       @db.Uuid
  assignee      User?         @relation(fields: [assigneeId], references: [id])
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([preferredDate, timeSlot])
  @@index([status, preferredDate])
}

model ServiceBooking {
  id            String        @id @default(cuid())
  reference     String        @unique          // "SV-2026-0087"
  fullName      String
  phone         String
  email         String?
  vehicleModel  String
  plateNumber   String?
  vin           String?
  mileageKm     Int?
  serviceType   String
  preferredDate DateTime
  description   String?       @db.Text
  status        BookingStatus @default(PENDING)
  assigneeId    String?       @db.Uuid
  assignee      User?         @relation(fields: [assigneeId], references: [id])
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Article {
  id             String        @id @default(cuid())
  slug           String        @unique
  title          String
  excerpt        String?       @db.Text
  body           String        @db.Text
  coverImageUrl  String?
  tags           String[]
  status         PublishStatus @default(DRAFT)
  publishedAt    DateTime?
  authorId       String        @db.Uuid
  author         User          @relation(fields: [authorId], references: [id])
  metaTitle      String?
  metaDescription String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([status, publishedAt])
}

model Testimonial {
  id          String  @id @default(cuid())
  authorName  String
  authorTitle String?
  company     String?
  quote       String  @db.Text
  avatarUrl   String?
  rating      Int     @default(5)
  isApproved  Boolean @default(false)
  sortOrder   Int     @default(0)
  createdAt   DateTime @default(now())
}

model SiteSetting {
  id        String   @id @default("singleton")
  data      Json                                  // contact, hours, socials, hero slides, SEO defaults
  usdToSsp  Decimal  @db.Decimal(12, 4)
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?  @db.Uuid
  actor      User?    @relation(fields: [actorId], references: [id])
  action     String                                // CREATE | UPDATE | DELETE | LOGIN
  entity     String                                // "Model", "Lead"
  entityId   String?
  changes    Json?
  ipAddress  String?
  createdAt  DateTime @default(now())

  @@index([entity, createdAt])
}
```

---

## 9. API and data layer

- Use **Server Components** for reads and **Server Actions** for mutations wherever possible; add REST route handlers under `/api/*` only where an external client needs them (e.g. `/api/leads` for a webhook or future mobile app).
- Every mutation: authenticate → authorize by role → validate with Zod → execute in a Prisma transaction where multi-table → write `AuditLog` → `revalidatePath`/`revalidateTag`.
- Public form endpoints must be **rate-limited** (IP + phone based) and protected with a honeypot field plus Cloudflare Turnstile or hCaptcha.
- Use `Decimal` for all money, never `Float`. Format currency at the presentation layer only.
- Prisma singleton pattern to avoid connection exhaustion in dev.
- Include `prisma/seed.ts` seeding: one `SUPER_ADMIN`, site settings with a sensible USD→SSP rate, the five Soueast models with variants, colors, spec groups and realistic specs, 6–10 inventory units, 3 news articles, 4 testimonials.

---

## 10. Security requirements

- Middleware guards all `/admin/*` routes; server-side session check in the admin layout as well (defense in depth)
- Enable **Row Level Security** on Supabase tables; the app connects with the service role only from server code. **Never expose the service role key to the client.**
- Sanitize all rich-text HTML before render (DOMPurify / `rehype-sanitize`)
- Strict security headers: CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`
- Validate and restrict file uploads by MIME type and size (max 5 MB per image), strip EXIF
- Mask VINs on public pages (show last 6 characters only)
- Personal data: consent checkbox on every form, privacy policy link, and an admin-side delete-lead capability

---

## 11. SEO, accessibility, performance

- Per-page `generateMetadata`, canonical URLs, Open Graph and Twitter cards
- JSON-LD: `AutoDealer` (with `geo`, `address`, `openingHours`) on the homepage, `Product`/`Vehicle` on model pages, `BreadcrumbList` sitewide, `NewsArticle` on posts
- Dynamic `sitemap.xml` generated from published models, inventory, and articles
- Target keywords: "Soueast South Sudan", "cars for sale in Juba", "car dealership Juba", "Soueast S07 South Sudan", "new cars South Sudan"
- Google Business Profile pointer in the footer; embedded map centered on Muduria Roundabout, Juba Town
- WCAG 2.1 AA: keyboard navigable, visible focus rings, semantic landmarks, alt text on every image (enforced as required in the CMS), 4.5:1 contrast
- Lighthouse targets: Performance ≥ 90 mobile, Accessibility ≥ 95, SEO ≥ 95

---

## 12. Environment variables

```env
DATABASE_URL=                      # Supabase pooler (port 6543, ?pgbouncer=true&connection_limit=1)
DIRECT_URL=                        # Supabase direct (port 5432) for migrations
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # server only
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=
LEAD_NOTIFICATION_EMAIL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_GA_ID=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

---

## 13. Deliverables

1. Complete Next.js app with the folder structure laid out and every route implemented
2. `prisma/schema.prisma` + initial migration + `seed.ts`
3. Reusable component library (`VehicleCard`, `SpecTable`, `Gallery`, `LeadForm`, `PriceDisplay`, `WhatsAppButton`, `AdminDataTable`, `ImageUploader`, etc.)
4. Admin dashboard with all modules from §7
5. `README.md`: local setup, Supabase project creation, storage bucket + policy setup, migration and seed commands, deployment steps, and how to create the first super admin
6. `.env.example`
7. Playwright tests for the two critical flows

## 14. Acceptance criteria

- [ ] A visitor can browse all models, filter them, open a detail page, and submit a test-drive booking that appears in the admin within seconds
- [ ] An admin can log in, create a new model with variants, colors, images, and specs, publish it, and see it live on the public site without a redeploy
- [ ] A sales user can view leads, assign one to themselves, add a note, and move it to `WON`
- [ ] A sales user **cannot** access user management or delete models (verified server-side, not just hidden)
- [ ] Prices toggle correctly between USD and SSP using the admin-set rate
- [ ] The site is fully usable on a 360px-wide Android screen on a throttled Slow 4G connection
- [ ] All forms fail gracefully with clear inline errors and never lose user input on error
- [ ] Lighthouse mobile Performance ≥ 90

## 15. Phase 2 (build the schema so these fit later, do not implement now)

Trade-in valuation tool, finance calculator with local bank rates, customer portal for service history, live chat, Arabic localization rollout, SMS notifications via a local gateway, fleet/corporate quotation module, parts e-commerce.

---

## 16. Build instructions

Work in this order and confirm each stage before moving on:

1. Project scaffold, Tailwind + shadcn/ui, design tokens, base layout
2. Prisma schema, Supabase connection, migration, seed
3. Auth, middleware, role guards, admin shell
4. Admin CRUD: Models → Inventory → News → Settings
5. Public site: Home → Models → Model detail → Inventory
6. Forms, lead pipeline, email notifications, WhatsApp integration
7. SEO, structured data, performance pass, accessibility audit
8. Tests, README, deployment

Ask clarifying questions **only** where a missing detail would block correctness (exact phone number, brand colors, confirmed model availability). Otherwise choose sensible defaults and note them in the README.
