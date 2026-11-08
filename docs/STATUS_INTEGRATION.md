# Runtime signal and optional homelab monitoring

## What visitors see by default

No external monitoring account is needed for the default Runtime signal. The browser requests `/api/health` and `/api/system-status` when the panel approaches the viewport. With `SYSTEM_STATUS_SOURCE=disabled`, the panel displays the portfolio's health check: version, round-trip request time, last check and check scope.

This proves only that the portfolio's health endpoint answered that visitor's request. It is not a historical availability percentage, an origin CPU/memory measurement, or evidence that every homelab service is running. Checks repeat approximately once a minute while the panel is near the viewport and the tab is visible. The Refresh button requests a new observation.

`/api/system-status` intentionally still reports `source: disconnected` when no external monitor is configured. That is a configuration state, not a portfolio outage. The UI uses the separate health result rather than displaying a broken-looking integration placeholder.

## Connect a real monitoring source

Use a dedicated read-only HTTPS JSON endpoint. A dashboard HTML page, Docker socket, Coolify control API or Cloudflare account token is not a suitable source. The existing heartbeat project would need a small authenticated status-export endpoint before it can be connected; a scheduled probe alone does not create one.

The upstream response can use this contract:

```json
{
  "status": "All monitored services operational",
  "checkedAt": "2026-11-08T12:00:00Z",
  "services": [
    { "name": "Dashboard", "state": "operational", "responseTimeMs": 120 },
    { "name": "File service", "state": "operational", "responseTimeMs": 180 }
  ]
}
```

The timestamp is an example; publish the actual observation time. Optional fields include `region` and `uptimePercent`, but publish uptime only if your monitor actually calculates it over a defined interval. The portfolio computes mean response from provided service timings. Raw internal URLs, IP addresses, credentials and private service metadata must stay out of this public response.

### Test locally

1. Copy `.dev.vars.example` to the ignored `.dev.vars` file.
2. Set `SYSTEM_STATUS_SOURCE=http`, `SYSTEM_STATUS_URL` to your HTTPS endpoint and `SYSTEM_STATUS_TOKEN` to that endpoint's read-only bearer token if required. Do not use an account administration token.
3. Start `npm run preview:cloudflare`.
4. Inspect `http://127.0.0.1:8788/api/system-status`: a working source should return `source: live` and normalized service states.
5. Scroll to Runtime signal. Confirm actual values, then test an unavailable endpoint and a real service failure separately. Do not populate the panel with invented uptime data.

The relay requires JSON, rejects redirects, applies a bounded timeout, reads at most 64 KiB and emits at most twelve services. Tokens stay inside the Worker. Requests and responses are not cached. Automated Worker tests exercise failures, body limits, redirects and timeout handling.

### Publish configuration through the existing release path

Non-secret values belong in the relevant `wrangler.jsonc` environment's `vars`: `SYSTEM_STATUS_SOURCE=http`, `SYSTEM_STATUS_URL=https://your-status-source.example/status`, and `SYSTEM_STATUS_TIMEOUT_MS=3500`. `.env` is not automatically uploaded as Cloudflare runtime configuration.

Store any bearer token separately with Wrangler's secret command for the intended environment, then deploy the reviewed preview through GitHub Actions. Review the preview before production promotion. A runtime URL is not itself a secret, but the endpoint must return only safe fields. Never place tokens in `content/portfolio.json`, `NEXT_PUBLIC_*` variables or GitHub source.

Disable the source again by setting its mode to `disabled` and redeploying. The default portfolio-health view returns automatically. Failure of a configured homelab monitor is displayed as a monitor failure, not silently relabelled as a healthy homelab because the portfolio is online.

## Useful future integrations

1. **Heartbeat public summary:** highest relevance to the infrastructure story; requires a sanitized export endpoint and an honest observation timestamp.
2. **Build-time Hashnode feed:** publish a small selected-articles list during the build, retaining cached/local editorial choices if the feed is unavailable. No browser API token is needed for public RSS.
3. **Reviewed preview automation:** run preview publication after accepted source changes and retain the existing approval before production. Keep one deployment owner.
4. **Print résumé view:** derive a clean printable document from the same content file so facts cannot diverge between the website and résumé.
5. **Git-backed editor:** a later browser form could edit the JSON through a pull request. Authentication and a review step would be needed; it should not add a public write API to this portfolio.

These are recommendations, not connected services in this build. Additional 3D scenes, games and character work remain in the separate prototype project rather than expanding the stable site's initial JavaScript.
