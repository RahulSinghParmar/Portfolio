# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and releases use [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-31

### Added

- Next.js App Router application with strict TypeScript and centralized public content modules.
- Responsive editorial interface covering selected work, infrastructure capabilities, professional history, credentials, application architecture and contact routes.
- Three infrastructure case studies with topology diagrams, operating decisions, reliability thresholds and verified destinations.
- Interactive capability map and progressive Canvas/SVG network visual.
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
- Rebuilt README, contribution and security documentation around the production operating contract.
- Moved legacy image references out of runtime asset paths.

### Fixed

- Corrected project-diagram hydration output.
- Removed stale phase and target-deployment messaging from the public interface.
- Removed obsolete CSS selectors and unused content-status fields.
- Replaced the malformed 217×256 legacy favicon path with generated square browser and Apple icons.
- Added private conduct-reporting guidance and removed placeholder repository policy text.
- Added cross-origin opener and resource policy headers to the deployment contract.

### Performance

- Dynamically loads GSAP, ScrollTrigger and Lenis only on capable clients.
- Caps Canvas rendering at 30 FPS and 1.5 device-pixel ratio and suspends it off-screen.
- Uses static route-map fallbacks for mobile, coarse-pointer, reduced-motion, low-power and data-saving clients.
- Defers status polling until the section approaches the viewport and pauses it while out of view.
- Enforces compressed HTML, JavaScript, CSS and public-image budgets.

### Accessibility

- Added semantic landmarks, ordered headings, skip navigation and a custom accessible 404 route.
- Added keyboard-operable mobile navigation with focus containment, Escape handling, focus restoration and inert background content.
- Added visible focus indicators, reduced-motion fallbacks, named diagrams and explicit new-tab context.
- Added polite, atomic live-status announcements.
- Verified Lighthouse accessibility at 100/100 on desktop and mobile before the release-candidate audit.

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

[1.0.0]: https://github.com/RahulSinghParmar/Portfolio/releases/tag/v1.0.0
