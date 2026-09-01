# Portfolio migration strategy

## Current architecture

The repository started as a multi-page static site built with HTML, global CSS, imperative JavaScript and Bootstrap loaded from a CDN. The home page fetched GitHub repositories and release data directly in the browser. Separate `issues` and fake-terminal pages duplicated the same navigation and vendor scripts. GitHub Pages deployed the repository root.

## What remains

- Rahul Singh Parmar's identity, current domain and verified professional positioning.
- The transparent, WebP-optimized portrait at `public/images/rahul.webp` for a later editorial image treatment.
- The WebP-optimized previous-site capture at `docs/assets/legacy-portfolio.webp` as a migration reference.
- Verified education, certification, social and project references, migrated only when used.
- Repository governance files: license, security policy, contribution guide and code of conduct.

## What is removed

- Bootstrap, jQuery, Popper and Material Icons CDNs.
- The generic rotating developer/coder hero and code-snippet identity.
- Bootstrap cards, badge-style social links and duplicated static pages.
- The fake terminal and client-side issue aggregator.
- Unhandled browser requests to the unauthenticated GitHub API.
- The GitHub Pages deployment workflow and `CNAME`; Coolify will own the domain and deployment.
- Stale links and developer-only career copy.

## Target architecture

- Next.js App Router with strict TypeScript.
- Server components by default; client components only where interaction requires them.
- Central content modules in `data/`.
- Section-specific components grouped under `components/`.
- CSS design tokens and a 12/8/4-column responsive grid.
- One future signature interactive network, dynamically loaded with a static SVG fallback.
- Server-side status abstraction in `lib/system-status.ts`.
- Standalone Next.js output for a later multi-stage Docker/Coolify deployment.

## Dependency strategy

### Added in Phases 1–2

- `next`, `react`, `react-dom`: application framework and rendering.
- `geist`: locally bundled, open-source sans and mono typography without a runtime font request.
- `typescript`: strict content and component contracts.
- `eslint`, `eslint-config-next`, `prettier`: automated quality gates.
- `gsap`: disciplined entrance, reveal and scroll-linked composition.
- `lenis`: smooth scrolling synchronized with ScrollTrigger.

### Removed

- Bootstrap, jQuery, Popper, Google Material Icons and all CDN runtime dependencies.

### Deferred

- Three.js/React Three Fiber will be added only after profiling proves that the signature hero benefits from WebGL. Canvas or SVG remains the default.

## Performance implications

The site ships no icon library or WebGL runtime. Fonts are bundled, GSAP/ScrollTrigger/Lenis load after the critical route on capable devices only, and the status request waits until its interface approaches the viewport. The portrait and legacy reference have been converted from 3.0 MB of PNG source assets to approximately 225 KiB of WebP assets. The Canvas network draws at 30 FPS, caps device-pixel ratio, pauses outside the viewport and falls back to semantic SVG for reduced motion, low-power hardware and data-saving connections. Touch and mobile devices retain the progressive motion layer unless one of those constraints applies.

## Migration plan

1. **Foundation** — App Router, data contracts, typography, responsive grid, navigation and tokens.
2. **Hero** — disciplined motion and one progressive network interaction with static fallbacks.
3. **Projects** — architecture-led case studies powered by `data/projects.ts`.
4. **Systems** — infrastructure map, engineering stack and automation pipeline.
5. **Professional content** — experience, certifications and personal story.
6. **Under the hood** — deployment diagram and swappable live-status adapter.
7. **Contact and footer** — final editorial composition and validated links.
8. **Performance** — route-level profiling, asset conversion, bundle budgets and Lighthouse review.
9. **Accessibility** — keyboard, screen reader, contrast and motion audit.
10. **SEO** — final social image, structured data and production crawl validation.
11. **Deployment** — multi-stage Docker image, CI quality gate and Coolify runbook.
