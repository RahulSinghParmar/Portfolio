# Updating and publishing the portfolio

## Where the website runs

GitHub stores the source and release history. GitHub Actions builds the Next.js static export and uploads the files and API Worker to Cloudflare. Cloudflare serves visitors; neither your computer, Docker, Coolify nor your home Internet connection is required for this hosting path. Optional external data sources can still fail independently.

```text
Edit locally → review a pull request → merge main
             → deploy preview → review preview
             → approve production → Cloudflare serves the update
```

A Git commit, push, merge or release tag does **not** automatically publish this project. The `Deploy Cloudflare portfolio` workflow is manually dispatched and production has a separate approval gate. Cloudflare Workers Builds must stay disconnected so there is only one publisher.

## Stable release reference

- Version: `v1.1.0`
- Source: `5b90316cabbe175d1daf5a33493b4d62383eb5b7`
- [GitHub release](https://github.com/RahulSinghParmar/Portfolio/releases/tag/v1.1.0)
- Production Worker: `rahul-singh-parmar-portfolio`
- Preview Worker: `rahul-singh-parmar-portfolio-preview`
- Intended public address: `https://rahulsinghparmar.site`
- Preview: `https://rahul-singh-parmar-portfolio-preview.rahulsinghparmar4.workers.dev`

The release tag is immutable. Documentation added after the release may have a newer commit without changing the application deployed from the tagged commit. See `PUBLIC_LAUNCH.md` for verified cutover status rather than assuming that a successful upload has connected the public domain.

## 1. Edit and test locally

Use Node.js 22 and the committed lockfile. From the repository directory:

```powershell
npm ci
npm run dev
```

See [Editing portfolio content](CONTENT_EDITING.md) for the source-of-truth fields. Routine edits belong in `content/portfolio.json`; `data/` contains rendering adapters. Do not put passwords, service tokens or private employer information in the public content file.

Stop the preview or development process with Ctrl+C before a clean release build, particularly on Windows where it can hold output files open.

```powershell
npm run release:check
npm run preview:cloudflare
```

The second command starts the local production-style Cloudflare preview on port 8788. Check both themes, motion preferences, keyboard controls, links and a narrow viewport. This does not publish anything. LAN testing requires a deliberate network binding and firewall rule; do not expose an administration dashboard.

## 2. Review the source

Commit a focused branch under your own Git identity, push it and open a pull request against `main`. Review the diff and wait for Release quality to pass before merging. Synchronize local `main` with `git pull --ff-only` after the merge, then obtain its exact SHA with `git rev-parse HEAD`.

For application releases, update the package version/lockfile, `SITE_VERSION` values, changelog and release notes consistently before review. Use patch versions for fixes, minor versions for backward-compatible improvements and major versions for breaking changes. Never retag an already published release to point at different source.

## 3. Deploy the reviewed preview

1. Open GitHub → `RahulSinghParmar/Portfolio` → Actions → **Deploy Cloudflare portfolio**.
2. Select **Run workflow**, branch `main`, target `preview`.
3. Set `confirmed_sha` to the full SHA of the reviewed `main` commit. If `main` changes before dispatch, stop and review the new commit; the workflow intentionally rejects a mismatch.
4. Wait for the workflow to finish successfully.
5. Open the preview URL above and repeat the browser/device review.
6. Run the deployment checks against that preview:

```powershell
$env:DEPLOYMENT_EXPECTED_ENV = "preview"
try {
  npm run deployment:check -- https://rahul-singh-parmar-portfolio-preview.rahulsinghparmar4.workers.dev
} finally {
  Remove-Item Env:DEPLOYMENT_EXPECTED_ENV -ErrorAction SilentlyContinue
}
```

Do not promote a candidate with failed checks or unreviewed visual changes.

## 4. Approve production

1. In GitHub Settings → Secrets and variables → Actions → Variables, temporarily set repository variable `PRODUCTION_DEPLOYMENT_ENABLED` to `true`.
2. Run the same workflow from `main`, target `production`, with the exact SHA accepted in preview. If `main` advanced, revalidate the new candidate first.
3. Open the run, choose **Review deployments**, select `cloudflare-production` and approve it as the configured reviewer.
4. Wait for both validation and production deployment to succeed. Save the run URL, source SHA and Cloudflare Worker version ID from the deployment log.
5. Restore `PRODUCTION_DEPLOYMENT_ENABLED` to `false`, including when the operation fails or is paused. This prevents a new deployment; it does not switch off the running website.
6. Check the public address and run:

```powershell
$env:DEPLOYMENT_EXPECTED_ENV = "production"
try {
  npm run deployment:check -- https://rahulsinghparmar.site
} finally {
  Remove-Item Env:DEPLOYMENT_EXPECTED_ENV -ErrorAction SilentlyContinue
}
```

Verify `www` and HTTP redirect to the HTTPS apex without losing path/query, `/api/health` reports the intended version and environment, and an unknown page returns a genuine 404. Repeat the visual checks on the public build. Publish the matching GitHub release only after the intended candidate is accepted.

## Domain ownership and future deployments

The one-time cutover replaces portfolio tunnel DNS with a production Worker Custom Domain and an edge `www` redirect. Routine content releases must not change DNS, reconnect Coolify, attach the maintenance Worker to the apex, or modify any `parmar.homes` routing.

`wrangler.jsonc` deliberately omits production routes. Custom Domains are managed in the Cloudflare dashboard. The release used Wrangler 4.129.0; this refinement updates to 4.158.0 and rechecks that its implementation skips route/domain publication when those lists are empty. Recheck this behavior before future Wrangler upgrades or adding routes; do not let two mechanisms compete to manage the same hostname.

Production credentials remain GitHub environment secrets. Do not copy them to this guide, source files or the future prototype. Keep the required reviewer and `main` restriction. Do not enable Cloudflare Workers Builds alongside Actions.

## Recovery

Record the previous known-good Worker version before every promotion. If a new upload is faulty, use Cloudflare's deployment rollback to that verified version and repeat the public checks, then fix the source through a reviewed PR. Do not rebuild an old tag from a changed lockfile or move the tag.

For a first-launch routing failure, use the saved operator cutover record. Restoring an old tunnel CNAME does not restore an intentionally stopped origin. Never start a paused home-server workload implicitly. Keep DNS, routing and application rollback separate.

## Independent 3D project

The experimental successor has its own local directory and Git repository, `Portfolio-3D`, alongside this checkout. Its README and `docs/HANDOFF.md` describe the prototype, public content copies, private reference photos and future phases. It has no production remote or deployment configuration. Changes there do not update this website.

Do not import the stable deployment workflows from its historical source archive. Choose a separate GitHub repository and separate preview/Worker names when that project is ready to publish.
