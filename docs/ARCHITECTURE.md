# Architecture Reference — Sure Filter US

> Deep reference for the system: project layout, data model, CMS sections, routes,
> API surface, AWS infrastructure, the popup-banner subsystem, and the MCP server.
> `CLAUDE.md` is the lean quick-reference; this file holds the detail it points to.
>
> Last updated: June 2026

---

## Project layout

```
surefilter-us/
├── surefilter-ui/              # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (site)/         # Public CMS pages
│   │   │   ├── admin/          # Admin panel
│   │   │   ├── api/            # API routes
│   │   │   ├── catalog/        # Product catalog
│   │   │   ├── products/       # Product pages
│   │   │   ├── newsroom/       # News & events
│   │   │   └── resources/      # Resources & documents
│   │   ├── components/
│   │   │   ├── admin/          # Admin components
│   │   │   ├── forms/          # DynamicForm, FormBuilder
│   │   │   ├── layout/         # Header, Footer
│   │   │   ├── sections/       # CMS sections (50+ components)
│   │   │   ├── seo/            # SEO component
│   │   │   └── ui/             # UI primitives (Button, Card, …)
│   │   ├── cms/                # CMS utilities and types
│   │   ├── lib/                # Utilities (prisma, revalidate, assets, auth, …)
│   │   ├── mcp/                # MCP server (tools, registry, scopes, audit)
│   │   └── generated/prisma/   # Generated Prisma client
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema
│   │   └── migrations/
│   └── prisma.config.ts        # Prisma 7 config (MUST be at project root!)
├── infra/envs/prod/            # OpenTofu (AWS) — ~18 .tf files
├── docker/                     # Docker Compose for local dev
├── scripts/                    # Helper scripts
└── docs/                       # Documentation
```

Key `lib/` files:

- `lib/prisma.ts` — Prisma client (+ build-time stub)
- `lib/revalidate.ts` — ISR + CloudFront cache invalidation
- `lib/assets.ts` — CDN URL helpers (`getAssetUrl()`)
- `lib/auth.ts` — NextAuth config
- `lib/analytics.ts` — GA4 event tracking helpers
- `lib/site-settings.ts` — settings + cache + helpers
- `lib/catalog-parser.ts` — catalog HTML parsing
- `lib/require-admin.ts` — `requireAdmin()` / `isUnauthorized()`
- `lib/rate-limiter.ts` — in-memory IP-based limiters
- `lib/url-validator.ts` — SSRF prevention
- `lib/sanitize.ts` — sanitize-html for `dangerouslySetInnerHTML`
- `lib/email.ts` / `lib/banner-email.ts` — SES v2 notifications

---

## Data model (Prisma)

### CMS
- `Page` — site pages (slug, title, sections)
- `Section` — page sections (type enum, data JSON)
- `PageSection` — page↔section link with position
- `SharedSection` — reusable sections
- `SiteSettings` — global settings (header, footer, analytics, SEO, redirects, default meta tags, logoUrl, formNotificationFromEmail, newsroomHeroColor, mcp Json)

### Product catalog
- `Product` — products (code, brand, filterType, manufacturerCatalogUrl)
- `Brand` — brands (Sure Filter, …)
- `ProductCategory` — categories (Heavy Duty, Automotive)
- `ProductFilterType` — filter types (Air, Oil, Fuel, Cabin)
- `SpecParameter` / `ProductSpecValue` — specifications
- `ProductMedia` / `MediaAsset` — images

### Content
- `NewsArticle` / `NewsCategory` — news and events
- `Resource` / `ResourceCategory` — resources (catalogs, documents). `ResourceCategory` self-references via `parentId` (max depth = 2 enforced in app layer) + `image` field for subcategory image cards
- `Form` / `FormSubmission` — universal forms

