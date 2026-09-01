# Rahul Singh Parmar — Engineering Portfolio

Production portfolio for Rahul Singh Parmar, a DCO Tech 3 focused on data center operations, network reliability, systems administration, security, AWS, homelab engineering and practical automation.

- Public site: [rahulsinghparmar.site](https://rahulsinghparmar.site)
- Release target: `v1.0.0`
- Runtime: Next.js standalone server in a non-root Docker container

## Project overview

This repository replaces an earlier static portfolio with a typed, data-driven Next.js application. The site presents selected infrastructure work as operational case studies: what failed, how the system responds, which controls protect it and how recovery is observed.

Most content is rendered on the server. JavaScript is reserved for navigation, persistent color-theme control, optional motion, the capability map and a read-only status view. The public site has no database, authentication flow or write-capable API.

## Architecture

```text
Visitor
  └─ Cloudflare HTTPS edge
       └─ Cloudflare Tunnel
            └─ Traefik HTTP origin
                 └─ Next.js standalone container :3000
                      ├─ Static and server-rendered portfolio
                      ├─ GET /api/health
                      └─ GET /api/system-status
                           └─ Optional read-only monitoring source
```

The status adapter is the only optional external data path. It runs server-side, applies a strict timeout, normalizes the upstream payload and exposes a deliberately small public response. Credentials never cross the server boundary.

## Technology stack

| Layer       | Technology                                     | Purpose                                                   |
| ----------- | ---------------------------------------------- | --------------------------------------------------------- |
| Application | Next.js 16, React 19, TypeScript               | App Router, server rendering and typed UI                 |
| Styling     | CSS custom properties, Geist Sans and Mono     | Responsive editorial system without a component framework |
| Motion      | GSAP, ScrollTrigger, Lenis, Canvas 2D          | Capability-gated progressive enhancement                  |
| Data        | Typed modules under `data/`                    | One source for profile, work, skills and credentials      |
| Quality     | ESLint, Prettier, TypeScript, custom contracts | Static, performance, SEO and deployment checks            |
| Runtime     | Node.js 22 Alpine, Docker                      | Minimal standalone production image                       |
| Delivery    | GitHub, Coolify, Traefik, Cloudflare Tunnel    | Build, health checking, routing and public TLS            |

## Features

- Architecture-led project case studies with source and live links only where a verified destination exists.
- Interactive seven-layer capability map covering networks, security, systems, cloud, automation, observability and self-hosting.
- Server-rendered professional record, education, certification and public contact channels.
- Read-only system-status boundary with disconnected, live and unavailable states.
- Generated Open Graph, Twitter/X, browser and Apple assets.
- Person, WebSite, ProfilePage and selected-work structured data.
- Custom crawl directives, sitemap, manifest, 404 page and health endpoint.
- Responsive 12/8/4-column layout with keyboard, reduced-motion and persistent system/light/dark theme support.

## Design philosophy

The interface borrows its visual language from diagrams, runbooks and network maps rather than dashboard templates. Typography carries the hierarchy; lines, grids and status colour provide structure. Motion is optional and never required to understand content or complete a task.

Three rules guide the implementation:

1. Publish evidence, not unsupported claims.
2. Keep the static reading experience complete before client enhancement.
3. Treat deployment, failure and recovery as part of the product.

## Folder structure

```text
app/                    App Router pages, metadata routes, APIs and global CSS
components/             UI grouped by portfolio section
data/                   Typed public content and topology definitions
lib/                    SEO, generated-image and server-status utilities
public/images/          Optimized release assets only
scripts/                Performance, SEO and deployment contract checks
docs/                   Audit records and operating documentation
.github/workflows/      Pull-request and main-branch quality gates
Dockerfile              Multi-stage standalone production image
```

Local source portraits in `myphotos/` are intentionally ignored. They are reference material, not deployable assets.

## Performance

The home route is static-first and isolates client boundaries to four focused components. Motion libraries are dynamically imported after hydration unless the visitor requests reduced motion or the device reports a low-power or data-saving constraint. Touch and mobile clients retain motion support, while the semantic route map remains available as the fallback. The `?motion=full` diagnostic override works in both local and production builds.

Canvas rendering is capped at 30 FPS and 1.5 device-pixel ratio, and pauses outside the viewport. Status polling starts only near the status section and stops while it is out of view. Repository budgets cover compressed HTML, JavaScript, CSS and public images.

Run the budget after a production build:

```bash
npm run build
npm run performance:check
```

The recorded baseline and budget rationale are in [docs/PERFORMANCE.md](./docs/PERFORMANCE.md).

## Accessibility

- Semantic landmarks and a single ordered heading hierarchy.
- Skip link and programmatic main-content focus target.
- Keyboard-operable navigation, capability controls and external links.
- Mobile-menu focus containment, Escape handling, focus restoration and inert background content.
- Keyboard-operable system/light/dark theme control with pre-paint initialization.
- Visible two-pixel focus indicators.
- `prefers-reduced-motion` support plus static SVG fallbacks.
- Polite, atomic announcements for status changes.
- Explicit context for links that open a new tab.

The manual and automated verification record is in [docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md). The production viewport, theme and motion matrix is in [docs/VISUAL_REGRESSION.md](./docs/VISUAL_REGRESSION.md).

## SEO

The canonical site identity is supplied through `NEXT_PUBLIC_SITE_URL`. Metadata, social cards, structured data, robots, sitemap and manifest are generated from the same profile data used by the page.

```bash
npm run build
npm run seo:check
```

See [docs/SEO.md](./docs/SEO.md) for the enforced contract and production verification steps.

## Security

- Server-only monitoring adapter and token.
- Production HTTPS requirement for the upstream monitoring URL.
- CSP, clickjacking, content-type, referrer, permissions and cross-origin isolation headers.
- No database, authentication state, browser storage or write-capable endpoint.
- Non-root container runtime and deterministic dependency installation.
- Environment files ignored by Git; public values are explicitly prefixed with `NEXT_PUBLIC_`.

Cloudflare owns public TLS and HSTS. The application intentionally does not add HSTS to local HTTP responses. The CSP currently permits inline script and style execution required by the framework output; replacing that with request nonces would force dynamic rendering and is tracked as a future hardening option rather than hidden as completed work.

Report security concerns through [SECURITY.md](./SECURITY.md).

## Environment variables

Copy `.env.example` to `.env.local` for local overrides. Never commit the resulting file.

| Variable                   | Scope          | Required    | Default / example                          |
| -------------------------- | -------------- | ----------- | ------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`     | Build          | Production  | `https://rahulsinghparmar.site`            |
| `NEXT_PUBLIC_SITE_VERSION` | Build          | Production  | `v1.0.0`                                   |
| `SYSTEM_STATUS_SOURCE`     | Runtime        | Yes         | `disabled`; use `http` to connect a source |
| `SYSTEM_STATUS_URL`        | Runtime        | With `http` | HTTPS JSON endpoint                        |
| `SYSTEM_STATUS_TOKEN`      | Runtime secret | No          | Bearer token, if required                  |
| `SYSTEM_STATUS_TIMEOUT_MS` | Runtime        | No          | `3500`, constrained to 1000–8000 ms        |

Public variables are frozen during `next build`; changing them requires a rebuild.

## Development workflow

Node.js 22 is recommended; `package.json` permits Node.js 20.9 or newer.

```bash
git clone https://github.com/RahulSinghParmar/Portfolio.git
cd Portfolio
npm ci
npm run dev
```

Open `http://localhost:3000`. Local overrides are optional; on PowerShell, copy the example with `Copy-Item .env.example .env.local`. Update public content in `data/` rather than duplicating copy inside components.

Before opening a pull request:

```bash
npm run quality:check
```

The workflow and contribution standards are documented in [CONTRIBUTING.md](./CONTRIBUTING.md).

## Build commands

| Command                             | Purpose                                          |
| ----------------------------------- | ------------------------------------------------ |
| `npm run dev`                       | Start the local development server               |
| `npm run build`                     | Create a self-contained standalone output        |
| `npm start`                         | Run the supported standalone server on port 3000 |
| `npm run format`                    | Format repository text files                     |
| `npm run format:check`              | Verify formatting without writes                 |
| `npm run lint`                      | Run ESLint with zero warnings allowed            |
| `npm run typecheck`                 | Run TypeScript without emitting files            |
| `npm run performance:check`         | Enforce route asset budgets                      |
| `npm run seo:check`                 | Verify prerendered metadata and crawl contracts  |
| `npm run deployment:check -- <url>` | Smoke-test a running deployment                  |
| `npm run quality:check`             | Run the complete static and build gate           |

## Docker usage

```bash
docker build --pull --tag rahul-portfolio:1.0.0 .
docker run --rm --detach \
  --name rahul-portfolio \
  --publish 127.0.0.1:3100:3000 \
  rahul-portfolio:1.0.0
npm run deployment:check -- http://localhost:3100
docker stop rahul-portfolio
```

The runtime image listens on port `3000`, runs as UID/GID `1001`, and checks `/api/health` without depending on the optional status provider.

## Coolify setup

1. Create an application from this repository and select the root `Dockerfile`.
2. Set the container port to `3000` and health path to `/api/health`.
3. Add `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_SITE_VERSION` as build variables.
4. Add status variables at runtime; mask `SYSTEM_STATUS_TOKEN`.
5. Configure the Coolify domain as `http://rahulsinghparmar.site` so Traefik owns the HTTP origin route.
6. Point the Cloudflare Tunnel hostname to the existing Traefik origin at `http://localhost:80`.
7. Keep automatic deployment disabled until the first manual release passes the external deployment contract.

Detailed setup, verification and rollback instructions are in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md). Coolify's generated names, deployment lifecycle and cleanup policy are explained in [docs/COOLIFY_OPERATIONS.md](./docs/COOLIFY_OPERATIONS.md).

