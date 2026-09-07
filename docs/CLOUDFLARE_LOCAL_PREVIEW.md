# Cloudflare local preview

This is the operator guide for the Phase 26 delivery path: a Next.js static export in `out/`, a small API Worker in `worker/`, and Cloudflare Workers Static Assets serving both through one project.

It does not publish a Worker, modify DNS, or interact with the existing maintenance Worker.

## Runtime contract

| Request                               | Local Wrangler behavior                                 |
| ------------------------------------- | ------------------------------------------------------- |
| `/`, generated metadata, images       | Served directly from `out/`                             |
| `/_next/static/*`                     | Served directly with immutable caching                  |
| `/api/health`                         | Executed by the API Worker                              |
| `/api/system-status`                  | Executed by the API Worker                              |
| Unknown `/api/*`                      | JSON `404` from the Worker                              |
| Unknown document or asset             | Exported `404.html` with HTTP `404`                     |
| Preview and other `workers.dev` hosts | `X-Robots-Tag: noindex, nofollow`                       |
| Production custom domain              | Indexable; canonical metadata remains the apex site URL |

The Worker-first list is limited to `/api` and `/api/*`. Static requests therefore avoid Worker execution and remain eligible for Cloudflare's direct asset delivery.

## One-command local runtime

Use Node.js 22 or later. Install the locked dependencies, then start the complete built application:

```powershell
npm ci
npm run preview:cloudflare
```

`preview:cloudflare` performs a fresh static export and starts Wrangler on `http://127.0.0.1:8788`. Stop it with `Ctrl+C`.

The default local and checked-in preview configurations keep the status source disabled. The page must show that disconnected state truthfully; it is not a deployment error.

## Optional local status source

Only create a local variable file when testing an approved read-only HTTPS endpoint:

```powershell
Copy-Item .dev.vars.example .dev.vars
```

Edit `.dev.vars`, which is ignored by Git. Never put tokens in `wrangler.jsonc`, `.env.example`, build output, screenshots, or logs. Remove the local token after the test if it is no longer needed.

The accepted bindings are:

| Binding                    | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `DEPLOYMENT_ENV`           | Separates local/preview robots policy from production |
| `SITE_VERSION`             | Public runtime build identity                         |
| `SYSTEM_STATUS_SOURCE`     | `disabled` or `http`                                  |
| `SYSTEM_STATUS_URL`        | Exact read-only HTTPS upstream                        |
| `SYSTEM_STATUS_TOKEN`      | Optional bearer credential; secret                    |
| `SYSTEM_STATUS_TIMEOUT_MS` | Upstream timeout, clamped to 1000–8000 ms             |

Do not make a private homelab endpoint public solely to populate the widget.

## Preview and production separation

`wrangler.jsonc` defines three deliberate configurations:

- Default: local-only, no public `workers.dev` route.
- `preview`: a separate Worker name with `workers_dev` and version preview URLs enabled.
- `production`: a separate Worker name with public preview URLs disabled.

Production custom-domain routes are intentionally absent. They belong to the controlled Phase 29 cutover and must not be inferred or created during local development.

If the status adapter is connected later, create secrets through Wrangler for each environment rather than adding them to source:

```powershell
npx wrangler secret put SYSTEM_STATUS_TOKEN --env preview
npx wrangler secret put SYSTEM_STATUS_TOKEN --env production
```

These commands change Cloudflare account state. Do not run them during ordinary local validation.

## Packaging check

Compile the Worker and validate the static asset manifest without uploading anything:

```powershell
npm run cloudflare:check
```

This performs a fresh build followed by `wrangler deploy --dry-run` for the preview environment. Generated Wrangler state is ignored by Git.

Before a release or pull request, use the broader gate:

```powershell
npm run release:check
```

It adds the complete static-quality suite and repository-owned limits for asset count, individual and total static size, Worker bundle size and `_headers` complexity.

With Wrangler still running, exercise the response contract in a second terminal:

```powershell
npm run deployment:check -- http://127.0.0.1:8788
```

## Response policy

The exported `_headers` file supplies CSP, frame, MIME-sniffing, referrer, permissions and cross-origin protections for static responses. The Worker applies the same security policy directly to API responses because `_headers` does not affect Worker-generated responses.

Caching remains content-aware:

- HTML and unversioned metadata revalidate on every request.
- Fingerprinted `/_next/static/*` files are cached for one year and marked immutable.
- The stable portrait path is cached for one day and can be revalidated.
- Every API response is `no-store`.

The current CSP permits inline script and style execution because the exported Next.js document contains framework-generated inline code. External scripts, frames, objects and data connections remain blocked.

## Troubleshooting

- Missing `out/index.html`: run `npm run build` before invoking Wrangler directly.
- Status reads “not connected”: expected while `SYSTEM_STATUS_SOURCE=disabled`.
- Status reads “temporarily unavailable”: verify the source is HTTPS, returns JSON within the size and timeout limits, and does not redirect.
- Static page returns Worker text instead of the portfolio 404: confirm the `ASSETS` binding and `404-page` handling remain present in `wrangler.jsonc`.
- CSP console error: identify the exact blocked resource before changing policy; do not add a broad wildcard.
- Unexpected indexing: inspect `X-Robots-Tag` on the actual `workers.dev` response and verify the preview environment was selected.
