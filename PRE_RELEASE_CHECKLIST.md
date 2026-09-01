# Pre-release checklist

**Release target:** `v1.0.0`

**Canonical URL:** `https://rahulsinghparmar.site`

**Execution plan:** [DEPLOYMENT_CUTOVER_PLAN.md](./DEPLOYMENT_CUTOVER_PLAN.md)

This is the ordered release gate. Do not tag `v1.0.0` merely because the code builds. The tag identifies the exact commit that passes the public HTTPS deployment contract.

## Gate 0 — account and rollback readiness

- [x] Confirm access to the Namecheap registrar account.
- [x] Confirm access to the Cloudflare account that owns the existing tunnel.
- [x] Confirm access to Coolify and the production server.
- [x] Confirm repository admin access for GitHub Pages settings.
- [x] Confirm the existing `cloudflared` tunnel and Windows service are healthy.
- [x] Export the complete Namecheap Advanced DNS zone.
- [x] Record current authoritative nameservers:
  - `julio.ns.cloudflare.com`
  - `rafe.ns.cloudflare.com`
- [x] Record tunnel target `a757cf29-4ba0-4f78-870b-534d060549be.cfargotunnel.com`; keep its connector token outside the repository.
- [x] Confirm the domain will not accept or send email; publish Null MX, SPF `-all` and strict DMARC `reject`.
- [x] Preserve legacy commit `e9caf7735e817431e231a60618c4ecf65a7bcf5c` as release `legacy-static-final`.
- [x] Unpublish GitHub Pages only after preserving the final static source release.
- [ ] Choose a low-traffic cutover window with 24 hours available for observation.

## Gate 1 — before `git commit`

The release worktree was saved, `main` was fast-forwarded to remote commit `b33129c1db83734cfef02c0e5784f02cdd2187b0` (`Delete CNAME`), and the worktree was restored without conflict.

- [x] Save a recoverable copy of the complete working diff, including untracked release files.
- [x] Run `git status --short` and account for every changed, deleted and untracked path.
- [x] Run `git fetch origin`.
- [x] Confirm `origin/main` has not advanced beyond the audited commit without review.
- [x] Reconcile the worktree with `origin/main` using a controlled stash/fast-forward/restore workflow.
- [x] Resolve the already-deleted `CNAME` as an expected upstream change; do not recreate it.
- [x] Confirm `.github/workflows/static.yml` is deleted.
- [x] Confirm legacy static HTML, CSS, JavaScript and root Pages assets are deleted only where the Next.js migration replaces them.
- [x] Confirm these release files exist:
  - `README.md`
  - `CHANGELOG.md`
  - `RELEASE_CANDIDATE_REPORT.md`
  - `DEPLOYMENT_CUTOVER_PLAN.md`
  - `PRE_RELEASE_CHECKLIST.md`
  - `docs/DEPLOYMENT.md`
  - `docs/COOLIFY_OPERATIONS.md`
  - `docs/VISUAL_REGRESSION.md`
  - `.env.example`
  - `.github/workflows/quality.yml`
  - `Dockerfile`
  - `scripts/prepare-standalone.mjs`
- [x] Confirm no `.env.local`, token, API key, private key, tunnel credential, Namecheap export or Cloudflare credential is tracked.
- [x] Confirm `myphotos/`, `.next/`, Lighthouse output and local audit artifacts remain ignored.
- [x] Run `git diff --check`.
- [x] Run the repository secret scan.
- [x] Run `npm ci` from the committed lockfile.
- [x] Run `npm run quality:check`.
- [x] Build `rahul-portfolio:1.0.0` from the reconciled worktree.
- [x] Run the container locally as UID/GID `1001` and confirm it becomes healthy.
- [x] Run `npm run deployment:check -- http://localhost:3100` and require 29/29.
- [x] Stop and remove the temporary test container.
- [x] Review `git diff` in full; confirm no unreviewed feature, UI or content scope entered the release candidate.
- [x] Stage only reviewed release paths.
- [x] Review `git diff --cached --check` and `git diff --cached`.
- [x] Commit with Rahul's configured Git identity and a release-focused message, for example:

  ```bash
  git commit -m "release: prepare portfolio v1.0.0"
  ```

- [x] Record candidate `fdbbabcb5bf4292914877a30cfcbb5d71d0fa2da`; Phase 21 records its documentation-only successor before tagging.

## Gate 2 — before `git push`

