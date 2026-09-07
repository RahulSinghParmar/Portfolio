# Rahul Singh Parmar — Engineering Portfolio

Production portfolio for Rahul Singh Parmar, a DCO Tech 3 working across data-center operations, network reliability, systems, security, AWS, homelab engineering and practical automation.

- Public site: [rahulsinghparmar.site](https://rahulsinghparmar.site)
- Current release: `v1.0.0`
- Migration target: Cloudflare Workers Static Assets with an API Worker
- Runtime requirement: Node.js 22+

## Project overview

This repository presents infrastructure work as operational case studies: what a system does, where it can fail, which controls protect it and how recovery is observed. The portfolio is a static Next.js export. Only the health and optional system-status endpoints execute in a small Cloudflare Worker.

The application has no database, authentication flow, write-capable API or persistent storage. A monitoring outage is isolated to the status panel; it cannot take down the portfolio.

## Architecture

```text
GitHub reviewed commit
  └─ locked install → quality gate → static export + Worker dry-run
       └─ manual GitHub Actions promotion
            └─ Cloudflare Worker project
                 ├─ static assets: HTML, CSS, JS, images, metadata
                 └─ /api/*: health and optional normalized system status

Optional monitoring source ──read-only HTTPS──> API Worker
Home Docker/Coolify environment ───────────────> independent homelab
```

GitHub Actions is the intended deployment owner. Cloudflare Workers Builds must remain disabled to prevent two systems from publishing the same project.

## Technology stack

| Layer           | Technology                                                 | Purpose                                                   |
| --------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| Application     | Next.js 16, React 19, TypeScript                           | Static App Router output and typed UI                     |
| Styling         | CSS custom properties, Geist Sans and Mono                 | Responsive editorial system without a component framework |
| Motion          | GSAP, ScrollTrigger, Lenis, Canvas 2D                      | Capability-gated progressive enhancement                  |
| Data            | Typed modules under `data/`                                | One source for profile, work, skills and credentials      |
| Edge runtime    | Cloudflare Workers Static Assets                           | Global static delivery and selective `/api/*` execution   |
| Quality         | ESLint, Prettier, TypeScript, Node tests, custom contracts | Build, API, performance, SEO and deployment validation    |
| Release control | GitHub Actions environments                                | Manual preview and protected production promotion         |

## Features

- Architecture-led project case studies with verified source and live links.
- Interactive capability map for networks, security, systems, cloud, automation, observability and self-hosting.
- Static professional record, education, certifications and contact channels.
- Read-only status boundary with disconnected, live and unavailable states.
- Generated Open Graph, Twitter/X, browser and Apple assets with deterministic `.png` names.
- Person, WebSite, ProfilePage and selected-work structured data.
- Real HTML 404s, crawl directives, sitemap, manifest and an honest edge health endpoint.
- Keyboard, reduced-motion, persistent system/light/dark themes and responsive 12/8/4-column layouts.

## Design philosophy

The visual language comes from diagrams, runbooks and network maps. Typography carries the hierarchy; lines, grids and status color provide structure. Motion is optional and never required to navigate or understand the page.

Three implementation rules:

1. Publish evidence, not unsupported claims.
2. Keep the static reading experience complete before client enhancement.
3. Treat deployment, failure isolation and recovery as product behavior.

## Folder structure

```text
app/                    Static App Router pages, metadata routes and global CSS
components/             UI grouped by portfolio section
data/                   Typed public content and topology definitions
lib/                    Browser-safe contracts and SEO utilities
worker/                 Cloudflare API entrypoint, security policy and tests
public/                 Optimized assets and Cloudflare _headers policy
scripts/                Export, package, performance, SEO and runtime checks
docs/                   Audit records and operating documentation
.github/workflows/      Quality gate and manual deployment workflow
wrangler.jsonc          Local, preview and production Worker configuration
Dockerfile              Preserved v1.0.0 rollback packaging
```

Source portraits under `myphotos/` are intentionally ignored. They are reference material, not release assets.

## Development workflow

```bash
git clone https://github.com/RahulSinghParmar/Portfolio.git
cd Portfolio
npm ci
npm run dev
```

Open `http://localhost:3000`. Update public copy in `data/` rather than duplicating it in components. `next dev` is useful for editing, but it is not release evidence.

Before a pull request:

```bash
npm run release:check
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for change standards.

## Build and validation commands

| Command                             | Purpose                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`                       | Start the editing server                                                |
| `npm run build`                     | Produce the static `out/` artifact                                      |
| `npm start`                         | Preview the export and API contract through the dependency-free adapter |
| `npm run preview:cloudflare`        | Build and run the complete site through local Wrangler on port 8788     |
| `npm run quality:check`             | Format, lint, type, Worker tests, export, performance and SEO           |
| `npm run cloudflare:check`          | Build, dry-run package and enforce Cloudflare artifact limits           |
| `npm run release:check`             | Run the full quality and Cloudflare package gate                        |
| `npm run deployment:check -- <url>` | Verify a running Cloudflare-compatible deployment                       |

## Performance

Motion libraries load after hydration only when device and user preferences allow them. Canvas work is capped at 30 FPS and 1.5 device-pixel ratio and pauses outside the viewport. Status polling begins only near its section, stops when hidden or out of view, and prevents overlapping requests.

The repository rejects releases that exceed its HTML, JavaScript, CSS, image, static-output, file-count or Worker-bundle budgets. These release guardrails are intentionally tighter than the provider maximums. See [docs/PERFORMANCE.md](./docs/PERFORMANCE.md).

## Accessibility

- Semantic landmarks, ordered headings, skip link and main-content focus target.
- Keyboard-operable navigation, theme and capability controls.
- Mobile-menu focus containment, Escape handling, restoration and inert background content.
- Visible focus indicators and static fallbacks for reduced motion.
- Polite, atomic status announcements and explicit new-tab context.

The verification records are in [docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md) and [docs/VISUAL_REGRESSION.md](./docs/VISUAL_REGRESSION.md). Browser emulation is recorded separately from physical-device acceptance.

## SEO

`NEXT_PUBLIC_SITE_URL` supplies one canonical identity for metadata, named social cards, structured data, robots, sitemap and manifest. Hosted previews must return `X-Robots-Tag: noindex, nofollow`; production must not. The deployment contract checks both states. See [docs/SEO.md](./docs/SEO.md).

## Security

- Static and API responses receive matching CSP, clickjacking, MIME, referrer, permissions and cross-origin controls.
- API responses are `no-store`; fingerprinted assets alone receive immutable caching.
- The optional upstream URL is a fixed Worker binding, must use HTTPS and cannot redirect.
- Payloads, timeouts and published fields are bounded; credentials remain Worker secrets.
- Environment files, Wrangler local state and source portraits are ignored by Git.
- CI actions and Wrangler are pinned; the deployment workflow has read-only repository permissions.

The CSP permits framework-required inline script and style execution. Adding nonces would require dynamic rendering and is not misrepresented as completed hardening. Report concerns through [SECURITY.md](./SECURITY.md).

## Environment variables

Build-time public values may be placed in `.env.local`. Worker runtime values belong in `.dev.vars` locally and Cloudflare bindings/secrets when hosted. Never commit either file.

| Variable                   | Scope          | Required    | Default / purpose                                  |
| -------------------------- | -------------- | ----------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | Build          | Production  | `https://rahulsinghparmar.site`                    |
| `NEXT_PUBLIC_SITE_VERSION` | Build          | Production  | Release identity                                   |
| `DEPLOYMENT_ENV`           | Worker binding | Yes         | `local`, `preview` or `production`                 |
| `SITE_VERSION`             | Worker binding | Yes         | Public edge release identity                       |
| `SYSTEM_STATUS_SOURCE`     | Worker binding | Yes         | `disabled`; use `http` only for an approved source |
| `SYSTEM_STATUS_URL`        | Worker binding | With `http` | Exact HTTPS JSON endpoint                          |
| `SYSTEM_STATUS_TOKEN`      | Worker secret  | No          | Optional bearer credential                         |
| `SYSTEM_STATUS_TIMEOUT_MS` | Worker binding | No          | `3500`, constrained to 1000–8000 ms                |

See [.env.example](./.env.example), [.dev.vars.example](./.dev.vars.example) and [docs/CLOUDFLARE_LOCAL_PREVIEW.md](./docs/CLOUDFLARE_LOCAL_PREVIEW.md).

## Deployment

Deployment is intentionally manual. The `Deploy Cloudflare portfolio` workflow accepts `preview` or `production` and requires the full reviewed commit SHA. It always rebuilds and reruns `release:check` before publishing. Production additionally requires:

- the workflow to run from `main`;
- repository variable `PRODUCTION_DEPLOYMENT_ENABLED=true`;
- approval through the `cloudflare-production` GitHub environment.

Until Phase 29 cutover approval, keep that variable absent or `false`, leave the production Worker without a custom-domain route, and do not alter DNS or the maintenance Worker. Follow [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for account setup, preview promotion, production promotion and verification.

## Docker and Coolify rollback

The Dockerfile and existing Coolify v1.0.0 deployment are retained as rollback artifacts during migration. They are not the new build or CI path. Do not resume, rebuild, delete or repoint the old service as part of routine Cloudflare releases. Its operating record remains in [docs/COOLIFY_OPERATIONS.md](./docs/COOLIFY_OPERATIONS.md).

## Release and rollback

1. Review and commit a clean candidate.
2. Require `Release quality` to pass.
3. Manually deploy the exact SHA to `cloudflare-preview`.
4. Run the deployment contract and complete hosted browser/device acceptance.
5. Promote the same accepted commit to the protected production environment only during the approved cutover.
6. If validation fails, use Cloudflare version rollback and restore the recorded routing state; do not patch a failed artifact in place.

The operational migration sequence is tracked in [docs/CLOUDFLARE_MIGRATION_PLAN.md](./docs/CLOUDFLARE_MIGRATION_PLAN.md) and [docs/CLOUDFLARE_MIGRATION_STATUS.md](./docs/CLOUDFLARE_MIGRATION_STATUS.md).

## Versioning strategy

The project follows Semantic Versioning. `MAJOR` covers incompatible architecture or public contracts; `MINOR` covers backward-compatible capabilities; `PATCH` covers corrections without a contract change. The next release number remains provisional until Phase 30 verifies history and production acceptance.

## Future roadmap

- Connect the status adapter only when a safe public telemetry contract exists.
- Replace qualitative outcomes with measured reliability evidence as it becomes available.
- Evaluate nonce-based CSP only if its benefit justifies dynamic rendering and cache cost.

Content decisions remain in [CONTENT_TODO.md](./CONTENT_TODO.md).

## License

Released under the [MIT License](./LICENSE). Portfolio copy, personal photographs and personal identity remain attributable to Rahul Singh Parmar where the surrounding source is reusable under MIT.
