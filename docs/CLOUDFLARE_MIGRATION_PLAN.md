# Portfolio hosting migration: Phases 23–30

Status: Phases 23–27 complete; Phase 28 hosted-preview acceptance is in progress.

Prepared: 7 September 2026. Repository baseline inspected: `25467d9` (`v1.0.0`).
Target: Next.js static export plus a small API Worker, deployed together using Cloudflare Workers Static Assets. GitHub remains the source of truth.

## Intended outcome

The public portfolio loads independently of the home PC, Docker, Coolify and the home internet connection. Existing appearance, motion, themes, content and interactions remain. Homelab availability is optional information displayed within the website; failure of its status source cannot replace the portfolio with a maintenance page.

Cloudflare still supplies hosting infrastructure and has service limits. This removes the home server from the portfolio delivery path; it does not promise zero downtime.

## Evidence and migration implications

| Current evidence                                                                  | Required treatment                                                                                                              |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Next.js 16.3.3 with `output: standalone`                                          | Produce an `out/` static export using the installed version's documentation.                                                    |
| Existing build pre-renders homepage and metadata assets                           | Preserve generation and verify the exported paths and MIME types.                                                               |
| `/api/health` is dynamic and reports `process.uptime()`                           | Replace with an edge API health contract; do not invent persistent process uptime. Test homepage delivery separately.           |
| `/api/system-status` is dynamic                                                   | Move the adapter into the API Worker, retaining its public response contract.                                                   |
| `lib/system-status.ts` uses `server-only` and environment variables               | Separate shared public types from Worker implementation; use Worker environment bindings for configuration and secrets.         |
| Status source defaults to disabled in `.env.example`                              | Verify actual deployment configuration separately. An adapter is not proof of a connected monitor.                              |
| Client fetches `/api/system-status`                                               | Keep the same-origin path and ensure status failures affect only this component.                                                |
| Security headers are supplied by Next.js                                          | Supply static headers through `_headers` and API headers through Worker responses.                                              |
| `postbuild`, performance checks and CI assume `.next/standalone`                  | Change them to validate the actual export and local Worker runtime.                                                             |
| Site topology and delivery diagram name Coolify as the portfolio host             | Update factual hosting labels and accessible descriptions within the existing layout. Preserve historical project descriptions. |
| Contact uses mailto; Hashnode is linked; no website Spotify API integration found | Preserve links. Spotify/blog ingestion are separate future work, not migration requirements.                                    |
| Existing maintenance Worker intercepts portfolio apex and wildcard routes         | Audit and remove or exclude overlapping routes during cutover; preserve homelab behavior.                                       |

The existing static export has not been built or tested. Compatibility is supported by inspection, not yet proven by execution.

## Target architecture

```text
GitHub reviewed commit
  -> locked dependency install -> validation -> static export + Worker bundle
  -> Cloudflare deployment

Visitor -> rahulsinghparmar.site
  /, images, CSS, JS, metadata -> Cloudflare static assets
  /api/system-status         -> API Worker -> optional monitoring source
  /api/health                -> API Worker health/version

Home Docker/Coolify services -> independently hosted homelab
```

Prefer one portfolio Worker project with assets and API code. Invoke Worker code first only for `/api/*`; do not make every asset request execute application code. Use genuine static 404 handling, not an index-page response with status 200 for every unknown URL. Keep API errors as JSON, including unknown API paths and unsupported methods.

No database, KV, R2, persistent volume or paid subscription is required by the current portfolio functionality. Add none unless a concrete requirement emerges. Existing monitoring systems may have their own storage. Keep secrets outside source code, browser bundles, generated files and logs.

Preserve the current Docker source and deployment through the existing `v1.0.0` tag and record the actual deployed image/version. Prefer a single production build path after migration rather than maintaining two diverging application implementations.

## Phase 23 — Baseline and migration contract

Work:

- Verify repository status, existing tag, current runtime, deployment identity and provider route state. Record discrepancies instead of assuming earlier checks remain current.
- Create an isolated migration branch using the repository's branch conventions.
- Capture the working design baseline, route inventory, API behavior and current quality/performance results.
- Identify the real read-only status source and whether it can be reached from Cloudflare. Do not expose a private homelab service merely to make it reachable.
- Record the Docker rollback reference and create a migration progress report.

Exit: every feature has a destination, known pre-existing failures are recorded, and rollback references resolve. Production remains unchanged.

Prompt:

> Start Phase 23 using docs/CLOUDFLARE_MIGRATION_PLAN.md. Establish the baseline and migration contract, create an isolated branch, and record evidence and rollback references. Complete this phase only; do not deploy or alter public routing.

## Phase 24 — Static portfolio build