### Popup banners (marketing)
- `Banner` — popup banners (type LEAD_CAPTURE | CTA, layout, layoutConfig Json, targeting, triggers, dismiss strategy, schedule, denormalized counters)
- `BannerCampaign` — campaigns (group banners, aggregate stats, shared notifyEmail fallback)
- `BannerImpression` — every impression (full DB logging for analytics)
- `BannerClick` — every CTA click
- `BannerSubmission` — captured emails for LEAD_CAPTURE

### Admin / MCP
- `User` — admin users
- `AdminLog` — action log
- `ApiToken` — Personal Access Tokens (MCP) — sha-256 hash, scopes, expiry, soft revoke, daily quota
- `MCPIdempotency` — idempotency records (unique `(tokenId, key)`, TTL 24h)

Schema: `surefilter-ui/prisma/schema.prisma`

---

## CMS section types (`SectionType` enum)

**Hero:** `hero_full`, `hero_carousel`, `hero_compact`, `page_hero`, `page_hero_reverse`, `single_image_hero`, `search_hero`, `compact_search_hero`, `simple_search`, `color_hero` (compact hero with solid background color, configurable)

**Products:** `featured_products`, `featured_products_catalog`, `popular_filters`, `popular_filters_catalog`, `products`, `product_gallery`, `product_specs`

**Filters:** `filter_types_grid`, `filter_types_image_grid`, `related_filters`

**Content:** `about_with_stats`, `about_news`, `content_with_images`, `why_choose`, `quality_assurance`, `industries`, `industries_list`, `industry_showcase`, `our_company`, `manufacturing_facilities`, `stats_band`, `awards_carousel`, `awards_gallery`

**Contact:** `contact_hero`, `contact_options`, `contact_form`, `contact_form_info`

**Warranty:** `limited_warranty_details`, `magnusson_moss_act`, `warranty_contact`, …

**Utility:** `form_embed`, `sidebar_widget`, `listing_card_meta`

**Adding a new section type:** 1) enum in `schema.prisma` → 2) component in `components/sections/` → 3) form in `admin/pages/[slug]/sections/` → 4) wire up in `cms/section-renderer.tsx`.

---

## Routes

### Public
- `/` — home
- `/about-us`, `/contact-us`, `/warranty`
- `/heavy-duty`, `/heavy-duty/[type]`, `/automotive`
- `/industries`, `/industries/[slug]`
- `/catalog` — product catalog
- `/products/[code]` — product page (ISR 24h)
- `/newsroom`, `/newsroom/[slug]`
- `/resources` — drill-down entry: union of first level (subcategories where they exist + resources directly in flat categories)
- `/resources/[category]` — top-level category: children → subcategory grid, else flat resource list
- `/resources/[category]/[...path]` — catch-all resolver: `[subcategory]` → subcategory resources, `[slug]` → resource detail in flat category, `[subcategory]/[slug]` → resource detail in subcategory

### SEO / GEO (dynamic, from DB)
- `/robots.txt` — `src/app/robots.ts` (SiteSettings.seoRobotsBlock)
- `/sitemap.xml` — `src/app/sitemap.ts` (all pages, products, news, resources)
- `/llms.txt` — `src/app/llms.txt/route.ts` (llmstxt.org format)
- `/llms-full.txt` — extended with product/news detail

### Admin (`/admin/*`)
- `/admin/pages` — pages
- `/admin/products` (+ brands, categories, spec-parameters, product-filter-types)
- `/admin/news`, `/admin/resources`
- `/admin/forms` — form builder
- `/admin/banners` — popup banners (list/CRUD/duplicate/stats/submissions)
- `/admin/banner-campaigns`, `/admin/banner-submissions` (universal lead view + CSV export)
- `/admin/files` — S3 file manager
- `/admin/settings/site` — site settings (Header, Footer, Special Pages, Redirects, Security)
- `/admin/settings/tokens` (+`/new`, `/[id]`) — Personal Access Tokens (MCP)
- `/admin/settings/scopes` — Scopes reference (auto-generated from tool registry)
- `/admin/settings/usage` — MCP usage dashboard
- `/admin/settings/api` — MCP API server config + connection guide
- `/admin/users`, `/admin/logs`

