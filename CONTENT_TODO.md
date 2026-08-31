# Content still needed

Only verified information is published. These items are content or provider decisions, not invented release blockers.

## Projects

The project narratives were derived from public implementations and Rahul's confirmed homelab context. Future refinements:

- Add a public repository URL for the Homelab Dashboard if its configuration is open-sourced.
- Replace qualitative outcomes with measured uptime, alert-volume or recovery-time data when a safe telemetry source exists.
- Confirm whether the Homelab Dashboard should use a specific launch year instead of `Current`.

## Experience

- Exact start/end dates for the current role.
- Previous employers, roles, locations and dates to include publicly.
- Confirm which responsibilities or outcomes may be published.
- Any measurable reliability, incident, delivery or automation improvements.

## Certifications

- Infrastructure, networking, security or cloud certifications to prioritize.
- Issuer, issued date, credential ID and public credential URL for each.

The verified iOS/Swift certificate remains visible because it supports the development side of the profile. It can be deprioritized when relevant infrastructure credentials are added.

## Contact and identity

- Public resume URL or PDF.
- Confirm whether the public email should remain `rahulsinghparmar4@gmail.com`.
- A formal availability or open-to-work statement, if desired. The current contact copy does not make an availability claim.

## Deployment telemetry

- Coolify server region safe to publish.
- Monitoring source and read-only integration method.
- Whether response time and uptime can be exposed publicly.
- Production monitoring exposure policy and data-retention expectations.

The adapter and public API boundary are implemented in disconnected mode. Live values remain intentionally blank until these decisions are confirmed and server-only environment variables are configured.

## Deployment activation

- Completed: removed the GitHub Pages custom-domain binding, unpublished Pages and synchronized remote commit `b33129c` (`Delete CNAME`).
- Completed: activated Cloudflare authoritative DNS with `julio.ns.cloudflare.com` and `rafe.ns.cloudflare.com`; removed the legacy GitHub web records.
- Completed: verified Universal SSL for the apex and wildcard plus an explicit no-mail policy using Null MX, SPF `-all` and DMARC `reject`.
- Completed: archived the final static source as the GitHub release `legacy-static-final` at commit `e9caf773`.
- Remaining: authorize the repository in Coolify and validate the exact candidate on a temporary hostname.
- Remaining: create apex and `www` tunnel routes, proxied DNS records, the `www` redirect and the HTTPS enforcement rule.
- Remaining: run the 29-check external release gate and tag `v1.0.0` only after it passes.