- [x] Confirm the local commit is based on the current `origin/main`.
- [x] Confirm the working tree is clean.
- [x] Confirm the candidate commit contains the quality workflow and no Pages deployment workflow.
- [x] Confirm the authenticated repository workflow permits the normal push without bypass or force.
- [x] Confirm no force push is required.
- [x] Push the reviewed commit through the repository's normal process.
- [x] Do not push `v1.0.0` before the public deployment gate.

Expected command only after every item above passes:

```bash
git push origin main
```

## Gate 3 — after push, before production deployment

### GitHub release candidate

- [x] Confirm GitHub `main` points to the recorded candidate SHA.
- [x] Require the **Release quality** workflow to pass on that exact SHA.
- [x] Confirm Application contract passes formatting, ESLint, TypeScript, build, performance and SEO.
- [x] Confirm the workflow's production-server deployment contract passes.
- [x] Confirm the workflow's Docker build passes.
- [x] Confirm no repository-managed Pages deployment workflow remains.
- [x] Disable repository Pages only after preserving `legacy-static-final`; repository history remains intact.

### Coolify platform

- [x] Run platform health and confirm scheduled backup evidence:

  ```powershell
  & C:\Docker\coolify\maintenance\Manage-Coolify.ps1 Health
  & C:\Docker\coolify\maintenance\Manage-Coolify.ps1 Backup
  ```

- [x] Confirm all Coolify services, Traefik and `coolify-testing-host` are healthy.
- [x] Confirm the scheduled backup completes under `C:\Docker\coolify\backups-host`.
- [x] Confirm the Windows `Cloudflared` service is running.
- [x] Confirm ports `8000`, `6001` and `6002` remain localhost-only.
- [x] Confirm Traefik remains the Docker HTTP/HTTPS origin and application port `3000` is not host-published.

### Coolify application

- [x] Source: `https://github.com/RahulSinghParmar/Portfolio.git`.
- [x] Branch: `main`.
- [x] Candidate SHA: exact recorded release commit.
- [x] Build pack: Dockerfile.
- [x] Base directory: `/`.
- [x] Dockerfile: `/Dockerfile`.
- [x] Internal exposed port: `3000`.
- [x] No host port mapping.
- [x] No database or persistent volume.
- [x] One replica.
- [x] Automatic deployment set to **Manual deployments only**.
- [x] Domains:

  ```text
  http://rahulsinghparmar.site,http://www.rahulsinghparmar.site
  ```

- [x] Build variables:

  ```text
  NEXT_PUBLIC_SITE_URL=https://rahulsinghparmar.site
  NEXT_PUBLIC_SITE_VERSION=v1.0.0
  ```

- [x] Runtime variables:

  ```text
  SYSTEM_STATUS_SOURCE=disabled
  SYSTEM_STATUS_URL=
  SYSTEM_STATUS_TOKEN=
  SYSTEM_STATUS_TIMEOUT_MS=3500
  ```

- [x] Container health checking is active.
- [x] Temporary-host deployment is healthy with zero restarts.
- [x] Temporary-host deployment contract passes.
- [x] Application and Traefik logs contain no release-blocking error.

### Cloudflare zone preparation

- [x] Add `rahulsinghparmar.site` to Cloudflare using full DNS setup.
- [x] Compare Cloudflare's scan against the Namecheap zone export.
- [x] Publish Null MX because the domain intentionally accepts no email.
- [x] Publish SPF `v=spf1 -all` and strict DMARC `reject`.
- [x] Do not import the four GitHub Pages A records.
- [x] Do not import the apex alias/redirect to `rahulsinghparmar.online`.
- [x] Confirm no old AAAA, CAA or DS record needs migration.
- [x] Create proxied apex CNAME to `a757cf29-4ba0-4f78-870b-534d060549be.cfargotunnel.com`.
- [x] Create proxied `www` CNAME to the same tunnel target.
- [x] Add apex and `www` published routes to `http://localhost:80`.
- [x] Keep both routes above any tunnel catch-all.
- [x] Confirm the Host header reaches Traefik unchanged.
- [x] Create the `www to apex` 308 Single Redirect with path and query preservation.
- [x] Record `julio.ns.cloudflare.com` and `rafe.ns.cloudflare.com`.
- [x] Confirm no old DS record exists before delegation changes.

## Gate 4 — production deployment and traffic cutover

This gate changes external state and must be performed manually in the scheduled window.