> Top-nav is only **Files** + **Settings**. Tokens/Scopes/Usage/API moved under Settings → API & Access on 2026-05-18 (they historically lived at `/admin/access/*`, which no longer exists). Backend API endpoints stayed at `/api/admin/access/*`.

---

## API endpoints

### Public
- `GET /api/health`, `GET /api/warm-up` (localhost only — post-deploy ISR warm-up)
- `POST /api/forms/[slug]/submit`
- `GET /api/news`, `GET /api/resources`
- `GET /api/banners/active` (1-min server cache)
- `POST /api/banners/[id]/impression` (sendBeacon-friendly)
- `POST /api/banners/[id]/click`, `POST /api/banners/[id]/submit` (rate-limited)
- `GET /robots.txt`, `GET /sitemap.xml`, `GET /llms.txt`, `GET /llms-full.txt`

### Admin (`/api/admin/*`)
- CRUD for pages, sections, products, news, resources, forms
- Sections/pages: `invalidatePages()` clears ISR (`revalidatePath` layout) + CloudFront for affected pages only
- Site settings: full cache flush (ISR `revalidatePath('/', 'layout')` + CloudFront `/*`) — header/footer/meta affect every page
- `POST /api/admin/cache` — manual full flush (Clear Cache button)
- `/api/admin/file-manager/*` — S3
- `/api/admin/site-settings`
- `GET /api/admin/config/tinymce` — TinyMCE API key (runtime from SSM, admin-only)
- `/api/admin/banners` (+`[id]`, `[id]/duplicate`, `[id]/stats`)
- `/api/admin/banner-campaigns` (+`[id]`, `[id]/stats`)
- `/api/admin/banner-submissions` (+`[id]`, `export`, `[id]/retry-email`)
- `/api/admin/access/tokens` (+`[id]`, `[id]/regenerate`) — POST returns plaintext once, never stored again
- `/api/admin/access/settings` — GET/PUT global MCP settings (`SiteSettings.mcp` Json)
- `/api/admin/access/usage` — aggregates of AdminLog `action=MCP_TOOL_CALL` over 30 days

All admin routes use `requireAdmin()` + `isUnauthorized()`, Zod validation, and `logAdminAction()`.

---

## AWS infrastructure (OpenTofu)

> **Always** use `--profile surefilter-local` for AWS CLI; the Tofu provider uses the same profile.
> **Never** `tofu apply` without reviewing the plan — an auto-approve once destroyed EC2 with listmonk data.

### Domains and DNS
- **surefilter.us** — primary (Route53 → CloudFront → App Runner)
- **www.surefilter.us** — alias on the primary CloudFront, **301 → surefilter.us** (CF Function `set_x_forwarded_host`, edge redirect before cache)
- **new.surefilter.us** — legacy alias, **301 → surefilter.us** (CF Function)
- **assets.surefilter.us** — CDN for files (separate CloudFront → S3 `surefilter-files-prod`)
- **newsletters.surefilter.us** — EC2 server (Elastic IP)
- **news / mail.surefilter.us** — SES sending domains for newsletters (DKIM, custom MAIL FROM)
- **notify.surefilter.us** — SES sending domain for transactional emails (DKIM, custom MAIL FROM, suppression only)
- **link.{news,mail,notify}.surefilter.us** — SES tracking domains (HTTPS via CloudFront → awstrack.me)
- **link.surefilter.net** — Apollo.io tracking domain (CNAME → aploconnect.com)
- **surefilter.eu / .co / .net** (+www) — 301 redirect → surefilter.us (CloudFront Function, edge, path + query preserved)
- **mcp.surefilter.us** — separate CloudFront distribution → same App Runner origin (see MCP Phase 4 below)

