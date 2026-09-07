# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and releases use [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Cloudflare Workers Static Assets packaging with selective API Worker routing, local/preview/production environments and real static 404 handling.
- Edge-native health and bounded read-only status APIs with failure isolation and Worker unit tests.
- Release artifact guardrails for static asset count/size, Worker bundle size and `_headers` complexity.
- Manual, SHA-bound GitHub Actions workflow for preview and protected production promotion.

### Changed

- Replaced the active standalone Node/Coolify delivery model with a reproducible static export and Cloudflare Worker target.
- Reconciled contributor, deployment and operating documentation around GitHub Actions as the single deployment owner.
- Retained Docker and Coolify material as an explicit `v1.0.0` rollback reference rather than an active CI path.

### Fixed

- Replaced extensionless generated metadata-image references with deterministic PNG paths and verified MIME types.
- Updated deployment validation to cover Worker navigation, HEAD, JSON API errors, security headers, cache policies and genuine 404s.

### Performance

- Kept static requests out of Worker execution and applied immutable caching only to fingerprinted assets.
- Confirmed the migration candidate remains within existing route budgets and new Cloudflare artifact budgets.

### Security

- Added matching security policy to static and Worker-generated responses, preview noindex isolation and least-privilege deployment guidance.

## [1.0.0] - 2026-09-01

### Added

- Next.js App Router application with strict TypeScript and centralized public content modules.
- Responsive editorial interface covering selected work, infrastructure capabilities, professional history, credentials, application architecture and contact routes.
- Three infrastructure case studies with topology diagrams, operating decisions, reliability thresholds and verified destinations.
- Interactive capability map and progressive Canvas/SVG network visual.
- Persistent system, light and dark color themes initialized before first paint.
- Server-only system-status adapter, public read-only status route and shallow health endpoint.
- Generated browser, Apple, Open Graph and Twitter/X assets.
- Canonical metadata, robots directives, sitemap, web manifest and Person, WebSite, ProfilePage and selected-work structured data.
- Multi-stage standalone Docker image, non-root runtime, native health check and Coolify/Cloudflare operating guide.
- Repository performance, SEO and deployment contract scripts.
- Pull-request and `main` quality workflow with production-server and Docker build checks.

### Changed

- Replaced the legacy static HTML/CSS/JavaScript portfolio with typed, data-driven server-rendered sections.
- Rewrote marketing-style copy into direct infrastructure and operations language.
- Replaced prototype `mock` terminology with an explicit disconnected status state.
- Updated the current professional identity to DCO Tech 3, retained Team Lead Network Engineer as previous career history and moved the public contact route to Proton Mail.
- Rebuilt README, contribution and security documentation around the production operating contract.
- Moved legacy image references out of runtime asset paths.

### Fixed

- Corrected project-diagram hydration output.
- Removed stale phase and target-deployment messaging from the public interface.
- Removed obsolete CSS selectors and unused content-status fields.
- Replaced the malformed 217×256 legacy favicon path with generated square browser and Apple icons.
- Added private conduct-reporting guidance and removed placeholder repository policy text.
- Added cross-origin opener and resource policy headers to the deployment contract.
- Restored the `?motion=full` production override and removed pointer type and viewport width as automatic reasons to disable motion.
- Replaced the dark-only viewport and hard-coded diagram colors with theme-aware interface and Canvas tokens.
- Increased the mobile light-theme topology contrast so the reduced-motion SVG fallback remains legible.
- Corrected the narrow-screen Proton Mail type scale to prevent an orphaned final line at 320–390 pixels.

### Performance

- Dynamically loads GSAP, ScrollTrigger and Lenis only on capable clients.
- Caps Canvas rendering at 30 FPS and 1.5 device-pixel ratio and suspends it off-screen.
- Uses static route-map fallbacks for reduced-motion, low-power and data-saving clients while retaining progressive motion on touch and mobile devices.
- Defers status polling until the section approaches the viewport and pauses it while out of view.
- Enforces compressed HTML, JavaScript, CSS and public-image budgets.

### Accessibility

- Added semantic landmarks, ordered headings, skip navigation and a custom accessible 404 route.
- Added keyboard-operable mobile navigation with focus containment, Escape handling, focus restoration and inert background content.
- Added visible focus indicators, reduced-motion fallbacks, named diagrams and explicit new-tab context.
- Added polite, atomic live-status announcements.
- Verified Lighthouse accessibility at 100/100 on desktop and mobile before the release-candidate audit.
- Verified the production composition from 320 to 1920 CSS pixels across full and reduced motion; recorded the browser-engine boundary in `docs/VISUAL_REGRESSION.md`.

### SEO

- Added a single canonical production identity and recruiter-focused metadata.
- Added generated social cards with dimensions and alternative text.
- Added structured data sourced from the same typed content used by the interface.
- Added enforced crawl, manifest, social-image, icon and not-found contracts.
- Verified Lighthouse SEO at 100/100 on desktop and mobile before the release-candidate audit.

### Deployment

- Added deterministic `npm ci` builds and Next.js standalone output.
- Added a Node.js 22 Alpine runtime running as UID/GID `1001`.
- Added `/api/health`, Docker health checking, deployment smoke tests and rollback instructions.
- Added CSP, frame, content-type, referrer, permissions and cross-origin response headers.
- Documented the Traefik HTTP origin and Cloudflare-managed public TLS boundary.
- Documented the Cloudflare authoritative-DNS cutover and explicit Null MX, SPF and DMARC no-mail policy.
- Preserved the final static portfolio source as the `legacy-static-final` GitHub release.
- Pinned the release workflow to immutable, Node.js 24-based GitHub Action revisions.
- Replaced the unsupported standalone `next start` path with the generated minimal server used by local, CI, Docker and Coolify runtimes.
- Assembled public and hashed static assets into one self-contained standalone directory and reduced the Docker runner to one artifact copy.
- Documented Coolify UUID/deployment naming, the current temporary candidate, safe cleanup boundaries and the single-deployment operating workflow.
- Promoted the reviewed release candidate through Coolify, Traefik and the existing Cloudflare Tunnel to the canonical production domain.
- Added proxied apex and `www` tunnel routes, a path/query-preserving `www` to apex 308 redirect and zone-wide HTTP-to-HTTPS enforcement.
- Removed the obsolete `http://localhost` Coolify diagnostic domain while retaining the temporary RC hostname for the stabilization window.
- Retired the active GitHub Pages deployment while preserving the final static portfolio as the `legacy-static-final` release.

[1.0.0]: https://github.com/RahulSinghParmar/Portfolio/releases/tag/v1.0.0
