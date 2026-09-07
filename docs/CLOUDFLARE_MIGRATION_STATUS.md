# Cloudflare migration status

## Current position

| Field                    | Value                                                 |
| ------------------------ | ----------------------------------------------------- |
| Status                   | Phase 27 complete                                     |
| Active branch            | `codex/cloudflare-static-migration`                   |
| Baseline SHA             | `25467d952bb6069e132890c7de10001fcb21db75` (`v1.0.0`) |
| Production changes       | None                                                  |
| DNS / Cloudflare changes | None                                                  |
| Docker / Coolify changes | None                                                  |
| Next phase               | Phase 28 — hosted preview and acceptance              |

## Completed in Phase 23

- Created the isolated migration branch.
- Verified the current release, legacy archive, Git identity, runtime versions, local application routes, and current Coolify container health.
- Verified the system-status source is deliberately disconnected, with no configured URL or token.
- Captured desktop and narrow-screen production-build behavior for themes, motion, responsive navigation, capability selection, status isolation, accessibility affordances, and console output.
- Ran the complete local quality gate and the local deployment contract successfully.
- Read the current Cloudflare DNS and maintenance Worker bindings, recording the portfolio route overlap for later cutover.
- Created [CLOUDFLARE_MIGRATION_BASELINE.md](CLOUDFLARE_MIGRATION_BASELINE.md).

## Phase 23 command evidence

```text
npx prettier --write docs/CLOUDFLARE_MIGRATION_PLAN.md
npm run quality:check
npm run deployment:check -- http://127.0.0.1:3113
```

All commands above completed successfully after the migration plan was formatted. The initial quality run reported only the new plan's Prettier formatting; no application defect was found.

## Completed in Phase 24

- Changed Next.js from the standalone Node output to `output: "export"`.
- Removed the dynamic API handlers from `app/` and preserved their exact Node behavior under `migration/reference/node-api/` for the Phase 25 port.
- Preserved the previous Next.js security-header contract under `migration/reference/next-security-headers.ts` for Phase 26.
- Marked the manifest, robots, sitemap, favicon, Apple icon, Open Graph image, and Twitter image generators as static export routes.
- Replaced standalone-runtime preparation with a deterministic export verifier.
- Added a pre-build cleanup for the generated `.next/` and `out/` directories after stale development route types were found during the first export attempt.
- Updated performance and SEO checks to inspect `out/` rather than `.next/server/app/`.
- Added a dependency-free local static preview server through `npm start`.
- Verified exported document routes, real 404 handling, HEAD and method behavior, asset MIME types, metadata images, responsive layout, themes, motion, navigation, and status-widget failure isolation.

## Phase 24 command evidence

```text
npm run build
npm run performance:check
npm run seo:check
$env:PORT = "3124"
npm start
npm run quality:check
```

Results:

- Static export verification: pass; `out/index.html` and `out/404.html` exist, required metadata assets exist, and no `out/api/` artifact exists.
- Full formatting, lint, type, export build, performance, and SEO gate: pass.
- Initial JavaScript decreased from 585.3 KiB to 584.8 KiB raw; every existing performance budget remains within its limit.
- Desktop export check at `1440 × 900`: light/dark themes, canvas, hash navigation, and scroll motion pass.
- Narrow export check at `390 × 844`: no horizontal overflow, mobile menu and scroll lock pass, and the page remains usable after the unavailable API response.
- Browser console: no warnings or errors observed during the export checks.

### Deliberate Phase 24 gaps

- `/api/health` and `/api/system-status` return a real HTML 404 in the static-only preview. This is expected until the API Worker is implemented in Phase 25.
- The status component reports `Status boundary unavailable` when the static-only preview reaches that section. The failure remains isolated to the widget.
- Static response security headers are not supplied by the dependency-free preview server. Their previous values are preserved for Cloudflare implementation and runtime validation in Phase 26.
- The current Dockerfile and Node-oriented deployment checker still describe the previous hosting path. They are not the static export release path and will be handled by the assigned later phases.
- Next.js emits the generated PNG metadata images as extensionless files. Their PNG content and MIME behavior pass in the local static preview; the actual Wrangler/Cloudflare response behavior must be rechecked in Phase 26 before deciding whether named `.png` copies are required.

## Completed in Phase 25