### Key services
- **App Runner** `surefilter-prod` — 1 vCPU / 2 GB, port 3000, image from ECR. Image version in `infra/envs/prod/image-versions.tf` (`app_runner_image_version`)
- **EC2** `surefilter-prod` — t4g.medium (ARM64), Ubuntu 24.04 LTS, Elastic IP, `newsletters.surefilter.us`. Has `lifecycle { ignore_changes = [ami] }` — **do not recreate**; data lives on root volume
- **RDS** PostgreSQL 15 — `db.t4g.micro`, 20 GB, public access (temporary)
- **CloudFront** — 7 distributions: site, assets, redirect (eu/co/net + www + news/mail/notify), 3 SES tracking, mcp
- **S3** — `surefilter-static-prod`, `surefilter-files-prod`, `surefilter-db-backups-prod`
- **ECR** `surefilter`
- **SSM Parameter Store** — DATABASE_URL, NEXTAUTH_SECRET, ORIGIN_SECRET, TINYMCE_API_KEY, CLOUDFRONT_DISTRIBUTION_ID, …

### CloudFront cache key (critical)
- Cache policy **MUST** include `RSC` and `Next-Router-Prefetch` in the header whitelist — otherwise CloudFront mixes HTML and RSC flight payloads and users see raw JSON.
- Origin request policy forwards `RSC`, `Next-Router-State-Tree`, `Next-Router-Prefetch`, `Next-Url`, `Accept`, `Origin`, `Referer`.
- Site distribution ID: `E1TEXCEJ38G3RE`. Stored in SSM `/surefilter/CLOUDFRONT_DISTRIBUTION_ID` (App Runner reads via `runtime_environment_secrets`, breaking the App Runner ↔ CloudFront cycle).
- Manual invalidate: `aws --profile surefilter-local cloudfront create-invalidation --distribution-id E1TEXCEJ38G3RE --paths "/*"`

### Email (SES)
Three domain identities; all share Easy DKIM 2048-bit and inherit DMARC from `_dmarc.surefilter.us`.

- **news.surefilter.us** (newsletters / listmonk) — SPF via `bounce.news.surefilter.us`; config set `surefilter-newsletter`, dedicated IP pool `surefilter-newsletter` (managed), VDM, suppression (BOUNCE+COMPLAINT), Auto Validation (HIGH); tracking `link.news.surefilter.us`; bounce → SNS topic `surefilter-ses-notifications` → `https://newsletters.surefilter.us/webhooks/service/ses`. SMTP IAM user `surefilter-ses-smtp`, endpoint `email-smtp.us-east-1.amazonaws.com:587` (STARTTLS).
- **mail.surefilter.us** (newsletters / listmonk, second domain) — SPF via `bounce.mail.surefilter.us`; config set `surefilter-mail`, IP pool `surefilter-newsletter` (shared); tracking `link.mail.surefilter.us`; same SNS topic as news.
- **notify.surefilter.us** (transactional / App Runner via AWS SDK) — SPF via `bounce.notify.surefilter.us`; config set `surefilter-transactional`, dedicated IP pool `surefilter-transactional` (managed), VDM, suppression only (no SNS); tracking `link.notify.surefilter.us`; FROM `noreply@notify.surefilter.us` (default, configurable in SiteSettings); auth via App Runner IAM role (`ses:SendEmail`, `ses:SendRawEmail`).

### Newsletter server (listmonk)
- EC2 `newsletters.surefilter.us`; listmonk in Docker (`/opt/listmonk/`); Nginx reverse proxy HTTPS → `127.0.0.1:9000`; Let's Encrypt (certbot auto-renew).
- Setup: `scripts/setup-listmonk.sh`. Credentials in `/opt/listmonk/.env`.
- Backup: AWS Backup daily (7d) + weekly (30d), vault `surefilter-ec2-backup`.

---

## Popup banner system

Custom popup-banner system (instead of HelloBar/SaaS) for lead-gen and CTA campaigns.

