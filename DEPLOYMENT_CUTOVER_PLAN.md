# Deployment cutover plan

**Release:** `v1.0.0`

**Audit date:** 31 August 2026

**Canonical origin:** `https://rahulsinghparmar.site`

**Alternate hostname:** `https://www.rahulsinghparmar.site` → canonical apex

**Deployment target:** Coolify → Traefik → Cloudflare Tunnel

**Scope:** deployment migration only; no portfolio feature, interface or content work

## Execution status — 31 August 2026

Completed:

- GitHub Pages is unpublished, its custom-domain binding is removed, and remote commit `b33129c` deletes `CNAME`.
- Cloudflare is authoritative through `julio.ns.cloudflare.com` and `rafe.ns.cloudflare.com`; the legacy GitHub A records and apex alias were not retained.
- Universal SSL is Active for `rahulsinghparmar.site` and `*.rahulsinghparmar.site`, managed through 29 November 2026.
- The domain intentionally accepts no email. Null MX, SPF `v=spf1 -all` and strict DMARC `reject` records resolve publicly.
- The final static source is preserved as the GitHub release `legacy-static-final` at commit `e9caf7735e817431e231a60618c4ecf65a7bcf5c`.
- Local Coolify, Traefik, the deployment host and the Windows `Cloudflared` service passed health checks.

Remaining:

- Commit and push the reviewed Next.js release candidate and require its GitHub quality workflow to pass.
- Deploy that exact commit to Coolify on a temporary hostname before directing production traffic.
- Add the apex and `www` tunnel routes and proxied DNS records, then configure the `www` redirect and HTTPS enforcement.
- Pass the external 29-check deployment contract before creating tag `v1.0.0`.

The audit baseline below is retained as rollback evidence; it no longer describes the live provider state.

## Decision summary

Use `rahulsinghparmar.site` as the only canonical URL. Move authoritative DNS from Namecheap BasicDNS to a full Cloudflare zone, publish both the apex and `www` through the existing Cloudflare Tunnel, and redirect `www` to the apex at Cloudflare while preserving paths and query strings.

The registrar remains Namecheap. Only authoritative DNS hosting moves to Cloudflare. The Next.js container remains behind Traefik on HTTP; Cloudflare terminates visitor TLS and the authenticated outbound tunnel protects the connection to the host. Do not expose container port `3000` or Coolify control-plane ports publicly.

The Cloudflare nameservers are now known. One provider value still cannot be invented in this repository:

- the existing tunnel target in the form `<TUNNEL_UUID>.cfargotunnel.com`.

Copy that target exactly from the Cloudflare account during execution.

## Audit baseline before execution

### Public service

- The public GitHub repository is `RahulSinghParmar/Portfolio`.
- GitHub's public repository metadata reports `has_pages: true`.
- The repository's current remote `main` commit is `b33129c1db83734cfef02c0e5784f02cdd2187b0` (`Delete CNAME`).
- This local checkout is still based on its parent, `e9caf7735e817431e231a60618c4ecf65a7bcf5c`; it must be synchronized before the release commit.
- The legacy Pages workflow remains in remote history and is deleted only in the uncommitted migration worktree.
- Strict HTTPS for the apex fails hostname validation.
- Plain HTTP currently reaches GitHub and returns `404 Not Found` with `Server: GitHub.com`.
- `www.rahulsinghparmar.site` does not currently resolve.

### Authoritative DNS snapshot

The following records were observed through Cloudflare and Google public DNS resolvers. The authoritative nameservers are Namecheap BasicDNS.