- Separated the browser-safe `SystemStatus` contract into `lib/system-status-contract.ts`; no live client code imports the previous `server-only` module.
- Preserved the former Node status adapter beside the Node route references under `migration/reference/node-api/`.
- Added an edge-native Worker handler for `/api/health` and `/api/system-status`.
- Replaced process uptime with an honest health payload containing service identity, version, request-time timestamp, and `runtime: "cloudflare-workers"`.
- Added deliberate no-store JSON contracts for GET, HEAD, unknown API paths, and unsupported methods.
- Ported status normalization for operational, degraded, unavailable, unknown, and disconnected states.
- Restricted upstream access to the single runtime-bound URL. The Worker rejects non-HTTPS URLs, URL credentials, fragments, redirects, non-JSON responses, malformed JSON, and responses larger than 64 KiB.
- Bounded upstream timeouts to 1–8 seconds and kept the optional bearer token in the Worker environment boundary.
- Updated client polling to stop outside the observed section, stop while the document is hidden, abort superseded work, avoid overlapping requests, and resume on visibility.
- Extended `npm start` to preview the export and Phase 25 API handler together without publishing it.
- Added the Worker tests to the project-wide quality gate.

## Phase 25 command evidence

```text
npm run typecheck
npm run test:worker
npm run quality:check
$env:PORT = "3125"
$env:SITE_VERSION = "v1.0.0-phase25"
$env:SYSTEM_STATUS_SOURCE = "http"
$env:SYSTEM_STATUS_URL = "http://127.0.0.1/private"
npm start
```

Results:

- Worker tests: 14 pass, 0 fail.
- Full formatting, lint, type, Worker test, static export, performance, and SEO gate: pass.
- Health GET/HEAD: HTTP 200, JSON MIME, no-store, no process uptime.
- System status with the deliberately unsafe local source: safe `unavailable` payload; the private URL was not fetched or disclosed.
- Unknown API route: HTTP 404 JSON. Unsupported known-route method: HTTP 405 JSON with `Allow: GET, HEAD`.
- Browser integration: while the tab was hidden the status request remained suspended; once visible and near the component, the unavailable state rendered without affecting the homepage, navigation, or footer.
- Browser console: no warnings or errors observed.
- Performance remains inside all existing budgets. Initial JavaScript is 585.3 KiB raw and the Brotli critical route is 180.4 KiB.

### Deliberate Phase 25 gaps

- The Worker has been exercised through unit tests and the local Node integration adapter, not the Cloudflare runtime. Wrangler packaging and runtime parity belong to Phase 26.
- Static assets are not yet delegated through a Cloudflare `ASSETS` binding. The Phase 25 Worker deliberately returns plain 404 for non-API paths when invoked by itself.
- Static security headers and cache policy remain assigned to Phase 26.
- The production status source remains disabled. No endpoint or secret was added, and no private homelab service was exposed.
- The runtime bindings in `.env.example` support local validation only. Phase 26 must define checked-in, non-secret Wrangler configuration and the production secret workflow.

## Completed in Phase 26

- Pinned Wrangler `4.129.0` as a development dependency and added `wrangler.jsonc` as the checked-in Cloudflare configuration source.
- Aligned the declared project runtime with Wrangler's Node.js 22 minimum; local validation used Node.js `22.23.1`.
- Configured `out/` as the Workers Static Assets directory with a named `ASSETS` binding, `404-page` handling, automatic trailing-slash HTML behavior, and Worker-first execution limited to `/api` and `/api/*`.
- Added the navigation compatibility flag so direct browser navigation to an API path returns the JSON API contract instead of an HTML asset response.
- Defined separate local, preview, and production Worker identities. The preview identity enables `workers.dev` and version previews; production disables both and intentionally has no custom-domain route yet.
- Added static response policies through `public/_headers`: the preserved CSP and security controls, revalidation for HTML and unversioned files, one-year immutable caching for fingerprinted Next.js assets, and bounded caching for the stable portrait URL.
- Applied the same security policy directly to Worker-generated API responses, retained `no-store`, and added `noindex, nofollow` outside the production environment.
- Added a host-specific static `X-Robots-Tag` rule for all `workers.dev` responses so a preview cannot compete with the canonical production domain.
- Delegated non-API Worker fallthrough to the `ASSETS` binding, preserving the exported HTML 404 response and status.
- Resolved the deferred extensionless-image MIME issue by producing deterministic named PNG metadata assets during postbuild and rewriting generated document references to the named files.
- Added the one-command complete runtime `npm run preview:cloudflare`, the non-uploading package check `npm run cloudflare:check`, the ignored `.dev.vars.example` secret template, and [CLOUDFLARE_LOCAL_PREVIEW.md](CLOUDFLARE_LOCAL_PREVIEW.md).
- Updated only the portfolio's active hosting topology and delivery labels from the Coolify container path to Cloudflare static assets plus an isolated API Worker.