**Types:** `LEAD_CAPTURE` (image + title + body + email input + submit) and `CTA` (image + title + body + URL button).

**Architecture:**
- Server cache: `src/lib/banners.ts` — `getActiveBanners()` with 1-min in-memory cache, `clearBannersCache()` on CRUD mutations (mirrors `getSiteSettings()`).
- Client fetch: `<BannerHost />` in root layout fetches `/api/banners/active` (not via layout ISR — 24h delay is wrong for banner pause). Mounts post-hydration.
- Modal: native `<dialog>` + `showModal()` (free focus trap, Escape, `::backdrop`). No Headless UI, no portal.

**Layout registry** (`src/components/banners/layouts/`):
- A layout is a React component registered in `index.ts`. Starters: `ClassicCentered`, `SideImage`, `MinimalText`, `ProductShowcase` (all support LEAD_CAPTURE + CTA).
- SVG previews in `public/images/banner-layouts/<id>.svg`.
- **Add a layout:** create component + `meta` export, register in `index.ts`, add SVG. Layout-specific config goes in `Banner.layoutConfig` (Json) with its own Zod schema. Zero DB migrations for base layouts. `banner.layout` is a string (not enum) for extensibility; unknown → `DEFAULT_LAYOUT_ID`.
- Public API may enrich `layoutConfig` (e.g. `product_showcase` pulls product code/imageUrl in one query).
- Images use `ManagedImage` with `fill` + `sizes`.

**Product Showcase layout** (B2B catalog promo): header strip (hero image + gradient overlay + split-color headline + subtitle), 2 product cards (SKU plate dominant, image, description, application/fits, cross-refs table, MOQ/CONT, price block, SPECIAL ribbon), footer (stock+brands text + CTA button OR email form). Config in `product-showcase-schema.ts`. Prices/special/fits are per-banner overrides (Product has no price field — deliberate; popups are short-lived). Admin "Products" tab in `BannerForm` shows only when `layout === 'product_showcase'`. Mobile polish (2026-05-18): compact bottom strip, `<dialog>` floats with side breathing room, scrollable inner with anchored close button, 16px email input to stop Safari focus-zoom.

**Targeting:** `targetAllPages: true` + `excludeSlugs`, or `targetAllPages: false` + `targetSlugs`. Slugs: `"/"` for home, `"newsroom"` without leading slash. Wildcard `products/*` via glob→regex in `matchesPath`. Admin pages hardcoded-bail in `BannerHost`.

**Triggers:** `delayMs` (default 5000); `utmRules` (AND); `refererRules` (OR). Client-side filter against `useSearchParams()` and `document.referrer`.

**Dismiss strategy:** `SESSION` (sessionStorage), `DAYS` (localStorage TTL = `dismissTtlDays`, default 30), `FOREVER` (localStorage no expiry). Cross-tab sync via `storage` event.

**Multi-banner resolution:** sort `priority DESC, publishedAt DESC`, render first. One popup at a time.

**Tracking:** full DB logging (`BannerImpression`/`BannerClick` with pageUrl, slug, utm, referer, sessionId, ip, ua) + denormalized counters on `Banner` (atomic increment) + GA4 events (`banner_impression`/`banner_click`/`banner_lead_submit`). `sendBeacon` for impression/click. Limiters: `bannerImpressionLimiter` (200/min per IP+banner), `bannerSubmitLimiter` (5/hr per IP).

**Lead capture:** `POST /api/banners/[id]/submit` — Zod email validation, rate-limit, honeypot `website` field, atomic transaction, fire-and-forget email via `src/lib/banner-email.ts`. NotifyEmail fallback: `banner.notifyEmail` → `campaign.notifyEmail` → skip. Retry: `POST /api/admin/banner-submissions/[id]/retry-email`.

**Campaigns:** `BannerCampaign` groups banners (`Banner.campaignId`); campaign `notifyEmail` is the fallback. Aggregate stats via raw SQL `DATE_TRUNC`. On delete, banners survive (`onDelete: SetNull`).