| Type           | Name | Current value                                        |  TTL | Cutover treatment                                                                                                                           |
| -------------- | ---- | ---------------------------------------------------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------------- |
| NS             | `@`  | `dns1.registrar-servers.com`                         | 1800 | Replace at the Namecheap registrar with the two account-assigned Cloudflare nameservers.                                                    |
| NS             | `@`  | `dns2.registrar-servers.com`                         | 1800 | Replace at the Namecheap registrar with the two account-assigned Cloudflare nameservers.                                                    |
| A              | `@`  | `185.199.108.153`                                    | 1800 | Do not import; legacy GitHub Pages.                                                                                                         |
| A              | `@`  | `185.199.109.153`                                    | 1800 | Do not import; legacy GitHub Pages.                                                                                                         |
| A              | `@`  | `185.199.110.153`                                    | 1800 | Do not import; legacy GitHub Pages.                                                                                                         |
| A              | `@`  | `185.199.111.153`                                    | 1800 | Do not import; legacy GitHub Pages.                                                                                                         |
| CNAME/redirect | `@`  | `rahulsinghparmar.online`                            | 1800 | Do not import; remove the legacy alias or Namecheap URL Redirect entry. Its coexistence with apex A records is invalid/ambiguous DNS state. |
| MX             | `@`  | `eforward1.registrar-servers.com` priority 10        | 1800 | Historical only; replaced by Null MX because the domain does not accept email.                                                              |
| MX             | `@`  | `eforward2.registrar-servers.com` priority 10        | 1800 | Historical only; removed during the no-mail-policy cutover.                                                                                 |
| MX             | `@`  | `eforward3.registrar-servers.com` priority 10        | 1800 | Historical only; removed during the no-mail-policy cutover.                                                                                 |
| MX             | `@`  | `eforward4.registrar-servers.com` priority 15        | 1800 | Historical only; removed during the no-mail-policy cutover.                                                                                 |
| MX             | `@`  | `eforward5.registrar-servers.com` priority 20        | 1800 | Historical only; removed during the no-mail-policy cutover.                                                                                 |
| TXT            | `@`  | `v=spf1 include:spf.efwd.registrar-servers.com ~all` | 1800 | Historical only; replaced with `v=spf1 -all`.                                                                                               |

No public `www`, AAAA, CAA, DS, DMARC, `mail`, `autodiscover`, or GitHub Pages verification TXT record was found during this audit. A public scan cannot guarantee that every operational or validation record has been discovered. Export the complete Namecheap Advanced DNS zone and compare it line by line before changing nameservers.

### Repository GitHub Pages dependencies

| Dependency                             | Current condition                                                                                | Required action                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `.github/workflows/static.yml`         | Present in the legacy commit; deploys the repository root with Pages write and OIDC permissions. | Commit its existing worktree deletion.                                                                                                     |
| Root `CNAME`                           | Present in local legacy `HEAD`; already deleted from remote `main`.                              | Synchronize with remote; ensure it is absent from the release tree.                                                                        |
| Static root files                      | `index.html`, legacy CSS/JS, Pages `robots.txt` and assets exist in the legacy commit.           | Commit their existing migration deletions; the Next.js application replaces them.                                                          |
| Repository Pages setting               | Public API reports Pages enabled.                                                                | Leave the last deployment available during DNS propagation, then set the Pages source to `None` after the Cloudflare deployment is stable. |
| `github-pages` environment/deployments | May remain in repository history.                                                                | No runtime dependency. Keep as audit history or remove later; it is not a cutover requirement.                                             |
| GitHub Pages DNS                       | Four apex A records still resolve publicly.                                                      | Do not import them into Cloudflare; remove them from Namecheap after Cloudflare is authoritative.                                          |

## Target state

```text
Visitor
  ├─ https://www.rahulsinghparmar.site/*
  │    └─ Cloudflare 308 → https://rahulsinghparmar.site/*
  │
  └─ https://rahulsinghparmar.site
       └─ Cloudflare Universal SSL + edge controls
            └─ existing authenticated Cloudflare Tunnel
                 └─ http://localhost:80
                      └─ Traefik Host rule
                           └─ Next.js standalone container :3000
```

- Namecheap remains the registrar.
- Cloudflare becomes authoritative DNS.
- The existing remotely managed `cloudflared` service and tunnel are reused.
- Cloudflare DNS has proxied CNAME records for both `@` and `www` to the same tunnel UUID.
- Traefik accepts both hostnames over its HTTP origin route.
- Cloudflare redirects `www` to the HTTPS apex with one permanent hop.
- `NEXT_PUBLIC_SITE_URL` remains `https://rahulsinghparmar.site`; canonical metadata, sitemap and structured data require no change.
- The application remains stateless: one container, no database and no persistent volume.

## Documentation audit

`docs/DEPLOYMENT.md` correctly documents the standalone image, non-root runtime, internal port `3000`, HTTP Traefik origin, Cloudflare TLS boundary and optional disconnected status provider. The following cutover details were missing or stale and are supplied by this plan:

- current Namecheap nameservers and DNS record inventory;
- replacement of the unused Namecheap forwarding records with an explicit no-mail policy;
- removal of all four GitHub Pages A records and the anomalous apex alias;
- `www` DNS and canonical redirect behavior;
- Cloudflare nameserver, DNSSEC and certificate sequencing;
- manual GitHub Pages decommissioning after propagation;
- remote/local Git synchronization before the release commit;
- rollback while the legacy Pages deployment is still available;
- the deployment contract now contains 29 checks, not the 27 recorded in the older deployment baseline.

Do not edit the historical local-validation result solely to perform cutover. Record the final external 29/29 result after production is reachable.

## Pre-cutover preparation

### 1. Freeze and record the release candidate

1. Stop feature and content changes.
2. Export the current working diff or create a recoverable local backup before Git synchronization.
3. Fetch `origin` and reconcile the local checkout with remote `main`. The known remote-only commit deletes `CNAME`, which matches the intended migration, but the complete result must still be reviewed.
4. Run `npm ci` and `npm run quality:check` after synchronization.
5. Build and smoke-test the exact candidate image again.
6. Record the final release commit SHA; use that SHA in Coolify and release notes.

### 2. Preserve the legacy rollback point

Record legacy commit `e9caf7735e817431e231a60618c4ecf65a7bcf5c` and confirm its Pages artifact is still reachable through GitHub's default Pages URL or retained deployment history. Do not disable Pages before the new container is healthy and the Cloudflare nameserver/certificate cutover is complete.

If long-term rollback to the static site is required, preserve this commit with a clearly named Git reference before Pages is disabled. The reference is operational insurance, not the `v1.0.0` release tag.

### 3. Verify the Coolify platform

Run the existing platform checks before creating the application:

```powershell
& C:\Docker\coolify\maintenance\Manage-Coolify.ps1 Health
& C:\Docker\coolify\maintenance\Manage-Coolify.ps1 Backup
```

Require all Coolify components, the `coolify-testing-host` server target and Traefik to be healthy. Confirm the Windows `Cloudflared` service is running and reuse it; do not install a second connector.

## Exact Coolify deployment steps

Perform these steps before changing production DNS:

1. Reuse the existing `rahul-portfolio-rc` **Application** in `My first project / production`; do not create a second portfolio resource.
2. Confirm its source remains the public Git repository `https://github.com/RahulSinghParmar/Portfolio.git`. A GitHub App is optional for a public repository; it is required only for private access, commit-status integration or authenticated automatic deployment.
3. Select branch `main` and pin/record the accepted release commit SHA.
4. Choose the **Dockerfile** build pack.
5. Set base directory to `/` and Dockerfile location to `/Dockerfile`.
6. Set **Ports Exposes** to `3000`; do not configure a host-port mapping.
7. Configure both HTTP origin domains, comma-separated:

   ```text
   http://rahulsinghparmar.site,http://www.rahulsinghparmar.site
   ```

   HTTP is intentional. Traefik owns the origin route and Cloudflare owns public HTTPS. Configuring a second Coolify ACME flow through this tunnel previously produced HTTP 403 and redirect-loop behavior.

8. Configure build variables:

   ```text
   NEXT_PUBLIC_SITE_URL=https://rahulsinghparmar.site
   NEXT_PUBLIC_SITE_VERSION=v1.0.0
   ```

9. Configure runtime variables:

   ```text
   SYSTEM_STATUS_SOURCE=disabled
   SYSTEM_STATUS_URL=
   SYSTEM_STATUS_TOKEN=
   SYSTEM_STATUS_TIMEOUT_MS=3500
   ```

10. Keep one replica and no persistent storage.
11. Use the Dockerfile health check. It requests `http://127.0.0.1:3000/api/health`, and for a non-Compose Dockerfile application it takes precedence over a duplicate Coolify UI health check.
12. Keep automatic deployment disabled for the first release.
13. Deploy manually and require the container to become healthy with zero restart loops.
14. Inspect application and Traefik logs for bind errors, `404 No available server`, repeated 5xx responses or OOM termination.
15. Validate the exact container through the existing `portfolio-rc.parmar.homes` route before production DNS changes; do not change the production canonical environment variable.

## Exact Cloudflare and DNS changes

### Stage A — create and review the Cloudflare zone