Work:

- Switch the migration build to static export and replace standalone preparation scripts.
- Move dynamic handlers outside Next's export route tree, preserving their source for Phase 25. Clearly record the temporary API gap.
- Preserve browser interactions, GSAP/Lenis motion, theme initialization, navigation and accessibility.
- Verify metadata generation; if extensionless generated images are served incorrectly, emit named static image files and update references.
- Adapt performance and SEO checks to exported files without relaxing existing budgets merely to pass.

Exit: a reproducible export renders all portfolio content and assets locally without a running Next.js server. API parity is explicitly deferred to Phase 25.

Prompt:

> Start Phase 24 using docs/CLOUDFLARE_MIGRATION_PLAN.md after verifying Phase 23 evidence. Build the static export and validate content, metadata, assets, themes and motion locally. Preserve the current design. Do not publish or change DNS.

## Phase 25 — API Worker and failure isolation

Work:

- Port system-status normalization, configuration and optional authorization to the Worker; retain shared response types.
- Preserve disabled, operational, degraded, unavailable and malformed-source behavior. Do not fabricate live readings.
- Restrict upstream requests to the configured endpoint. Do not accept arbitrary URLs from visitors. Bound timeouts, payload size and redirects, especially when sending credentials.
- Return no-store JSON and safe error messages. Handle GET, HEAD, unknown API paths and unsupported methods deliberately.
- Replace Node process uptime with an honest edge health/version response.
- Keep browser polling bounded and suspended when the page is hidden; avoid overlapping requests.
- Test adapter behavior and verify the page still works when the status source fails.

Exit: existing live-status UI works against a local Worker; no backend credential or raw private response reaches the browser. A disconnected source is reported truthfully.

Prompt:

> Start Phase 25 using docs/CLOUDFLARE_MIGRATION_PLAN.md. Implement the API Worker with the existing status contract, honest health semantics, protected credentials and bounded upstream requests. Test failure isolation locally. Do not deploy.

## Phase 26 — Cloudflare packaging, routing and headers

Work:

- Add a pinned Wrangler development dependency and checked-in configuration for the static output and API entrypoint.
- Configure selective `/api/*` Worker routing and genuine static 404 responses; verify navigation requests as well as fetch requests.
- Port security headers and confirm fonts, scripts and images remain compatible with CSP.
- Define separate preview and production configuration with preview noindex behavior that cannot leak into production.
- Define caching by asset type. Avoid blanket immutable caching of HTML or unversioned assets; preserve API no-store behavior.
- Supply one documented local command to run the built site and API together through Wrangler.
- Update only hosting-related labels and diagram descriptions to reflect the new architecture.

Exit: the complete build runs locally under the deployment runtime with correct routes, headers, status codes and content types.

Prompt:

> Start Phase 26 using docs/CLOUDFLARE_MIGRATION_PLAN.md. Package the export and API for Cloudflare Workers Static Assets, configure routing and headers, and provide a working local preview command. Update factual hosting labels without redesigning the site. Do not publish.

## Phase 27 — Release validation and deployment workflow

Work:

- Update quality, performance, SEO and deployment checks to exercise the new build and runtime.
- Verify keyboard navigation, reduced motion, themes and motion on desktop and mobile viewports. Separate emulation evidence from real device testing.
- Test missing pages, metadata images, HEAD requests, status-source failures and delayed responses.
- Validate asset file counts and sizes, Worker bundle limits and dependency compatibility against the current plan.
- Choose one deployment owner: GitHub Actions is recommended to enforce validation before deployment; do not also enable duplicate automatic deployment through Workers Builds.
- Prepare preview deployment and controlled production promotion with minimal permissions and protected deployment credentials. Do not create credentials or activate publishing in this local phase.
- Update README and operating instructions for local development, preview, release and rollback.

Exit: checks pass against the export and Worker, and the workflow cannot publish a failed candidate. Mark account-dependent settings separately.

Prompt:

> Start Phase 27 using docs/CLOUDFLARE_MIGRATION_PLAN.md. Complete release validation, update CI and deployment checks, and prepare one controlled deployment workflow with operating documentation. Do not activate external deployment or change the live domain.

## Phase 28 — Hosted preview and acceptance

Work:

- Verify account access and existing Worker names before creating a separate portfolio deployment. Never overwrite the maintenance Worker.
- Commit and push the reviewed migration candidate using RahulSinghParmar's verified Git identity. Configure the chosen deployment workflow and necessary scoped credentials through supported account flows.
- Deploy the exact candidate to an isolated preview address. Prevent accidental indexing; keep production routing unchanged.
- Run remote header, route, asset, API and browser checks against the preview.
- Test upstream failure using preview-specific configuration; do not stop unrelated homelab services.
- Obtain the user's real device review and record anything that cannot be tested automatically.