**Schedule:** eligible when `publishedAt <= now AND (expiresAt > now OR null)`, filtered in `getActiveBanners()`.

**Animations:** View Transitions API cross-fade (`view-transition-name: sf-banner-modal`), skipped under `prefers-reduced-motion`.

**Cache invalidation on CRUD:** `clearBannersCache()` + `invalidatePages(['/'])`.

---

## MCP server

Model Context Protocol server giving AI agents admin operations + public read-only catalog/content access. PAT auth + scopes. All phases (0–5) complete. Plan: `/Users/spodarets/.claude/plans/dazzling-whistling-walrus.md`.

**Admin UI:** Settings → API & Access (`SettingsShell.tsx`). Sidebar grouped: **General** (Site Settings / Users / Activity Logs) and **API & Access** (Tokens / Scopes Reference / Usage / API Server). URLs `/admin/settings/{tokens,scopes,usage,api}`. Backend endpoints stayed at `/api/admin/access/*`.

**Runtime:** `/api/mcp/[transport]` over `mcp-handler@1.1` + `@modelcontextprotocol/sdk@1.29`, Streamable HTTP transport. Endpoint `POST host/api/mcp/mcp` with `Authorization: Bearer sfpat_…`. Auth wrapper `withMcpAuth` in `src/mcp/server.ts`: valid bearer → AuthInfo with scopes; no bearer + `publicScopesEnabled` → anonymous public scopes; otherwise 401 + `WWW-Authenticate`. `checkServerAvailability()` → 503 on `enabled=false`/`maintenanceMode`.

**Auth foundation (Phase 0):** `ApiToken` model (sha-256 hash, `scopes String[]`, expiry, soft revoke, daily quota, `tokenPrefix`). Global MCP settings in `SiteSettings.mcp` Json. Token helpers `src/lib/api-token.ts` (`generateToken()` → `sfpat_<24chars>`, `verifyToken()`, `hasScope()` with `<domain>:*` and `admin:*` wildcards). Scope vocabulary in `src/mcp/scopes.ts` (14 scopes, 5 presets). Tool registry `src/mcp/tools-registry.ts`. Plaintext-once UX: token shown once on create/regenerate; DB stores only the hash.

**Tools (81 total):**
- Public read (Phase 1, 11): `catalog-*` (6), `content-*` (5).
- Admin read (Phase 2, +18): CMS, forms, banners, media, users, admin (settings/logs).
- Content + catalog writes (Phase 3a, +21): news/resource/brand/product CRUD, `cache-purge`.
- Banners + CMS + forms + media + users + settings writes (Phase 3b, +30).
- Common write helpers `src/mcp/tools/_write-helpers.ts`: `mutationCommonFields` (`confirm?`, `idempotencyKey?`), `requireWriteScope` (no public fallback), `requireConfirm`, `auditMutation` (dual entry: entity CRUD + MCP_TOOL_CALL), `safeInvalidate`.

**Scope guard:** `effectiveMode(scopes, domain)` → `'admin' | 'public' | null`. Public mode filters `status=PUBLISHED, publishedAt ≤ now` and hides sensitive fields; admin mode sees drafts.

**Security pack (2026-05-17):**
- PII redaction in `_helpers.ts` — submissions tools mask email/IP/userAgent and walk submission `data` JSON (`sanitizeSubmissionData`). `admin:*` callers see raw.
- `tools/list` scope filter in `server.ts` — anonymous callers see only public-reachable tools (14), readers see their subset, `admin:*` sees all. Reuses SDK-internal `normalizeObjectSchema` + `toJsonSchemaCompat` so emitted `inputSchema` matches the SDK byte-for-byte.
- Race-safe idempotency `lib/idempotency.ts` — `claimIdempotency()` creates a PENDING sentinel; on P2002 re-reads and returns `'cached' | 'in-progress' | 'claimed'`. `withIdempotency` wrapper does claim → run → finalize/release.
- Legacy auth refactor — 9 admin routes + `/api/admin/cache` (had a hidden P0: checked session existence, not ADMIN role) converted to `requireAdmin()`.
- Folder ops (`/api/admin/folders/{create,delete,rename}`) write AdminLog entries.
- Audit secret-key sanitizer (`mcp/audit.ts`) uses substring match (catches `apiKey`, `webhook_password`, `accessToken`, …).