1. Add `rahulsinghparmar.site` to the same Cloudflare account that owns the existing tunnel.
2. Choose a full DNS setup.
3. Export all Namecheap Advanced DNS records before accepting Cloudflare's quick scan.
4. Compare the Cloudflare import with the Namecheap export. Quick scan is not a complete backup.
5. Delete or decline the imported four GitHub Pages A records.
6. Delete or decline the apex CNAME/URL redirect to `rahulsinghparmar.online`.
7. Because the domain will not handle email, remove the five forwarding MX records and forwarding SPF record. Publish the Null MX, SPF `-all` and strict DMARC records shown below.
8. Do not add an origin A or AAAA record. The tunnel CNAME is the application route, and Cloudflare supplies public edge IPv4/IPv6 responses.
9. Do not add a CAA record during cutover. No current CAA restriction was found.

### Stage B — create target DNS records

Create these records in Cloudflare after confirming the tunnel UUID:

| Type  | Name     | Target                                           | Proxy    | TTL  |
| ----- | -------- | ------------------------------------------------ | -------- | ---- |
| CNAME | `@`      | `<TUNNEL_UUID>.cfargotunnel.com`                 | Proxied  | Auto |
| CNAME | `www`    | `<TUNNEL_UUID>.cfargotunnel.com`                 | Proxied  | Auto |
| MX    | `@`      | `.` priority 0                                   | DNS only | Auto |
| TXT   | `@`      | `v=spf1 -all`                                    | DNS only | Auto |
| TXT   | `_dmarc` | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s` | DNS only | Auto |

Cloudflare flattens the apex CNAME automatically. Multiple hostnames may point to the same tunnel target, but the target works only for DNS records in the same Cloudflare account as the tunnel.

### Stage C — create tunnel routes

In the existing Cloudflare Tunnel, add these published application routes above any catch-all route:

| Public hostname             | Service               |
| --------------------------- | --------------------- |
| `rahulsinghparmar.site`     | `http://localhost:80` |
| `www.rahulsinghparmar.site` | `http://localhost:80` |

Preserve the incoming Host header so Traefik can select the matching Coolify route. Do not point the tunnel directly at port `3000`, do not expose port `3000` on the LAN, and do not configure TLS verification for the local HTTP service.

### Stage D — configure the canonical redirect

Create one Cloudflare **Single Redirect**:

- Rule name: `www to apex`
- Match expression: `http.host eq "www.rahulsinghparmar.site"`
- Dynamic target: `concat("https://rahulsinghparmar.site", http.request.uri.path)`
- Status: `308`
- Preserve query string: enabled

Enable **Always Use HTTPS** for the zone after Universal SSL is active. This produces:

- `http://rahulsinghparmar.site/*` → HTTPS apex;
- `http://www.rahulsinghparmar.site/*` → HTTPS apex;
- `https://www.rahulsinghparmar.site/*` → HTTPS apex;
- no redirect for the canonical HTTPS apex.

### Stage E — change authoritative nameservers

1. Query for a current DS record and inspect Namecheap DNSSEC. No public DS record was found during the audit.
2. If Namecheap shows DNSSEC enabled, disable it and remove the old DS record before changing nameservers.
3. Copy the two Cloudflare-assigned nameservers from the zone Overview page.
4. In Namecheap **Domain List → Manage → Nameservers**, select **Custom DNS**.
5. Replace only:

   ```text
   dns1.registrar-servers.com
   dns2.registrar-servers.com
   ```

   with the two exact Cloudflare-assigned nameservers.

6. Do not leave any Namecheap nameserver mixed with Cloudflare nameservers.
7. Wait until Cloudflare reports the zone **Active** and both Google and Cloudflare public resolvers return the assigned Cloudflare nameservers.
8. Keep the old Namecheap zone unchanged during propagation; cached resolvers can continue serving the legacy Pages site until delegation expires.

Namecheap warns that records are not transferred automatically when nameservers change. The Cloudflare zone must be complete before this step.

## SSL/TLS validation process

### Required edge configuration

- Cloudflare Universal SSL enabled.
- Certificate status **Active** before release acceptance.
- Certificate covers `rahulsinghparmar.site` and `*.rahulsinghparmar.site`, which includes `www`.
- Minimum TLS version 1.2.
- Always Use HTTPS enabled only after certificate activation.
- No second public certificate or ACME challenge from Coolify for these hostnames.
- No Cloudflare Access policy on the public portfolio hostnames.

