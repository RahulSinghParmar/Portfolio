# Production deployment

The portfolio is packaged as a minimal Next.js standalone container for the existing Coolify, Traefik and Cloudflare Tunnel stack. The application is stateless: it needs no database or persistent volume, and its only optional external dependency is the read-only system-status source.

## Request path

```text
Public visitor
  └─ HTTPS → Cloudflare edge
               └─ Cloudflare Tunnel → http://localhost:80
                                          └─ Traefik Host rule
                                                       └─ portfolio container :3000
```

Cloudflare terminates public TLS. Keep the Coolify/Traefik application origin on HTTP to avoid a second certificate flow and redirect loops through the tunnel. The public application identity and canonical URL remain `https://rahulsinghparmar.site`.

## Container contract

The root `Dockerfile` uses four deliberate stages:

1. `base` — Node.js 22 Alpine and shared build settings.
2. `dependencies` — deterministic `npm ci` from the committed lockfile.
3. `builder` — Next.js production build with public values frozen at build time.
4. `runner` — standalone output, public/static assets and no development dependencies.

The runtime:

- runs as unprivileged UID/GID `1001`;
- listens on `0.0.0.0:3000`;
- exposes only the application port;
- disables Next.js telemetry;
- handles `SIGTERM` through the standard Next.js server;
- reports container health through `GET /api/health`;
- contains OCI source, license, description and version labels.

The health endpoint is intentionally shallow. It verifies that the process and HTTP router are ready without coupling container availability to an optional monitoring provider.

## Environment contract

Public variables are embedded during `next build`; changing them requires a rebuild. Mark both as **build variables** in Coolify:

| Variable                   | Stage | Required | Production value                  |
| -------------------------- | ----- | -------- | --------------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | Build | Yes      | `https://rahulsinghparmar.site`   |
| `NEXT_PUBLIC_SITE_VERSION` | Build | Yes      | Release label, initially `v1.0.0` |

The status adapter is server-only and evaluated at runtime:

| Variable                   | Stage   | Required | Notes                                          |
| -------------------------- | ------- | -------- | ---------------------------------------------- |
| `SYSTEM_STATUS_SOURCE`     | Runtime | Yes      | `disabled` until the read-only source is ready |
| `SYSTEM_STATUS_URL`        | Runtime | No       | Must be HTTPS when source is `http`            |
| `SYSTEM_STATUS_TOKEN`      | Runtime | No       | Secret; never expose with `NEXT_PUBLIC_`       |
| `SYSTEM_STATUS_TIMEOUT_MS` | Runtime | No       | 1000–8000 ms; default `3500`                   |

Coolify or the image supplies `NODE_ENV=production`, `HOSTNAME=0.0.0.0`, `PORT=3000` and `NEXT_TELEMETRY_DISABLED=1`; do not duplicate them unless diagnosing a platform override.

## Coolify application setup

1. Create an **Application** in the production project and select the Portfolio Git repository.
2. Use **Dockerfile** as the build pack, repository root `/`, and `Dockerfile` as the file path.
3. Set the container port to `3000`. Do not publish that port directly on the Windows host; Traefik owns the public listener.
4. Add the application domain as `http://rahulsinghparmar.site` inside Coolify so Traefik creates the HTTP Host rule. Visitors and canonical metadata continue to use `https://rahulsinghparmar.site` through Cloudflare.
5. Configure the health path as `/api/health`, method `GET`, port `3000`, interval `30s`, timeout `5s`, start period `20s`, and three retries. The Docker image contains the same defaults.
6. Add the build and runtime variables from the tables above. Store `SYSTEM_STATUS_TOKEN` as a masked secret.
7. Keep one replica initially. The site is stateless and can scale later, but a second replica is unnecessary until traffic or availability measurements justify it.
8. Enable automatic deployment only after the first manual deployment passes the release gate below.

The Cloudflare Tunnel public-hostname route should target the existing Traefik origin at `http://localhost:80`. Do not point the tunnel directly to port 3000, request a second Coolify ACME certificate through the tunnel, or expose the container port to the LAN.

## Local image verification

Build from the repository root:

```bash
docker build --pull --tag rahul-portfolio:1.0.0 .
docker run --rm --detach --name rahul-portfolio --publish 127.0.0.1:3100:3000 rahul-portfolio:1.0.0
npm run deployment:check -- http://localhost:3100
docker stop rahul-portfolio
```

Inspect the runtime identity and health state:

```bash
docker inspect --format '{{.Config.User}}' rahul-portfolio:1.0.0
docker inspect --format '{{json .State.Health}}' rahul-portfolio
```

## Release-candidate verification

Validated locally on 31 August 2026 with Docker Desktop Engine 29.7.2:

| Check                        | Result                                     |
| ---------------------------- | ------------------------------------------ |
| Production image             | `rahul-portfolio:1.0.0`                    |
| Local image size             | 79.7 MiB                                   |
| Runtime identity             | UID `1001` / GID `1001`                    |
| Container health             | Healthy, zero restarts                     |
| Deployment contract          | 29/29 checks passed                        |
| Lighthouse Best Practices    | 100, zero browser-console errors           |
| Container dependency install | 357 packages audited, zero vulnerabilities |

The test container was stopped and removed after verification. The built image remains in the local Docker cache for inspection or a repeat smoke test.

## Release gate

Before moving traffic to a new deployment:

1. Complete formatting, lint, type, production build, performance, SEO and accessibility checks.
2. Require the Coolify container to become healthy without restart loops.
3. Run `npm run deployment:check -- https://rahulsinghparmar.site` from outside the host after deployment.
4. Confirm `/api/health`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image` and `/twitter-image` return HTTP 200.
5. Confirm the public response contains the security headers and the canonical HTTPS identity.
6. Confirm Cloudflare returns HTTPS 200 while the Traefik origin remains HTTP.
7. Inspect recent application and proxy logs for repeated 4xx/5xx, OOM kills or unexpected restarts.

## Rollback

If the public gate fails:

1. Leave the failed deployment available for logs; do not mutate it in place.
2. In Coolify, select the previous known-good deployment or redeploy its exact Git commit.
3. Wait for `/api/health` to report healthy before switching traffic.
4. Repeat the external deployment contract and the Cloudflare/Traefik checks.
5. Record the failed commit, symptom and relevant application/proxy log window before retrying.

No database migration or volume rollback is required because this application is stateless.

## Operations and hardening

- Let Cloudflare handle public TLS, HSTS, bot controls and edge rate limits; the application supplies CSP, frame, content-type, referrer and permissions protections.
- Keep Traefik as the only public origin listener and retain Coolify control-plane ports on localhost.
- Start with conservative CPU and memory limits, then tune them from observed usage rather than guessing. Treat OOM kills or sustained throttling as a failed release signal.
- Keep application logs on stdout/stderr for Coolify collection. Do not write secrets, authorization headers or full upstream payloads.
- Rebuild the image regularly so the moving Node 22 Alpine base receives current operating-system and runtime patches. The lockfile continues to pin application dependencies.
- Pin the base image by digest only if the image-update process also includes scheduled digest refreshes; an abandoned digest is not a security update strategy.

Git-provider authorization, Cloudflare hostname changes and public traffic cutover require account-level actions and are intentionally separate from local release-candidate verification.