## Deployment

The GitHub workflow validates pull requests and pushes to `main` with the static/build contract, a production-server smoke test and a Docker build. Provider-side deployment remains an explicit operator action.

For a release candidate:

1. Run `npm ci` from the committed lockfile.
2. Run `npm run quality:check`.
3. Build and smoke-test the Docker image.
4. Deploy the exact reviewed commit to Coolify.
5. Run `npm run deployment:check -- https://rahulsinghparmar.site` from outside the host.
6. Confirm container health, Cloudflare routing and application/proxy logs.

## Release process

1. Update `package.json`, `NEXT_PUBLIC_SITE_VERSION` examples and `CHANGELOG.md`.
2. Create a release-candidate branch or pull request from a clean working tree.
3. Require the GitHub quality workflow to pass.
4. Deploy and verify the candidate without changing its contents in place.
5. Tag the accepted commit as `vMAJOR.MINOR.PATCH` and publish GitHub release notes from the matching changelog entry.
6. Roll back to the previous known-good commit if the external release gate fails.

## Versioning strategy

The project follows Semantic Versioning:

- `MAJOR`: incompatible architecture, deployment or public content-contract change.
- `MINOR`: backward-compatible section, capability or integration addition.
- `PATCH`: copy, accessibility, security, performance or visual correction without a public contract change.

The first production release is `v1.0.0`.

## Future roadmap

The release candidate deliberately excludes speculative features. Future work should be driven by verified content or operational evidence:

- Connect the read-only status adapter when a safe public telemetry contract exists.
- Replace qualitative project outcomes with measured reliability or recovery data.
- Add infrastructure, security or cloud credentials when verified public records are available.
- Add an authentic high-resolution portrait only after source quality and publication rights are confirmed.
- Evaluate nonce-based CSP if the security benefit justifies dynamic rendering and cache impact.

Open content decisions are tracked in [CONTENT_TODO.md](./CONTENT_TODO.md).

## License

Released under the [MIT License](./LICENSE). Portfolio copy, personal photographs and personal identity remain attributable to Rahul Singh Parmar even where the surrounding source code is reusable under MIT.
