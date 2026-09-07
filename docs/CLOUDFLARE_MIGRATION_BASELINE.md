# Cloudflare migration baseline

**Phase:** 23 — Baseline and migration contract

**Captured:** 7 September 2026

**Scope:** Evidence only. No deployment, DNS, feature, or production-route changes were made.

## Source and rollback references

| Item                       | Verified reference                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| Migration branch           | `codex/cloudflare-static-migration`                                                                      |
| Source commit              | `25467d952bb6069e132890c7de10001fcb21db75`                                                               |
| Current release tag        | Annotated `v1.0.0`, resolving to `25467d952bb6069e132890c7de10001fcb21db75`                              |
| Legacy static archive      | `legacy-static-final` at `e9caf7735e817431e231a60618c4ecf65a7bcf5c`                                      |
| Verified Git identity      | `RahulSinghParmar <rahulsinghparmar4@protonmail.com>`                                                    |
| Node / npm used for checks | Node `v22.23.1` / npm `10.9.8`                                                                           |
| Current Docker runtime     | Coolify-managed, healthy portfolio container using the source SHA in its image name; no restart observed |

The existing `v1.0.0` tag, current Coolify deployment, and legacy static tag are rollback references. They are preserved. Phase 23 did not restart, stop, remove, or reconfigure any container.

## Current hosting and provider baseline

The production portfolio is still delivered through the home-server path. The current Cloudflare DNS view shows both the apex and `www` bound to the proxied **ParmarHomeServer** tunnel. `https://rahulsinghparmar.site/` returns the expected portfolio document with HTTP 200; `www` responds with a path- and query-preserving HTTP 308 redirect to the apex. `https://portfolio-rc.parmar.homes/` also returns the expected portfolio document with HTTP 200.

The `maintenance-page` Worker currently owns the following bindings:

- `*.parmar.homes/*` route — homelab fallback; preserve.
- `rahulsinghparmar.site/*` route — overlaps the future portfolio cutover.
- `*.rahulsinghparmar.site/*` route — overlaps portfolio subdomains.
- `*.rahulsinghparmar.site` custom domain — Worker-managed wildcard DNS.

The maintenance Worker is currently pass-through compatible with a healthy portfolio origin. It must **not** be overwritten for this migration. Phase 29 must deliberately remove or narrow only the portfolio-overlapping bindings after the new portfolio Worker is proven, while preserving the `parmar.homes` fallback.

## Feature and route contract

| Existing capability                                       | Current implementation                     | Cloudflare destination                                   | Phase  |
| --------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------- | ------ |
| Portfolio document, CSS, JavaScript, images, metadata     | Next.js pre-rendered routes                | Workers Static Assets                                    | 24, 26 |
| Motion, theme selection, mobile menu, capability selector | Browser JavaScript, GSAP, Lenis, CSS       | Unchanged static client assets                           | 24     |
| `/api/health`                                             | Dynamic Node route with process uptime     | Edge Worker health response with truthful edge semantics | 25     |
| `/api/system-status`                                      | Dynamic Node route and server-only adapter | API Worker, same public JSON contract                    | 25     |
| Security headers                                          | Next.js configuration                      | Static `_headers` plus API Worker response headers       | 26     |
| Local and CI release checks                               | `.next/standalone` runtime                 | Export plus Wrangler preview runtime                     | 26, 27 |
| Domain, canonical URL, `www` redirect                     | Cloudflare tunnel and redirect             | Cloudflare hosting, with equivalent redirect             | 29     |
| Homelab / maintenance edge                                | Independent Worker and tunnel services     | Remains independent                                      | 29, 30 |

No database, persistent volume, KV, R2, or other state store is required for the portfolio itself. The optional system-status source remains external to the portfolio and may have its own storage.

## Application baseline

The installed application is Next.js `16.3.3`, React `19.2.8`, GSAP `3.15.0`, and Lenis `1.3.26`. It currently uses `output: "standalone"`, so it cannot be published as static assets without the planned migration work.

Current routes:

- Static: `/`, `/_not-found`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/icon`, `/apple-icon`, `/opengraph-image`, and `/twitter-image`.
- Dynamic: `/api/health` and `/api/system-status`.

The status source is intentionally **disabled** in the running deployment. No status URL or token is configured. The public status API correctly returns `pending`, `Status source not connected`, no service data, and `source: "disconnected"`. This is the honest baseline; no future phase may fabricate monitoring data or publish private homelab details merely to make the widget look live.

### Visual and interaction baseline

Fresh production output was tested locally with `?motion=full`:

- Desktop at `1440 × 900`: dark and light theme render correctly; the hero canvas is present; scroll-driven transform activity was observed.
- Narrow screen at `390 × 844`: no horizontal overflow (`375px` document width), the compact header/menu works, menu dismissal restores focus to the menu button, and light/dark themes render correctly.
- Capability map selection was exercised by selecting Automation; it changed the active layer and rendered PowerShell, Python, Shell, and GitHub Actions content.
- The status component rendered the disconnected source state without affecting the page.
- No browser console warnings or errors were reported during this local baseline.

These are browser-emulation checks, not a substitute for later real-device acceptance in Phase 28.

## Validation evidence

The first `npm run quality:check` exposed formatting only in the newly authored migration plan. After formatting that document, the full check passed:

- Prettier check: pass.
- ESLint with zero warnings: pass.
- TypeScript: pass.
- Production build: pass.
- Performance budget: pass.
- SEO release contract: pass.
- Local deployment contract against `http://127.0.0.1:3113`: pass.

| Performance metric                  | Result                                      |
| ----------------------------------- | ------------------------------------------- |
| Home HTML, raw                      | 140.6 KiB / 160.0 KiB budget                |
| Initial JavaScript, raw             | 585.3 KiB / 620.0 KiB budget                |
| Initial JavaScript, Brotli          | 156.7 KiB / 190.0 KiB budget                |
| Initial CSS, raw                    | 50.9 KiB / 64.0 KiB budget                  |
| Critical route, Brotli              | 180.3 KiB / 225.0 KiB budget                |
| Public raster image total / largest | 172.6 KiB / 350.0 KiB and 200.0 KiB budgets |

The locally served production build returned the expected security headers, canonical document, metadata resources, `no-store` health response, and real HTML 404s for missing page routes.

## Pre-existing migration work items

These are recorded for later phases; they are not fixed in Phase 23.

1. Static export is blocked by the two dynamic API routes and the current standalone-only release scripts.
2. The system-status implementation uses Node-only `server-only` and `process.env`; it needs a Worker-safe separation of shared types and Worker bindings.
3. Unknown API paths currently receive Next's HTML 404. Phase 25 must return a deliberate API JSON response instead.
4. The browser status polling should suspend while the page is hidden and avoid request overlap; Phase 25 owns this refinement.
5. Hosting labels and the Under the Hood topology still describe the Coolify container path as the current portfolio host. Phase 26 must change only those factual labels after the new runtime exists.
6. The provider maintenance routes overlap the portfolio apex and wildcard. Phase 29 must resolve the overlap in a controlled cutover, not earlier.
7. Public source availability from a Worker must be designed safely. The production status source is disabled, so no Cloudflare-reachability exception is needed before Phase 25.

## Safe next action

Proceed to Phase 24: create and validate the static export locally while preserving the current UI, motion, themes, generated metadata, and the existing source/Docker rollback references. Do not publish, change DNS, or alter the maintenance Worker.
