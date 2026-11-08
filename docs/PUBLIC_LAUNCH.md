# Stable v1.1.0 public launch

Status checked on 10 September 2026: **public v1.1.0 launch complete**.

## Verified

- Stable source and GitHub release: `v1.1.0`, commit `5b90316cabbe175d1daf5a33493b4d62383eb5b7`.
- [Preview workflow](https://github.com/RahulSinghParmar/Portfolio/actions/runs/34354395585) succeeded; all 73 hosted deployment checks passed.
- Preview Worker version: `7dabc8b6-6880-4d28-ab4f-c8fbc5eabb74`.
- [Production workflow](https://github.com/RahulSinghParmar/Portfolio/actions/runs/34354759974) was approved by the required reviewer and succeeded.
- Production Worker version: `9321b550-4f00-433f-b160-d227913ebe41`.
- Repository production gate restored to `false` after upload.

## Completed domain cutover

The initial public response was an HTTP 200 diagnostic page from the old Docker origin, including at `/api/health`. This was a routing problem, not a failed Cloudflare application build. The former maintenance wrapper correctly passed through that 200 response; it could not identify that the wrong application was answering.

After renewed user authorization, the portfolio-only cutover was completed:

- Replaced the apex tunnel CNAME with the production Worker's managed Custom Domain.
- Replaced the `www` tunnel CNAME with proxied A `192.0.2.0`, used only to enter Cloudflare's redirect processing; it is not an application server.
- Preserved the existing **Canonical www to apex** edge rule (308). HTTP is first upgraded to HTTPS (301); paths and query strings survive both redirects.
- Removed maintenance routes `rahulsinghparmar.site/*` and `*.rahulsinghparmar.site/*` and the obsolete maintenance Custom Domain `*.rahulsinghparmar.site`.
- Left the shared tunnel, all `parmar.homes` routing, nameservers, null MX, SPF and DMARC unchanged.
- Kept the `maintenance-page` Worker and its `*.parmar.homes/*` Route.
- Production gate read back as `false` after cutover. No new application upload or release-tag change was needed.

Acceptance evidence:

- [x] Portfolio-only routing changes completed with recoverable old values recorded locally.
- [x] Production apex Custom Domain, HTTPS and valid TLS verified without bypassing certificate validation.
- [x] Portfolio maintenance routes no longer intercept the live site.
- [x] `www` and HTTP canonical redirects verified with `/test-cutover?check=1`.
- [x] All 73 production deployment checks pass, including assets, headers, metadata and genuine 404 handling.
- [x] `/api/health` reports `v1.1.0`, `status: ok` and `runtime: cloudflare-workers`.
- [x] Public portrait and light/dark theme switching visually verified; no browser warning/error logs observed during this smoke test.
- [x] Final DNS/routing state and rollback values recorded. Existing `dash.parmar.homes` still returns the healthy dashboard.

This launch smoke test does not replace the earlier device/motion acceptance review. No home-server outage was induced. A controlled homelab failure/recovery test remains a separate operational check, not a blocker for the independently hosted portfolio.

## Homelab maintenance behavior

The [maintenance repository](https://github.com/RahulSinghParmar/maintenance-page) uses an origin-proxy **Route**, not an origin-replacing Custom Domain. Its source passes healthy responses through and generates a self-contained 503 page for specified origin failures and network exceptions, with `Retry-After: 45` and no-store directives. Ordinary application 404s are preserved.

The route is present in the dashboard. The repository source was inspected, but this session did not compare its exact revision with the deployed Worker or deliberately stop a healthy service. Therefore end-to-end outage recovery is not newly certified here. Returning HTTP 200 from a diagnostic catch-all will mask a missing application; correct that origin routing in a separately reviewed homelab maintenance task, rather than classifying every 200 or 404 as an outage.

For a controlled test, select one disposable service, record the healthy response, stop only that service, check for the branded 503/no-store/Retry-After response, then restore it and verify normal content returns. Do not stop the entire tunnel or host merely to test the page. A Cloudflare-hosted fallback cannot cover a Cloudflare-wide outage or DNS failure before traffic reaches the Worker.

See [Updating and publishing](UPDATE_AND_RELEASE.md) for the ongoing workflow. Routine releases use the protected GitHub Actions deployment and do not require further DNS changes.