## Phase 26 command evidence

```text
npm view wrangler version
npm install --save-dev --save-exact wrangler@4.129.0
npm run typecheck
npm run test:worker
npm run cloudflare:check
npx wrangler dev --local --port 8788 --show-interactive-dev-session=false
npm run quality:check
npx wrangler deploy --dry-run --env preview --outdir .wrangler/dry-run-final
npx wrangler deploy --dry-run --env production --outdir .wrangler/dry-run-production
```

Results:

- Preview and production Wrangler package dry-runs: pass; each discovered 52 static files and produced an 11.25 KiB raw / 3.55 KiB gzip Worker bundle with only the expected asset and non-secret environment bindings.
- Local Wrangler runtime: home HTTP 200; genuine HTML 404; health navigation HTTP 200 JSON; unknown API HTTP 404 JSON; unsupported API method HTTP 405 with `Allow: GET, HEAD`.
- Headers: static and API CSP/security policies present; APIs remain `no-store`; hashed CSS is immutable for one year; the stable portrait has a one-day bounded cache.
- Host-specific robots policy: a simulated `*.workers.dev` host returned `X-Robots-Tag: noindex, nofollow`; the same request with the production apex host did not receive that header.
- Metadata images: named Open Graph, Twitter, browser icon, and Apple icon paths return HTTP 200 with `image/png`; the document no longer references extensionless image URLs.
- Browser integration: full-motion diagnostic mode, light-theme switching, responsive width, updated architecture copy, and disconnected status rendering passed. Browser console contained no warnings or errors.
- Worker tests: 16 pass, 0 fail.
- Full formatting, lint, type, Worker test, static export, performance, and SEO gate: pass. All existing performance budgets and all 37 SEO assertions remain within contract.
- No Worker was uploaded. DNS, public routing, Docker, Coolify, and the maintenance Worker were not changed.

### Deliberate Phase 26 gaps

- The package has been validated through Wrangler's local runtime and dry-run bundler, not through a hosted Cloudflare preview. Account-level preview deployment belongs to Phase 28.
- The production environment intentionally has no route or custom domain. Adding production bindings before the controlled Phase 29 cutover would risk intercepting live traffic.
- The status source remains disabled and no Worker secret has been created. The documented secret commands are operator actions for a later approved connection.
- Existing README, deployment-check, Docker, and Coolify operating material still documents the rollback runtime. Phase 27 owns release-workflow and operating-document reconciliation; the rollback artifacts remain deliberately intact.
- Real-device acceptance remains Phase 28. The Phase 26 browser result is local desktop automation, not evidence from an iPhone or another physical client.

## Completed in Phase 27

- Replaced the retired standalone-server and Docker CI jobs with one release job that validates the static export, packages the Worker, enforces repository-owned limits, starts local Wrangler, and exercises the deployed response contract.
- Added a manual-only Cloudflare deployment workflow with exact-SHA confirmation, read-only repository permissions, separate preview/production GitHub environments, serialized environment deployments, and mandatory revalidation immediately before Wrangler can publish.
- Added production safeguards requiring `main`, repository variable `PRODUCTION_DEPLOYMENT_ENABLED=true`, and the `cloudflare-production` environment approval boundary.
- Kept GitHub Actions as the single intended deployment owner. Cloudflare Workers Builds must remain disabled to prevent an unreviewed duplicate publisher.
- Expanded the deployment contract from the previous Node assumptions to 73 Cloudflare checks covering GET/HEAD, static and API security headers, real HTML 404, JSON API errors, cache policy, named metadata images, portrait MIME/caching, canonical metadata and honest Worker health semantics.
- Added a package-limit contract for static file count, total and individual asset size, Worker bundle size, `_headers` rules, Node runtime and exact Wrangler version.
- Rebuilt the README and deployment runbook around local development, complete Wrangler preview, preview promotion, protected production promotion and rollback. Relabeled Coolify instructions as a retained rollback path.
- Rechecked the rendered local Cloudflare runtime at desktop and constrained/tablet widths. Full motion, Canvas enhancement, light/dark themes, skip navigation and horizontal-overflow checks passed.

## Phase 27 command evidence