Cloudflare Tunnel provides the authenticated outbound transport to Cloudflare, while `cloudflared` reaches the local Traefik origin over HTTP. Do not select Flexible mode as a workaround for certificate failures. Leave the zone's normal SSL/TLS policy at Full (strict) where other HTTPS origins require it; the tunnel route's service URL explicitly controls this local HTTP hop.

Universal SSL may take from approximately 15 minutes to 24 hours after zone activation. Do not declare the release complete while the certificate is pending.

### Required validation

Run from a network outside the Coolify host:

```powershell
Resolve-DnsName rahulsinghparmar.site -Type NS
Resolve-DnsName rahulsinghparmar.site -Type A
Resolve-DnsName rahulsinghparmar.site -Type AAAA
Resolve-DnsName www.rahulsinghparmar.site -Type A_AAAA
curl.exe --head https://rahulsinghparmar.site
curl.exe --head "https://www.rahulsinghparmar.site/cutover-check?source=www"
npm run deployment:check -- https://rahulsinghparmar.site
```

Require:

- a publicly trusted certificate with no hostname warning;
- certificate coverage for apex and `www`;
- HTTP 200 at the canonical homepage;
- one 308 hop from `www` to the same apex path and query;
- no `Server: GitHub.com` response;
- all 29 deployment checks passing;
- `/api/health`, robots, sitemap, manifest, icons and both social images returning HTTP 200;
- canonical and sitemap URLs using the apex only;
- the expected CSP, frame, MIME, referrer, permissions and cross-origin headers;
- a healthy Coolify container with no restarts or recent repeated 4xx/5xx errors.

After at least one stable observation window, enable Cloudflare DNSSEC and publish the Cloudflare-provided DS record at Namecheap. Re-query DS from two public resolvers. HSTS is optional post-cutover hardening: do not enable preload or `includeSubDomains` during migration, and do not enable HSTS until every covered hostname is permanently HTTPS-safe.

## GitHub Pages cleanup

Perform cleanup only after Cloudflare nameservers are active, Universal SSL is valid, the deployment contract passes externally, and the old 1800-second DNS TTL has elapsed with a safety buffer.

1. Confirm the release tree does not contain `CNAME` or `.github/workflows/static.yml`.
2. Confirm no workflow named **Deploy static content to Pages** runs for the release commit.
3. In GitHub **Settings → Pages**, record the current source and last successful deployment for rollback evidence.
4. Remove the custom domain from the Pages setting if it is still displayed.
5. Under **Build and deployment**, select **Deploy from a branch**, set the branch to **None**, and save. GitHub documents this as the method for deleting the Pages site without deleting the repository.
6. Confirm the repository no longer advertises an active Pages deployment.
7. Keep historical deployments/environment records unless there is a separate retention reason to remove them.
8. Do not delete the repository, rewrite Git history or remove the recorded legacy commit.

## Downtime expectations

The current public service is already degraded: HTTPS fails strict certificate validation, HTTP returns a GitHub 404, and `www` is NXDOMAIN. The migration is therefore repairing an outage rather than taking a healthy application offline.

For a correctly staged cutover:

- application downtime should be zero because Coolify is deployed and verified before DNS changes;
- resolvers may show mixed legacy and new results while nameserver caches expire;
- the current DNS TTL is 1800 seconds, but registrar nameserver propagation can take up to 24 hours;
- Cloudflare Universal SSL can take up to 24 hours after zone activation;
- some clients may temporarily see the legacy GitHub response while others see Coolify;
- do not disable GitHub Pages until the new certificate and route are stable beyond the old TTL.

Schedule the nameserver change during a low-traffic window with at least 24 hours available for monitoring. Do not promise a precise propagation time.

## Rollback process

### Before nameserver change

If the temporary Coolify validation fails, make no DNS change. Inspect the build, application, health and Traefik logs; redeploy the same candidate only after the failure is understood.

### During Cloudflare activation

If imported DNS is incomplete, restore required exported records in Cloudflare before proceeding. Preserve the current Null MX, SPF and DMARC no-mail policy. If DNSSEC or nameserver delegation fails, restore the two Namecheap BasicDNS nameservers and wait for the old delegation to return.

### After traffic reaches Coolify, before Pages cleanup

