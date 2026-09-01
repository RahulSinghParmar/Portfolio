# Release candidate audit

**Candidate:** `v1.0.0`

**Audit date:** 31 August–1 September 2026

**Scope:** Phases 1–11, repository-wide release readiness

**Public target:** [rahulsinghparmar.site](https://rahulsinghparmar.site)

## Executive assessment

The application, documentation and container form a coherent production release. Static quality checks pass, the production image runs as a non-root user, the deployment contract passes locally and publicly, and Lighthouse records full accessibility, best-practice and SEO scores on both audited profiles.

The canonical domain now serves the reviewed Coolify deployment through Traefik and the existing Cloudflare Tunnel. GitHub Pages is disabled, the legacy static source remains preserved as a release, and the production container is healthy with zero restarts and no OOM termination.

No new product features were introduced during this audit. Changes were limited to copy, consistency, cleanup, documentation, validation and release controls.

### Post-audit deployment update — 31 August 2026

- GitHub Pages is unpublished and its custom-domain binding is removed.
- Cloudflare is authoritative, Universal SSL is Active, and the domain's explicit Null MX, SPF and DMARC no-mail policy resolves publicly.
- The final static source is preserved as release `legacy-static-final` at commit `e9caf7735e817431e231a60618c4ecf65a7bcf5c`.
- This was the last pre-cutover snapshot; Phases 19–20 below record the completed release deployment.

### Phase 17 visual regression update — 1 September 2026

- The optimized production interface was audited from 320 to 1920 CSS pixels in system, light and dark themes with full and reduced motion.
- Mobile light-mode topology contrast and narrow-screen Proton Mail wrapping were corrected without changing the design or content architecture.
- Tablet menu focus transfer, scroll lock and focus restoration passed; representative production interactions emitted no console errors or warnings.
- The full matrix and the remaining physical-device/cross-engine boundary are documented in `docs/VISUAL_REGRESSION.md`.

### Phase 18 deployment simplification update — 1 September 2026

- Replaced `next start` with the generated standalone server and assembled public/static assets into one self-contained runtime directory.
- Reduced the Docker runner to one artifact copy; the validated image remained approximately 83.6 MB, non-root, healthy and at zero restarts.
- Passed the local standalone and Docker deployment contracts at 29/29, including direct CSS and portrait responses.
- Confirmed the live Coolify stack contains one portfolio application plus the independent historical `whoami` routing test; UUID-based names are generated deployment identifiers, not duplicate portfolio builds.
- Confirmed the current temporary route returns HTTP 200 but still serves revision `0e0f28d` and the former Team Lead Network Engineer title.
- Added `docs/COOLIFY_OPERATIONS.md` with the single-deployment workflow, safe cleanup boundary and production-domain transition.

### Pre-Phase 19 release preflight — 1 September 2026

- Fetched `origin/main` and confirmed local `main` is neither ahead nor behind base commit `0e0f28d`.
- Confirmed both repository configuration and the base commit identify `RahulSinghParmar <rahulsinghparmar4@protonmail.com>`.
- Reviewed every modified and untracked release path; `git diff --check`, placeholder review and key-pattern scan passed.
- Completed a clean `npm ci` after stopping an obsolete repository-local `next dev` process that held the native compiler file.
- Re-ran the complete quality gate after the clean install; formatting, lint, types, build, performance and 37 SEO checks passed.
- Built image `rahul-portfolio:1.0.0` as `sha256:5918c5475425ea1e8f7885138556e5946bbcf9ff3fc5e45b07716a1c87c99dad` (83,563,353 bytes).
- Verified UID/GID `1001`, healthy state, zero restarts, localhost-only audit binding and the 29/29 deployment contract, then removed the test container.
- Retained the named release image for inspection; no temporary Phase 18 audit image or container remains.

### Phase 19 release-candidate deployment — 1 September 2026

- Committed and pushed candidate `fdbbabcb5bf4292914877a30cfcbb5d71d0fa2da` from `RahulSinghParmar <rahulsinghparmar4@protonmail.com>`.
- Required the GitHub **Release quality** workflow to pass for that exact commit and disabled the unintended legacy Pages publishing configuration without deleting repository history.
- Built `rahul-portfolio:rc`, passed the local 29/29 deployment contract, and verified desktop, tablet and mobile production rendering across light, dark, full-motion and reduced-motion paths.
- Deployed the exact commit to the existing `rahul-portfolio-rc` Coolify application; the replacement container became healthy as user `nextjs` with zero restarts.
- Passed the external 29/29 deployment contract on `portfolio-rc.parmar.homes`.

### Phase 20 production cutover — 1 September 2026

- Added the apex and `www` Coolify Host rules while keeping the application origin on HTTP behind Traefik.
- Added Cloudflare Tunnel routes for both hostnames to `http://localhost:80`; both proxied records target `a757cf29-4ba0-4f78-870b-534d060549be.cfargotunnel.com`.
- Deployed the active `Canonical www to apex` rule as HTTP 308 with path and query preservation and enabled zone-wide **Always Use HTTPS**.
- Verified Cloudflare-authoritative DNS, strict TLS, apex HTTP 200, absence of GitHub response headers and a one-hop HTTPS `www` redirect.
- Passed the production 29/29 deployment contract at `https://rahulsinghparmar.site` and repeated responsive, theme and motion validation against the canonical hostname.
- Observed the production container healthy with zero restarts and no OOM events; all seven Coolify platform components and the Windows `Cloudflared` service passed health checks.
- Removed the obsolete `http://localhost` diagnostic domain from the Coolify application and retained the RC hostname for the 24-hour stabilization window.

## What was audited

- Every visible section: hero, introduction, projects, infrastructure map, experience, automation workflow, certifications, engineering stack, Under the Hood, about content, contact and footer.
- All public copy and typed content modules.
- Raster, vector and generated metadata-image paths.
- `app/`, `components/`, `data/`, `lib/`, `styles` represented by `app/globals.css`, scripts, configuration and dependencies.
- Production build output, route budgets, responsive layouts, client enhancement and runtime behavior.
- Security headers, CSP, status-provider boundary, Docker runtime and tracked environment files.
- Keyboard navigation, focus handling, reduced motion, semantics, live regions and contrast.
- README, contribution policy, security policy, changelog, deployment guide, health checks, metadata, sitemap, robots and structured data.

## 1. Design audit

### Hero

**Assessment:** Strong release composition. The name, role and infrastructure diagram establish the discipline immediately, and the grid remains legible without animation. Desktop and mobile have no horizontal overflow.

**Fixed:** Copy was shortened, stale status language was removed, and the interface no longer implies that an unconnected data source is live. The generated brand icon replaces the malformed legacy favicon.

**Recommendation:** Keep the hero free of a synthetic portrait. If a new portrait is commissioned, use an authentic transparent source with clean hair edges and test it independently against light and dark social surfaces before changing the composition.

### Introduction

**Assessment:** The introduction now reads as an operator's summary rather than a résumé abstract. It connects network leadership, weekend development and homelab work without listing the entire stack.

**Fixed:** Generic claims about innovation and passion were replaced with concrete references to operating networks, PowerShell, Python and self-hosted systems.

**Recommendation:** The generous negative space is intentional on desktop but extends the mobile page. Reduce it only as part of a future design-system revision, not as an isolated patch.

### Projects

**Assessment:** The three projects tell a connected operating story: visibility, failure communication and control-plane access. Their diagrams and incident-oriented fields give more evidence than conventional logo cards.

**Fixed:** Section language was made direct, unverified metrics were excluded, and links are shown only for destinations that can be verified.

**Recommendation:** Project case studies are the densest part of the page. A future minor release may combine the five detail fields into three editorial groups or move deep technical narratives to separate routes. Do not add accordions solely to shorten the page; they would hide recruiter-critical evidence.

### Infrastructure map

**Assessment:** The seven-layer model distinguishes the portfolio from a generic technology badge wall. Labels, descriptions and the static fallback remain understandable when motion is unavailable.

**Fixed:** Interaction is keyboard accessible and no longer depends on hover, color or Canvas animation.

**Recommendation:** Revalidate label wrapping whenever a capability description changes; the current copy fits the tested 1280 px and 390 px viewports.

### Experience

**Assessment:** The current DCO Tech 3 title and engineering practice are clear. The employer, start date and publishable responsibilities for that role remain intentionally absent until verified, while the previous Team Lead Network Engineer role is retained as career history.

**Fixed:** The heading now uses direct operational language and avoids unsupported outcome claims.

**Recommendation:** Add dates, prior roles and measurable operational outcomes only after Rahul confirms they are safe to publish. These are content gaps, not reasons to invent chronology.

### Automation workflow

**Assessment:** The observe, decide, automate and verify sequence supports the operator/developer narrative and has a clear reading order.

**Fixed:** Repetitive “verified” labels and phase-oriented implementation copy were removed.

**Recommendation:** Preserve the current four-stage flow. Add a real runbook or repository link only when one can be public without exposing environment details.

### Certifications

**Assessment:** The section is visually consistent but currently represents only the verified iOS/Swift certificate. This creates a mismatch with the infrastructure-first positioning.

**Fixed:** The certificate is presented as supporting evidence for development rather than being overstated as an infrastructure credential.

**Recommendation:** Infrastructure, network, security or cloud certifications should take priority when verified URLs and dates are available. Until then, one accurate credential is preferable to placeholder badges.

### Engineering stack

**Assessment:** The capability model explains how tools are used instead of presenting an oversized logo cloud. It supports both infrastructure and development audiences.

**Fixed:** Copy duplication and unused content-status metadata were removed.

**Recommendation:** Review the capability data quarterly. GitHub language volume alone should not overwrite real production expertise, but obsolete or unused tools should be removed from the public narrative.

### Under the Hood

**Assessment:** Deployment architecture, pipeline and status boundary make the portfolio itself part of the engineering evidence. The disconnected state is now honest and explicit.

**Fixed:** Removed the stale “Phase 11 not deployed” message, changed prototype `mock` language to `disconnected`, and documented the server-only status adapter.

**Recommendation:** Do not populate uptime or latency with demonstration values. Connect a read-only provider only after the public telemetry and retention policy are decided.

### About

**Assessment:** About content is integrated into the introduction and professional record rather than repeated in a separate biography card. This avoids another generic section and keeps the profile engineering-led.

**Fixed:** Dead About-section CSS from an earlier composition was removed.

**Recommendation:** Keep personal narrative concise. A future authentic portrait could support this area, but only if its visual quality exceeds the current text-led design.

### Contact

**Assessment:** Email, LinkedIn, GitHub, Hashnode and the homelab destination provide clear next actions without a lead-capture form or unnecessary data collection.

**Fixed:** The heading now states the preferred contact route in plain language. No availability claim is made without confirmation.

**Recommendation:** Manually verify LinkedIn after deployment because automated HEAD requests receive LinkedIn's bot-protection response. Run a delivery smoke test against the confirmed Proton Mail address before tagging the release.

### Footer

**Assessment:** The footer closes the network motif without introducing another promotional block.

**Fixed:** Duplicate footer CSS and direct-child paragraph selectors left by the previous composition were removed.

**Recommendation:** Keep the footer static and brief. More badges, counters or animated widgets would dilute the release design.

### Cross-section consistency

Typography, linework, status colors and spacing are consistent across the audited 320, 390, 768, 1280, 1440 and 1920-pixel viewports. The same hierarchy carries across persistent system, light and dark themes, including Canvas and SVG diagrams. The desktop reading experience is intentionally prioritized; mobile remains functional but necessarily stacks the editorial layouts. The repeated large-heading-plus-grid pattern is coherent, though a later redesign could vary one or two section openings after content is reduced.

## 2. Content audit

### Findings corrected

- Replaced generic marketing language with operational statements about availability, recovery, network operations and automation.
- Removed repeated “verified” and phase-status language from the public interface.
- Removed unused `contentStatus` and credential metadata that created maintenance noise without helping readers.
- Kept qualitative project outcomes where no safe measurements exist; no uptime, alert-volume or recovery claims were fabricated.
- Centralized public identity and portfolio content in typed data modules.

### Verified content still needed

`CONTENT_TODO.md` records the remaining evidence Rahul must supply: current-role employer and dates, measurable outcomes, additional previous roles, infrastructure certifications, public résumé choice and monitoring-policy decisions. None blocks the software artifact, but incomplete experience and certification evidence limits recruiter depth.

## 3. Image audit

### Runtime and archived assets

| Asset                               |  Dimensions |      Size | Decision                                                                                                                                    |
| ----------------------------------- | ----------: | --------: | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/images/rahul.webp`          | 1914 × 1914 | 176,778 B | Retained as the authentic, optimized identity image used by metadata; extraction edges remain imperfect, so it is not forced into the hero. |
| Generated Open Graph/Twitter card   |  1200 × 630 | generated | Retained; consistent network-grid brand, readable title and no synthetic likeness.                                                          |
| Generated browser icon              |     64 × 64 | generated | Retained; appropriate at small sizes.                                                                                                       |
| Generated Apple icon                |   180 × 180 | generated | Retained.                                                                                                                                   |
| `docs/assets/legacy-favicon.ico`    |   217 × 256 | 229,438 B | Removed from runtime and archived; malformed aspect ratio and excessive size.                                                               |
| `docs/assets/legacy-portfolio.webp` | 1920 × 1080 |  53,032 B | Removed from runtime and archived; historical screenshot only.                                                                              |

### Source portrait review

Six high-resolution PNG files under the ignored `myphotos/` directory were inspected. Three are 1086 × 1448 and three are 1023 × 1537; file sizes range from 1,877,715 B to 2,262,954 B. The strongest composition is `ChatGPT Image Jun 30, 2026, 03_32_47 PM.png` because it has the closest crop and most direct eye contact.

None was promoted to a public asset. The images have a visibly synthetic, studio-generated treatment and would conflict with the release goal of removing AI-generated presentation cues. The existing authentic WebP is a better identity source even with imperfect hair-edge extraction. A real high-resolution source photo is the correct future replacement for the hero, About and social card; a face is not an appropriate favicon at 16–64 px.

## 4. Architecture audit

### Findings corrected

- Removed obsolete About, Contact and stack-index CSS selectors plus duplicate footer rules; `app/globals.css` fell from 3,007 to 2,832 lines.
- Removed unused typed content fields and stale state terminology.
- Moved legacy assets out of runtime paths.
- Confirmed that all six runtime dependencies are imported and used.
- Confirmed no unused component could be removed without deleting a rendered section or progressive enhancement path.
- Added one composite `quality:check` command and a matching GitHub workflow rather than duplicating build logic.

### Residual maintainability items

- `app/globals.css` is a 2,832-line monolith. It is stable and tokenized, but section-level CSS modules would make ownership easier in a future refactor.
- `InfrastructureNetwork` and `MotionRuntime` are the largest components. Both are cohesive and purpose-specific; splitting them now would add indirection without reducing runtime cost.
- The four client boundaries are justified by navigation, capability interaction, motion enhancement and read-only status. The rest of the page remains server-rendered.
- The local installation contains two extraneous optional imaging packages, but they are not declared in the lockfile; a clean `npm ci` in Docker does not reproduce the issue.

## 5. Performance audit

### Enforced route budgets

| Metric                     | Measurement |  Budget | Result |
| -------------------------- | ----------: | ------: | ------ |
| Home HTML, raw             |   140.6 KiB | 160 KiB | Pass   |
| Initial JavaScript, raw    |   585.3 KiB | 620 KiB | Pass   |
| Initial JavaScript, Brotli |   156.7 KiB | 190 KiB | Pass   |
| Initial CSS, raw           |    50.9 KiB |  64 KiB | Pass   |
| Critical route, Brotli     |   180.3 KiB | 225 KiB | Pass   |
| Public raster assets       |   172.6 KiB | 350 KiB | Pass   |
| Largest public raster      |   172.6 KiB | 200 KiB | Pass   |

The raw HTML budget was raised from 140 KiB to 160 KiB because the candidate was consuming 99% of the former limit. The compressed route budget was not loosened.

### Lighthouse

| Profile | Performance | Accessibility | Best practices | SEO |   FCP |   LCP |   TBT | CLS | Speed index |
| ------- | ----------: | ------------: | -------------: | --: | ----: | ----: | ----: | --: | ----------: |
| Desktop |         100 |           100 |            100 | 100 | 0.3 s | 0.7 s |  0 ms |   0 |       0.5 s |
| Mobile  |          94 |           100 |            100 | 100 | 1.0 s | 3.1 s | 50 ms |   0 |       1.7 s |

The remaining mobile opportunity is approximately 55 KiB of unused JavaScript in shared Next.js/React chunks. Application motion libraries are capability-gated and are not part of the initial mobile route. Replacing the framework or compromising the static-first architecture is not justified for this release.

Canvas rendering is capped at 30 FPS and 1.5 device-pixel ratio, stops off-screen and is omitted for reduced-motion, low-power and data-saving clients. Touch and mobile devices retain progressive motion instead of being rejected solely by pointer type or viewport width. Status fetching is deferred until its section approaches the viewport and pauses when it leaves.

## 6. Security audit

### Passed controls

- Repository scan found no API keys, bearer tokens, passwords or private-key material.
- Environment files are ignored; only `.env.example` is tracked.
- The status token remains server-only and the production provider URL must use HTTPS.
- `npm audit --omit=dev --audit-level=high` found zero vulnerabilities.
- Docker uses deterministic `npm ci`, a multi-stage standalone build and UID/GID `1001` at runtime.
- CSP, frame denial, MIME sniffing protection, referrer, permissions, cross-origin opener and cross-origin resource policy headers are present.
- The application exposes only shallow read-only health/status routes and no database, authentication flow or write endpoint.

### Residual risks

- CSP requires `'unsafe-inline'` for current Next.js script/style output. Nonce-based CSP would force dynamic rendering and a different caching model; evaluate it as a deliberate security architecture change.
- HSTS is intentionally owned by Cloudflare and cannot be confirmed until the hostname cutover is repaired.
- Docker installation emits a deprecation notice for ESLint 9.39.5. It is a development dependency, not a runtime vulnerability, but should be addressed with the next supported Next.js lint-toolchain update.

## 7. Accessibility audit

- Lighthouse accessibility: 100/100 desktop and mobile, zero scored failures.
- One ordered heading hierarchy and semantic header, navigation, main, section and footer landmarks.
- Skip link targets a programmatically focusable main element.
- Mobile navigation contains focus, supports Escape, restores focus and makes the background inert.
- Capability controls and links are keyboard operable with visible two-pixel focus indicators.
- Diagrams have accessible names; live status uses a polite atomic region.
- Reduced-motion users receive the complete static SVG composition without Canvas or scroll animation.
- System, light and dark themes initialize before paint, persist across reloads and expose a keyboard-operable control within the mobile focus boundary.
- No user-facing horizontal overflow was observed from 320 to 1920 CSS pixels.
- Audited text token contrast ranges from 5.12:1 to 16.72:1 across the dark and light backgrounds and meets WCAG AA.

Outstanding: perform one NVDA plus Chrome or Firefox smoke test before changing navigation, live regions or heading structure. When Apple hardware is available, add VoiceOver plus Safari to the release checklist.

## 8. Release readiness audit

### Contributor path

A new contributor can clone, run `npm ci`, optionally copy `.env.example`, start development, execute the composite quality gate, build Docker and follow the Coolify/Cloudflare guide. README commands and environment-variable scope now match the implementation.

### Verified artifacts

- `README.md`: complete architecture, operation, deployment, versioning and licensing guide.
- `CHANGELOG.md`: `v1.0.0` entry using Keep a Changelog categories.
- `.env.example`: safe disconnected defaults and documented optional provider values.
- `Dockerfile`: standalone non-root runtime with native health check.
- `docs/DEPLOYMENT.md`: Coolify, Traefik, Cloudflare, validation and rollback contract.
- `/api/health`: independent of optional telemetry.
- Metadata routes: canonical, robots, sitemap, manifest, icons and generated social images.
- Structured data: Person, WebSite, ProfilePage and selected work from typed source data.
- GitHub workflow: formatting, lint, typecheck, build, budgets, SEO, server smoke test and Docker build.

### Local release evidence

- `npm run quality:check`: pass.
- SEO release contract: 35/35 checks pass.
- Docker image `rahul-portfolio:rc`: 83,561,202 B, healthy, zero restarts during audit.
- Local deployment contract: 29/29 checks pass.
- Production browser console: no errors or warnings during audited routes and interactions.
- External project, GitHub, Hashnode, homelab and certificate destinations returned HTTP 200. LinkedIn returned its bot-protection status and requires manual confirmation.

### Public release evidence

The canonical deployment now satisfies the public release contract. The apex serves the reviewed application through Cloudflare, `www` redirects with HTTP 308 while preserving the request path and query string, plain HTTP upgrades at the edge, and all 29 automated deployment checks pass without certificate bypass.

The Phase 21 documentation-only release commit must pass the same GitHub and Coolify gates before its exact SHA is tagged `v1.0.0`. The application content and runtime architecture are unchanged from accepted candidate `fdbbabc`.

## Issues fixed in Phase 12

- Humanized generic and repetitive copy across the page.
- Removed stale phase/deployment statements and dishonest prototype status language.
- Removed dead CSS, typed fields and runtime legacy assets.
- Corrected the browser-icon path and retained appropriate generated social assets.
- Added missing cross-origin security headers and deployment assertions.
- Added a composite local quality gate and pull-request/main GitHub workflow.
- Rebuilt README, contribution, conduct, security and deployment documentation.
- Added semantic versioning and a production changelog.
- Recalibrated the raw-HTML budget to preserve regression headroom without relaxing the compressed route limit.

## Issues fixed in Phase 17

- Raised the mobile light-theme opacity of the static topology, with an explicit reduced-motion treatment.
- Prevented the Proton Mail address from producing an orphaned final line at narrow mobile widths.
- Revalidated the production build across system, light and dark themes, full and reduced motion, mobile navigation and 320–1920-pixel viewports.
- Documented intentional decorative overflow separately from user-facing clipping and recorded the remaining cross-browser boundary.

## Issues fixed in Phase 18

- Eliminated the unsupported `next start` plus standalone-output combination.
- Made the standalone directory independently runnable by including public and hashed static assets during `postbuild`.
- Simplified the runtime image to one application-artifact copy without changing its non-root or health contract.
- Audited live Docker state and separated Coolify control-plane services, the one portfolio deployment and the obsolete routing smoke test.
- Replaced the stale “repository authorization” task with the actual remaining action: deploy the final reviewed commit.
- Added an operator-facing Coolify runbook that explains build creation, generated names, cleanup and rollback.

## Outstanding items

### Blocking

- None.

### Non-blocking release-content decisions

- Smoke-test the confirmed Proton Mail route and manually verify LinkedIn.
- Supply safe employment dates, prior roles and measurable outcomes.
- Add verified infrastructure/security/cloud certifications.
- Decide whether a read-only monitoring source and its retention policy are safe to publish.

### Future maintenance

- Consider section-level CSS modules when a real design revision justifies the migration.
- Pin GitHub Actions to reviewed commit SHAs.
- Add authentic high-resolution photography if a suitable source becomes available.
- Re-evaluate nonce-based CSP only with an explicit dynamic-rendering and cache plan.

## Release recommendation

The repository, container and production route satisfy the release contract. Proceed with the documentation-only final commit, require CI and Coolify to accept that exact SHA, then create the annotated `v1.0.0` tag and GitHub release. No additional product feature work is required.

# RELEASE STATUS

## READY FOR RELEASE

**Justification:** the reviewed code, simplified standalone container, canonical Cloudflare/Tunnel route and Coolify runtime pass the local, CI and public release gates. The production contract is 29/29, the container is healthy with zero restarts, and the only remaining release operation is to tag and publish the exact Phase 21 commit after its final CI and deployment verification.