Exit: a hosted preview is inspectable and accepted, the exact source SHA and deployment version are recorded, and rollback instructions are concrete.

Prompt:

> Start Phase 28 using docs/CLOUDFLARE_MIGRATION_PLAN.md. Publish the validated candidate to an isolated Cloudflare preview, configure the selected deployment workflow, and run remote acceptance checks. Use my verified Git identity. Keep production DNS and maintenance routing unchanged and provide the preview for my device review.

## Phase 29 — Production domain cutover

Work:

- Reconfirm preview acceptance, release readiness and rollback references immediately before cutover. The original end-of-month launch preference remains relevant; explicitly starting this cutover phase authorizes launch at that time.
- Export or record current web DNS, redirects and Worker routes without storing credentials.
- Document exact apex/www changes before applying them. Replace the portfolio tunnel bindings with the new hosting bindings; retain Cloudflare nameservers and all non-web DNS records.
- Remove or exclude portfolio routes from the maintenance Worker wherever they would intercept the new origin. Preserve `*.parmar.homes/*`. Review wildcard Worker-managed DNS separately; do not delete it blindly.
- Preserve HTTPS and the www-to-apex redirect, including path/query behavior. Confirm certificate readiness and absence of redirect loops.
- Validate homepage, deep links, real 404s, images, APIs, CSP, robots, sitemap and canonical URLs on the production domain.
- Prove public delivery works while the portfolio Docker container is stopped. Do not stop the full Docker host to test this.

Exit: the public portfolio is served from Cloudflare independently of the home server, with a tested or explicitly documented rollback procedure and no maintenance interception.

Prompt:

> Start Phase 29 using docs/CLOUDFLARE_MIGRATION_PLAN.md after confirming preview acceptance. Perform the documented production cutover to Cloudflare Static Assets, preserve www redirects and unrelated services, correct overlapping maintenance routes, and verify the public portfolio with its Docker container stopped. Record every routing change and rollback step.

## Phase 30 — Stabilization, release and operating handoff

Work:

- Inspect production after cutover and after an agreed observation interval. Use a supported scheduled follow-up if requested; never claim an observation window has passed when it has not.
- Verify one subsequent preview/change workflow and retain the prior Cloudflare version for rollback.
- Confirm current versioning history before choosing a release number; `v1.1.0` is provisional, with API health-contract changes documented.
- Publish the release under the verified Git identity after acceptance. Preserve existing tags and history.
- Disable obsolete portfolio auto-deploy triggers. Keep the old portfolio container stopped as a rollback reference until the retention decision; do not delete images, volumes or Coolify services automatically.
- Finalize instructions for editing content, local preview, publishing, rollback, secret management and debugging the status widget.

Exit: release evidence, a reliable update workflow, truthful outstanding items and a clear operator handoff. No unnecessary duplicate publishing jobs remain active.

Prompt:

> Start Phase 30 using docs/CLOUDFLARE_MIGRATION_PLAN.md. Complete stabilization and release handoff, validate the future update and rollback workflow, publish the agreed version after checks pass, and disable obsolete portfolio auto-deploy triggers. Preserve the previous Docker release and unrelated homelab services. Report any observation interval still outstanding.

## Progress and continuation rules

Phases 23–26 are complete. On each remaining implementation phase, update the single `docs/CLOUDFLARE_MIGRATION_STATUS.md` report with status, changed files, exact commands and results, source SHA, provider versions where applicable, unresolved items, and the next safe action. The Phase 23 baseline is in `docs/CLOUDFLARE_MIGRATION_BASELINE.md`.

Do not mark a phase complete solely because code was written. Clearly distinguish local checks, hosted checks, account-dependent configuration and real device acceptance. On a usage interruption, resume from that report and repository state rather than restarting or trusting old results automatically.

Planned command roles (final command names must be implemented and verified before being advertised as runnable): `npm run dev` for UI development; `npm run build` for the static artifact; a local Wrangler preview command for the complete site/API; quality and deployment checks; controlled preview and production deployment commands. Do not use `next dev` alone as release evidence.

## References

- Next.js static export: https://nextjs.org/docs/app/guides/static-exports
- Workers static assets: https://developers.cloudflare.com/workers/static-assets/
- Static routing and genuine 404s: https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/
- Worker routing: https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
- Asset headers: https://developers.cloudflare.com/workers/static-assets/headers/
- Static asset billing and limits: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- Git integration alternative: https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/

Recheck provider documentation during implementation; this plan is not a substitute for validating the actual export and deployed behavior.