**Hardening (Phase 5):** idempotency (`MCPIdempotency` model, TTL 24h, cron purge); per-token rate limit (`getMcpAuthedLimiter`, live from `mcpSettings.rateLimitPerMinute`); SES email alerts (`lib/mcp-alerts.ts` — notify admins on `admin:*` token issue, notify owner on third-party revoke); cron `/api/cron/mcp-cleanup` (auth via `CRON_SECRET` or localhost — soft-revoke expired tokens, flag inactive >90d, purge idempotency); real usage dashboard (SVG sparkline, status chips, top tokens via JOIN).

**Infra (Phase 4) — `mcp.surefilter.us`:** separate CloudFront → same App Runner origin (shared `X-Origin-Secret`); single Next.js process serves both, path-rewrite on edge. CloudFront Function `surefilter-mcp-path-rewrite` (viewer-request) maps `/mcp[/*]` → `/api/mcp/mcp[/*]`, passes through `/.well-known/oauth-protected-resource`, sets `x-forwarded-host`. Cache policies `mcp_no_cache` (TTL 0) + `mcp_metadata_cache` (1h); origin-request `mcp_origin`; origin timeouts 60s for SSE. Optional WAF via `var.enable_mcp_waf` (default false). ACM cert + Route53 A/AAAA in dedicated `.tf` files.

**Follow-up:** wide `withIdempotency` rollout across remaining write tools (2 reference impls today). Tracked in TODO.md.

---

## Known specifics / gotchas

See `CLAUDE.md` → "Gotchas" for the short list. Fuller notes:

- **Resources drill-down** uses a single `ResourcesShell` (`src/components/resources/ResourcesShell.tsx`) — top pills (top-level categories) + optional subcategory chips + view toggle (gallery/list) + mixed `Tile[]` (discriminated union `subcategory | resource`). Subcategory and resource cards share the same structure (image + body, `aspect-[826/1168]` for A4 PDF covers); subcategory has a corner folder icon + "X catalogs" + "Browse →", resource has "PDF • size" + Preview/Download. Breadcrumbs are not used on listing pages (pills/chips show the path) but remain on resource detail. Max depth 2. Images fall back to icons (FolderIcon / DocumentTextIcon) on a gray gradient — no placeholder photos.
- **Search disabled** — temporarily commented out (5 components with TODO markers: Header, HeroCms, SearchHero, CompactSearchHero, QuickSearchCms, SimpleSearch).
- **Redirect domains** surefilter.eu/.co/.net (+www) → 301 → surefilter.us via CloudFront Function (`cloudfront-redirect.tf`), one ACM cert (`acm-redirects.tf`), DNS in `route53-redirects.tf`. `new`/`www` → 301 via CF Function `set_x_forwarded_host` on the primary distribution (not middleware — CF sends to origin with the App Runner host).
- **Custom error pages:** `not-found.tsx` (404 with Header/Footer, `robots: { index:false, follow:true }`), `error.tsx` (client component, no async server Header/Footer), `global-error.tsx` (own `<html>`/`<body>`, inline styles).
- **Google Workspace:** MX + SPF for .eu/.co/.net; DMARC + DKIM for .net; site verification for .co and .net.
- **Local migration drift:** when hand-editing historical migrations, `prisma migrate dev` refuses to run locally due to checksum drift. Fix: update `_prisma_migrations.checksum` to the current `shasum -a 256` of the file. Production is unaffected — `migrate deploy` doesn't verify hashes.
