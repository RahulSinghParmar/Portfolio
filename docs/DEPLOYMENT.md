# Cloudflare deployment operations

This runbook covers the target release path: GitHub Actions builds a Next.js static export and API Worker, validates the exact candidate, and manually promotes it to Cloudflare Workers Static Assets. It does not authorize production cutover, DNS changes or maintenance-Worker changes.

## Ownership and trust boundaries

| Concern                           | Owner                                         |
| --------------------------------- | --------------------------------------------- |
| Source and reviewed SHA           | GitHub repository                             |
| Release validation                | `.github/workflows/quality.yml`               |
| Preview/production promotion      | `.github/workflows/deploy-cloudflare.yml`     |
| Static files and `/api/*`         | One Cloudflare Worker project per environment |
| DNS, custom domains and redirects | Manual Phase 29 operator action               |
| Homelab delivery                  | Independent of portfolio hosting              |
| Docker/Coolify v1.0.0             | Rollback reference only                       |

GitHub Actions must be the only automated deployment owner. Keep Cloudflare Workers Builds disconnected or disabled for these Worker projects; otherwise a Git push could publish outside the reviewed workflow.

## Account setup — manual and not yet performed

Create two GitHub deployment environments:

1. `cloudflare-preview`
2. `cloudflare-production`

Add these environment secrets to each environment, using separate least-privilege tokens where practical:

| Secret                  | Value                                                      |
| ----------------------- | ---------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID containing the Worker projects                  |
| `CLOUDFLARE_API_TOKEN`  | Token scoped to this account and required Worker resources |

Use Cloudflare's **Edit Cloudflare Workers** token template as the starting point, restrict account and zone resources to Rahul's account and `rahulsinghparmar.site`, then remove permissions the workflow does not use. Do not grant DNS write access to CI. A production custom-domain route may require Workers Routes permission when that binding is added in Phase 29; DNS remains a separate manual action.

Protect `cloudflare-production` with required reviewer approval and restrict deployments to `main`. Disable self-approval where the account plan supports it.

Create repository variable `PRODUCTION_DEPLOYMENT_ENABLED` with value `false`, or leave it absent. Change it to `true` only for the approved Phase 29 cutover window and return it to `false` afterward.

Do not create or paste tokens into the repository, issue comments, workflow inputs, logs, `.env*`, `.dev.vars.example` or documentation.

## Local validation

Use Node.js 22 or later:

```powershell
npm ci
npm run release:check
npm run preview:cloudflare
```

In a second terminal:

```powershell
npm run deployment:check -- http://127.0.0.1:8788
```

`release:check` verifies formatting, lint, TypeScript, Worker tests, static export, performance, SEO, a Wrangler preview dry-run, static file count and size, Worker bundle size, header rules and pinned runtime versions. `deployment:check` verifies the live asset/API contract, including real 404s, HEAD, named metadata images, cache policy and security headers.

## Pull-request gate

The `Release quality` workflow runs on pull requests, `main` pushes and manual dispatch. It installs the exact lockfile on Node.js 22, runs `release:check`, starts the built site through local Wrangler and exercises the deployment contract.

There is no container-build job in the target path. The Docker image remains a historical rollback artifact and should not consume CI time for every Cloudflare candidate.

## Preview promotion

Phase 28 owns the first hosted preview. After committing the candidate and obtaining a passing quality workflow:

1. Open **Actions → Deploy Cloudflare portfolio → Run workflow**.
2. Select the reviewed branch and choose `preview`.
3. Paste the full 40-character commit SHA into `confirmed_sha`.
4. Review and approve the `cloudflare-preview` environment if configured.
5. Record the deployed Worker version and hosted URL from the workflow output.
6. Run:

   ```powershell
   $env:DEPLOYMENT_EXPECTED_ENV = "preview"
   npm run deployment:check -- https://<preview-hostname>
   Remove-Item Env:DEPLOYMENT_EXPECTED_ENV
   ```