1. Leave the failed Coolify deployment intact for logs.
2. Confirm the recorded legacy Pages deployment is still available.
3. In Cloudflare DNS, remove the two tunnel CNAME records.
4. Restore the four GitHub Pages apex A records as DNS-only records:

   ```text
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

5. Add `www` CNAME `RahulSinghParmar.github.io` as DNS only if `www` rollback is required.
6. Disable the Cloudflare `www to apex` redirect while diagnosing.
7. Confirm the GitHub Pages custom domain is still configured, then validate apex and `www` externally.
8. Preserve the Null MX, SPF and DMARC no-mail records throughout rollback.

Cloudflare DNS changes normally converge faster than another registrar nameserver change. Use a nameserver rollback only when the Cloudflare zone itself is unavailable or incorrectly delegated.

### After Pages cleanup

Re-enable Pages from the preserved legacy commit/reference before restoring GitHub DNS. If that recovery cannot be completed safely, keep Cloudflare DNS on the tunnel and use Coolify's deployment history to redeploy the last healthy Next.js image or commit.

The application has no database or persistent volume, so rollback requires no data migration.

## Verification checklist

### Git and artifact

- [ ] Local work is synchronized with remote `main` commit `b33129c1db83734cfef02c0e5784f02cdd2187b0` or its verified successor.
- [ ] Final release commit SHA is recorded.
- [ ] `CNAME` and `.github/workflows/static.yml` are absent from the release tree.
- [ ] `npm run quality:check` passes after synchronization.
- [ ] Docker image builds from the exact release commit.
- [ ] Local deployment contract passes 29/29.

### Coolify and Docker

- [ ] Coolify platform health and backup complete successfully.
- [ ] Application uses root `Dockerfile`, branch `main` and internal port `3000`.
- [ ] Build variables contain canonical apex and `v1.0.0`.
- [ ] Runtime status source remains `disabled`.
- [ ] No host port, persistent volume or database is configured.
- [ ] Both HTTP origin domains exist in Coolify.
- [ ] Dockerfile health check is active and container is healthy with zero restarts.
- [ ] Temporary-host deployment contract passes.

### DNS and Cloudflare

- [x] Namecheap zone export is saved securely.
- [x] The domain's no-mail policy is confirmed.
- [x] Cloudflare contains the required Null MX, SPF and DMARC records.
- [x] GitHub A records and `rahulsinghparmar.online` alias are absent from Cloudflare.
- [ ] Apex and `www` CNAME records target the exact tunnel UUID and are proxied.
- [ ] Both tunnel published routes target `http://localhost:80`.
- [ ] `www to apex` 308 redirect preserves path and query.
- [x] Namecheap lists only `julio.ns.cloudflare.com` and `rafe.ns.cloudflare.com`.
- [x] Cloudflare zone status is Active.
- [x] Null MX, SPF `-all` and DMARC `reject` resolve publicly.

### TLS and application

- [x] Universal SSL is Active and covers apex plus `www`.
- [ ] Strict HTTPS succeeds without certificate bypass.
- [ ] HTTP redirects to HTTPS.
- [ ] `www` redirects to apex in one hop.
- [ ] Canonical apex returns HTTP 200 and is not served by GitHub.
- [ ] External deployment contract passes 29/29.
- [ ] Sitemap, robots, manifest, icons and social images return HTTP 200.
- [ ] Container, application, Traefik and tunnel logs show no release-blocking errors.
- [ ] Verification succeeds from a second network/device.

### Stabilization and cleanup

- [ ] Old 1800-second TTL plus safety buffer has elapsed.
- [ ] GitHub Pages source is set to None only after the new route is stable.
- [ ] DNSSEC is enabled through Cloudflare and the new DS is verified after cutover.
- [ ] HSTS remains disabled until a separate post-cutover review.
- [ ] Exact accepted commit is tagged `v1.0.0` only after the external gate passes.

## Authoritative references

- [Cloudflare full DNS setup and nameserver migration](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
- [Cloudflare Tunnel DNS records](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/dns/)
- [Cloudflare apex CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/set-up-cname-flattening/)
- [Cloudflare Universal SSL coverage and activation](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/)
- [Cloudflare Single Redirect settings](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/)
- [Coolify Dockerfile applications](https://next.coolify.io/docs/applications/builds/dockerfile)
- [Coolify health-check precedence](https://next.coolify.io/docs/applications/configuration/health-checks)
- [GitHub Pages custom-domain management](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages deletion/source None](https://docs.github.com/en/pages/getting-started-with-github-pages/deleting-a-github-pages-site)
- [Namecheap nameserver changes](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/)