- [x] Manually deploy the exact candidate SHA in Coolify.
- [x] Wait for the container to become healthy.
- [x] Confirm zero restart loops and no `No available server` response.
- [x] In Namecheap, replace both BasicDNS nameservers with only the two assigned Cloudflare nameservers.
- [x] Do not alter registrar ownership or transfer the domain.
- [x] Wait for Cloudflare zone status **Active**.
- [x] Confirm public resolvers return Cloudflare nameservers.
- [x] Confirm Universal SSL becomes **Active** for apex and `www`.
- [x] Enable Cloudflare **Always Use HTTPS**.
- [x] Keep HSTS, preload and `includeSubDomains` disabled during cutover.
- [x] Run through public Cloudflare DNS and HTTPS:

  ```powershell
  curl.exe --head https://rahulsinghparmar.site
  curl.exe --head "https://www.rahulsinghparmar.site/cutover-check?source=www"
  npm run deployment:check -- https://rahulsinghparmar.site
  ```

- [x] Require strict TLS success without `--insecure`.
- [x] Require apex HTTP 200.
- [x] Require `www` 308 to the apex with the same path and query.
- [x] Require 29/29 deployment checks.
- [x] Confirm `Server: GitHub.com` is absent.
- [x] Confirm health, robots, sitemap, manifest, icons and social cards return HTTP 200.
- [x] Confirm canonical metadata uses only `https://rahulsinghparmar.site`.
- [x] Confirm Null MX, SPF `-all` and DMARC `reject` resolve after nameserver migration.
- [x] Confirm email forwarding is intentionally disabled and no delivery test is required.
- [ ] Repeat the public checks from a second device or mobile network.
- [x] Monitor Coolify, Traefik and tunnel state through the initial stabilization window; keep the 24-hour observation item open below.

## Gate 5 — before `git tag v1.0.0`

- [ ] Production is serving the exact recorded candidate SHA.
- [x] Public DNS no longer returns GitHub Pages A records from current authoritative nameservers.
- [x] Strict apex and `www` TLS both pass.
- [x] The accepted candidate passes the external deployment contract 29/29.
- [ ] GitHub quality workflow passes on the same SHA.
- [x] No rollback was required during the initial cutover observation.
- [x] `CHANGELOG.md` accurately describes the accepted release.
- [x] `package.json` version is `1.0.0`.
- [ ] No uncommitted code or documentation is being added to the deployed artifact.

The release commit intentionally captures this checklist immediately before tag creation. Final tag and GitHub release proof lives in Git and the GitHub release record; creating a follow-up documentation commit would make the tag cease to identify the reviewed release commit.

- [ ] Create an annotated tag on the exact accepted commit:

  ```bash
  git tag -a v1.0.0 -m "Portfolio v1.0.0"
  git show --no-patch --decorate v1.0.0
  ```

- [ ] Verify the tag resolves to the production commit SHA.
- [ ] Push only the verified tag:

  ```bash
  git push origin v1.0.0
  ```

- [ ] Publish GitHub release notes from `CHANGELOG.md`.

## Gate 6 — stabilization and GitHub Pages retirement

- [x] Wait through the old 1800-second TTL plus a safety buffer before completing the production verification.
- [ ] Prefer a 24-hour stable observation window before irreversible cleanup.
- [x] Confirm no meaningful 5xx, restart, tunnel or certificate errors during the initial observation.
- [x] Preserve the last static deployment as GitHub release `legacy-static-final` at commit `e9caf7735e817431e231a60618c4ecf65a7bcf5c`.
- [x] Remove the Pages custom domain.
- [x] Disable the GitHub Pages deployment source.
- [x] Confirm GitHub reports Pages as inactive.
- [x] Keep the legacy release and repository history as rollback source material.
- [ ] Enable Cloudflare DNSSEC.
- [ ] Add the Cloudflare-provided DS record at Namecheap.
- [ ] Confirm DS validation through two public resolvers.
- [x] Keep HSTS disabled and schedule it as a separate post-cutover security decision.
- [ ] Record final DNS, certificate, release SHA, tag and deployment timestamps.

## Stop conditions

Stop the cutover and use the rollback section of `DEPLOYMENT_CUTOVER_PLAN.md` if any of these occurs:

- remote `main` changes unexpectedly before the release commit;
- GitHub quality or Docker build fails;
- Coolify container does not become healthy;
- Traefik returns `404` or `No available server`;
- the Cloudflare zone loses the explicit no-mail records or any other required non-web record;
- nameservers are mixed between providers;
- Cloudflare Universal SSL remains pending or fails;
- strict HTTPS requires certificate bypass;
- `www` does not preserve path/query when redirecting;
- mail is unexpectedly accepted despite the explicit no-mail policy;
- the external deployment contract is not 29/29;
- the public response still comes from GitHub Pages.
