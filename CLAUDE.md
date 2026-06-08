# CLAUDE.md

Quick reference for AI assistants working on **Sure Filter US** — a corporate site for an
automotive-filter manufacturer with a full CMS, product catalog, popup-banner system, and MCP server.

> This file is loaded into context every session — keep it short. Detailed reference lives in
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md); how-to guides in [docs/GUIDES.md](docs/GUIDES.md).

## Stack

Next.js 15.5 (App Router, RSC) · React 19 · Tailwind 4.1 · PostgreSQL + Prisma 7 (pg adapter) ·
NextAuth (credentials) · AWS S3 + CloudFront · App Runner + EC2 · Amazon SES · GA4/GTM · Termly CMP.
App lives in `surefilter-ui/`; infra (OpenTofu) in `infra/envs/prod/`.

## Commands

```bash
cd surefilter-ui
npm run dev                       # Turbopack dev server
npm run build && npm start        # Production
npx prisma generate               # Regenerate client
npx prisma migrate dev --name x   # New migration
npx prisma studio                 # DB GUI
npm run seed:content[:force]      # Seed CMS content (force overwrites)
```

Local admin (`http://localhost:3000/admin`): `admin@spodarets.com` / `Data1986` (from `seed:content`).

## Conventions

- **Server Components by default**; add `'use client'` only for interactivity. CMS components use the `Cms` suffix (`HeroCms`, `WhyChooseCms`).
- **Images:** always `<Image>` / `ManagedImage` (shimmer placeholder, S3→CDN via `getAssetUrl()`), never raw `<img>`. Any admin "Image URL / Image Path" field **must** have a **Browse** button opening `MediaPickerModal` (returns an S3 key, not a CDN URL).
- **Admin layout:** wrap pages in `<div className="p-6">` (or `AdminContainer`); `<h1 className="text-2xl font-bold text-gray-900 mb-6">`. Breadcrumbs are off everywhere except the file manager.
- **API routes:** `requireAdmin()` + `isUnauthorized()` (`lib/require-admin.ts`), Zod validation, `logAdminAction()`, responses `{ data }` or `{ error, message }`.
- **Security primitives:** rate-limiter (`lib/rate-limiter.ts`), SSRF guard (`lib/url-validator.ts`), `sanitize-html` for all public `dangerouslySetInnerHTML` (`lib/sanitize.ts`), `safe-regex2` for user regex, `server-only` import in secret-touching modules. Security headers (CSP/HSTS/…) in `next.config.ts`.
- **Rich text:** apply the `article-content` class (in `globals.css`) to sanitized-HTML divs.
- **Styling:** `cn()` from `lib/utils.ts`; colors `sure-blue` / `sure-orange` / `sure-red`; container `max-w-7xl mx-auto px-4`.
- **Analytics / Cookie consent:** GA4 + GTM IDs and Termly UUID live in the DB (`SiteSettings`), never env; public pages only.
- **Settings & content** (Header/Footer/Analytics/SEO/Redirects/Logo/Email) are all edited at `/admin/settings/site` → `SiteSettings`, not hardcoded.

## Gotchas (read before touching these areas)

- **Prisma 7:** `prisma.config.ts` must sit at `surefilter-ui/` root, not in `prisma/`.
- **ISR + CloudFront** (two-layer cache, all public pages `revalidate = 86400`):
  - Parametric routes **must** export `generateStaticParams()` (even `return []`) or ISR silently won't work.
  - Re-export files (`[slug]/page.tsx`) must re-export `revalidate` too. `revalidate` must be a **literal** — no imports (AST analysis).
  - CloudFront cache policy **must** whitelist `RSC` + `Next-Router-Prefetch` (else HTML/RSC payloads mix → raw JSON to users).
  - On-demand invalidation via `invalidatePages()` (`lib/revalidate.ts`).
- **Redirects** live in `src/middleware.ts` (`export const runtime = 'nodejs'`), **not** in `page.tsx` — `redirect()` in a prerendered ISR page duplicates the Location header (Next.js #82117). File must be at `src/middleware.ts` (src-layout). Managed at `/admin/settings/site` → Redirects.
- **Docker build:** `NEXT_BUILD_SKIP_DB=1` → Prisma is a build-time stub; wrap page-level Prisma calls in try/catch. Post-deploy warm-up (`scripts/warm-up.sh` → `/api/warm-up`) repopulates ISR with real data.
- **AWS:** always `--profile surefilter-local`. **Never `tofu apply` without reviewing the plan** (auto-approve once destroyed EC2 + listmonk data). EC2 has `ignore_changes = [ami]` — don't recreate it.
- **App Runner** won't auto-pull a re-pushed ECR tag — bump the tag or run `aws apprunner start-deployment`. Verify the live version via the `AdminFooter` version badge.
- **Canonical URLs:** every new public page needs `alternates: { canonical: '/<path>' }` in `generateMetadata()` (root layout sets `metadataBase`). Don't re-add the title suffix in children — `title.template` does it.
- `ignoreBuildErrors: true` in `next.config.ts` (FilterType.category workarounds) — TS errors won't fail the build, so check types manually.
- **SEO files** (`robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`) are dynamic from the DB, not static.

## Working in this repo

- Reply to the user **in Russian** in chat. Write all **code, commits, and docs in English** (older doc entries are Russian — new edits go English).
- **Do not** add a `Co-Authored-By` / Claude attribution trailer to commits.
- **Commit/push only when asked.** GitHub: git over SSH works; `gh` is unauthenticated — ask the user to trigger GitHub Actions from the UI.
- **Don't commit one-off scripts** (`migrate-*.mjs`, `seed-*.mjs`) — keep them local.
- **After implementing a feature, update** `TODO.md` (mark done / add tasks), `CLAUDE.md` (if architecture/patterns/versions changed), `CHANGELOG.md` (one entry per meaningful change). Do not create new `.md` files per feature — consolidate into these.

## Where to look

| Need | Location |
|------|----------|
| DB schema | `surefilter-ui/prisma/schema.prisma` |
| Deep reference (infra, MCP, banners, sections, routes, email) | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Setup & how-to guides | [docs/GUIDES.md](docs/GUIDES.md) |
| Tasks & tech debt | [TODO.md](TODO.md) |
| Change history | [CHANGELOG.md](CHANGELOG.md) |
| Add a CMS section type | enum in `schema.prisma` → component in `components/sections/` → form in `admin/pages/[slug]/sections/` → `cms/section-renderer.tsx` |
| Add a banner layout | component + `meta` in `components/banners/layouts/` → register in `index.ts` → SVG in `public/images/banner-layouts/` |
| Env vars | [docs/GUIDES.md](docs/GUIDES.md) · `surefilter-ui/env.example` |