7. Complete the Phase 28 browser and real-device checklist before considering production.

The workflow refuses a SHA mismatch. It validates without deployment credentials first, then the environment-gated job installs, rebuilds and revalidates the same SHA before invoking Wrangler.

## Production promotion

Production is deliberately blocked until Phase 29:

1. Confirm the accepted preview SHA is on `main`.
2. Complete the DNS, redirect, certificate and maintenance-route preflight.
3. Set `PRODUCTION_DEPLOYMENT_ENABLED=true` for the cutover window.
4. Manually dispatch from `main`, choose `production`, and enter the exact full SHA.
5. A required reviewer approves `cloudflare-production` after checking the SHA and cutover record.
6. Apply the separately reviewed custom-domain/routing changes.
7. Run the production contract with `DEPLOYMENT_EXPECTED_ENV=production` and complete external checks.
8. Return `PRODUCTION_DEPLOYMENT_ENABLED` to `false`.

The current `wrangler.jsonc` intentionally contains no production custom-domain route. A workflow run before Phase 29 can upload a production Worker version, but it cannot take over the public domain.

## Runtime contract

- Static requests are served from `out/` without executing Worker code.
- `/api` and `/api/*` execute Worker code first.
- `/api/health` reports request-time edge health and version, not process uptime.
- `/api/system-status` is disabled until an approved public read-only source exists.
- API responses are JSON and `no-store`.
- Unknown documents return the exported 404 page with HTTP 404.
- Preview responses are `noindex, nofollow`; the production apex is indexable.

## Optional status source

Keep the source disabled unless an approved HTTPS endpoint and public field contract exist. Non-secret values are Worker bindings in `wrangler.jsonc`; the token must be created separately per environment:

```powershell
npx wrangler secret put SYSTEM_STATUS_TOKEN --env preview
npx wrangler secret put SYSTEM_STATUS_TOKEN --env production
```

These commands mutate Cloudflare account state and are not part of local validation. Never expose a private homelab endpoint just to populate the widget.

## Verification checklist

- `/` is HTTP 200 with the canonical apex URL.
- `/api/health` is HTTP 200 JSON with `runtime: cloudflare-workers` and no uptime claim.
- `/api/system-status` renders a truthful disconnected, live or unavailable state.
- Unknown document is an HTML HTTP 404; unknown API is JSON HTTP 404.
- HEAD requests return the correct status with no body.
- HTML revalidates, hashed assets are immutable and stable images have bounded caching.
- CSP and all security headers are present on static, API and 404 responses.
- Named social and icon PNGs return the correct MIME type.
- Preview is noindex; production does not receive an accidental noindex header.
- Light/dark/system themes, reduced motion, full motion, keyboard navigation and responsive layout pass.
- No browser-console error, failed asset or unexpected external request appears.

Automated browser emulation does not satisfy physical-device acceptance. Record iPhone/Android and desktop-browser evidence separately in Phase 28.

## Rollback

Before any production change, record the current Cloudflare Worker version, DNS records, routes, redirect rules and maintenance-Worker routes.

If a Worker release fails but routing is correct, roll back to the last known-good Cloudflare Worker version, rerun the deployment contract, and retain the failed version/logs for diagnosis.

If the Phase 29 routing cutover fails, restore the recorded pre-cutover Worker route, maintenance route and web DNS state exactly. Restore the legacy traffic path only if its health was verified before cutover, then repeat HTTPS and external deployment checks.

The retained Docker/Coolify release is documented in [COOLIFY_OPERATIONS.md](./COOLIFY_OPERATIONS.md). Do not resume or mutate it without explicit operator approval. No database or volume rollback is required by the portfolio itself.

## References

- [Cloudflare GitHub Actions deployment](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [Cloudflare Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Cloudflare Worker platform limits](https://developers.cloudflare.com/workers/platform/limits/)
- [GitHub deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [GitHub deployment controls](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments)