```text
npx prettier --write <Phase 27 files>
npm run release:check
npm run deployment:check -- http://127.0.0.1:8788
npm audit --omit=dev
git diff --check
```

Results:

- Release gate: pass; formatting, lint, TypeScript, 16 Worker tests, static export, seven performance budgets and 37 SEO assertions passed.
- Cloudflare package: pass; Wrangler found 52 deployable assets. Repository scan measured 43 physical files, 1.73 MiB total, 223.8 KiB largest asset and an 11.2 KiB Worker bundle, all below enforced project limits.
- Live Wrangler deployment contract: 73/73 checks passed.
- Full dependency audit, including release tooling: zero known vulnerabilities returned by npm's advisory service. A repository pattern scan found no populated API key, bearer token or token assignment.
- Registry freshness review found small patch updates for Next.js, its ESLint config, Wrangler and two type packages, plus major ESLint 10 and TypeScript 7 lines. They were not mixed into the migration candidate because no advisory is open and major toolchain changes require their own compatibility review; ESLint 9 now emits an upstream support deprecation warning and is a recorded post-migration maintenance item.
- Browser runtime: 1280 × 720 desktop and 847 × 912 constrained/tablet checks passed with no horizontal overflow. Full motion and Canvas initialized, both theme surfaces resolved, and the skip link focused `main-content`.
- No Worker was uploaded. GitHub, Cloudflare account settings, DNS, Docker, Coolify and the maintenance Worker were not changed.

### Deliberate Phase 27 gaps

- The GitHub workflows are locally formatted and structurally reviewed but cannot execute until the branch is committed and pushed. A hosted GitHub Actions run is Phase 28 evidence.
- The `cloudflare-preview` and `cloudflare-production` GitHub environments, their scoped secrets, production reviewer/branch protection and `PRODUCTION_DEPLOYMENT_ENABLED` variable are manual account actions. They were documented but not created.
- Cloudflare Workers Builds must be confirmed disabled manually before the first preview deployment. No provider-side project configuration was changed.
- Native reduced-motion, Firefox, Edge, Safari and physical iOS/Android acceptance were not claimed from browser emulation. They remain Phase 28 checks against the hosted preview.
- The status source remains deliberately disabled. Timeout and malformed-source behavior passed unit tests; no monitoring credential or endpoint was created.
- Dependency freshness is not identical to vulnerability status: the locked tree has zero known advisories, but ESLint 9 support deprecation and the available patch releases should be reviewed in a narrow follow-up after migration stabilization.
- The current Docker/Coolify state was not re-inspected in Phase 27 and remained untouched. The portfolio workload is intentionally paused/unhealthy by prior operator decision and must not be resumed without approval.

## Important current facts

- Public apex, `www`, and `portfolio-rc.parmar.homes` behavior was not re-queried in Phase 27. Treat the Phase 23/26 observations as historical until Phase 29 performs a fresh routing preflight.
- The intended canonical behavior remains apex delivery with `www` preserving path and query while redirecting to the apex.
- The maintenance Worker has routes that overlap `rahulsinghparmar.site`; retain it unchanged until the controlled Phase 29 cutover.
- Treat `v1.0.0` and the legacy static tag as rollback references. The portfolio Coolify workload is intentionally paused/unhealthy by operator decision; do not resume, remove or restart it for this migration without explicit approval.
- The optional live-status widget is honestly disconnected. Do not add a source, secret, or public homelab endpoint during the static-export phase.

## Known work items, assigned by phase

| Item                                                                    | Owner phase |
| ----------------------------------------------------------------------- | ----------- |
| Static export and build-script conversion                               | 24 — done   |
| API Worker, safe upstream behavior, polling isolation, JSON API 404s    | 25 — done   |
| Wrangler packaging, headers, local Worker preview, hosting-label update | 26 — done   |
| CI, release validation, and controlled deployment workflow              | 27 — done   |
| Hosted preview and real-device acceptance                               | 28          |
| Domain, redirect, and maintenance-route cutover                         | 29          |
| Observation, release, rollback handoff, and retired-trigger cleanup     | 30          |

## Resume instruction

Use the following request to continue safely:

> Start Phase 28 using `docs/CLOUDFLARE_MIGRATION_PLAN.md` and `docs/CLOUDFLARE_MIGRATION_STATUS.md`. Commit and push the reviewed candidate only after approval, configure the documented GitHub environments and least-privilege Cloudflare credentials manually, deploy the exact SHA to the hosted preview, and complete cross-browser and real-device acceptance. Do not change production routing or DNS.
