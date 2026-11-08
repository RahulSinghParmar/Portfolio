# Portfolio production review — 8 November 2026

Scope: existing Cloudflare portfolio, live v1.1.0 inspection, source review and a locally validated refinement candidate. No commit, push, tag, DNS change or deployment is performed by this review.

## Findings and changes

| Area             | Finding                                                                                                                                                                  | Refinement                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Motion           | The live build animates in the review desktop browser, but silently disables motion for reported CPU counts of two or fewer. Users cannot inspect or change that choice. | Removed the CPU-count rule; one shared Auto/On/Off policy controls GSAP, Canvas and CSS. Footer control persists a choice; Auto observes reduced-motion/data-saving changes.         |
| Motion lifecycle | GSAP import errors were silently swallowed, and cleanup was installed after animation construction. Infinite project-route tweens also ran off screen.                   | Cleanup is registered before animation work; stale async initialization is ignored; route tweens pause outside their section. Static content remains the fallback.                   |
| Runtime signal   | Production `/api/system-status` returns `disconnected` because every environment deliberately disables the external source.                                              | Default UI now reads the real `/api/health`, displaying version, this request's round-trip time and last check with an explicit scope. Optional service monitoring remains separate. |
| Editing          | Data modules already existed, but hero name, initials, metadata, social cards, project counts and contact handles required edits elsewhere.                              | One schema-backed `content/portfolio.json` drives public information, with small rendering adapters and automatically generated counts/labels.                                       |
| Career/education | Only one education block could be rendered; current job facts were duplicated.                                                                                           | Multiple education records are supported. The current career entry inherits the shared profile; historical entries retain their own facts.                                           |
| Projects         | Adding work required a custom diagram and detailed engineering paragraphs.                                                                                               | A new project can start with summary fields and links. Diagram, deep-dive copy and metrics are optional; empty disclosures are omitted.                                              |
| Copy             | Introduction/About repeated the same line; delivery copy still described a future cutover.                                                                               | Distinct About heading and current delivery description; work heading no longer hard-codes three projects.                                                                           |
| Accuracy         | Maintenance project claimed a 30-second retry/five failure codes. Public source currently specifies 45 seconds/eleven codes.                                             | Updated retry copy and project metrics, with no invented outcomes.                                                                                                                   |
| Images/SEO       | Existing transparent portrait is small and suitable; social-card identity was hard-coded. Manifest icon pointed at an extensionless asset.                               | Preserved the optimized portrait, generated cards/icons from configured identity and linked the named PNG icon.                                                                      |
| Dependencies     | Old Next.js, Sharp and build-tool dependency versions had advisory findings.                                                                                             | Updated Next.js/eslint config to 16.4.5, Sharp to 0.35.5 and Wrangler to 4.158.0; refreshed compatible transitive fixes.                                                             |
| Verification     | API/build checks could pass without proving visible animation.                                                                                                           | Added production-browser checks and a mobile axe accessibility scan to CI after the local Worker starts.                                                                             |

## Design and architecture assessment

The transparent portrait, full-bleed topology, restrained palette and editorial project sections fit the work. Preserving them is preferable to adding more unrelated effects. The static export plus isolated API Worker remains appropriate: there is no need for an always-on application server or database to edit biography content.

The new content schema is intentionally explicit rather than an unrestricted page builder. Routine résumé changes are easy, while a different capability-map layout remains a design task. The seven-layer diagram is still infrastructure-specific; fork documentation calls this out. Core presentation remains in components, with no CMS account or new runtime write endpoint.

Repository presentation is now more consistent, but the detailed case studies still make a long page. Existing mobile disclosures help. The next useful content improvement is a concise, evidence-backed Python/PowerShell development case study; the owner should choose a real implementation and measured outcome rather than adding filler or invented achievements.

The Dockerfile is historical standalone v1.0.0 packaging and is incompatible with today's static-export output. It is explicitly documented as archival; this candidate is validated for Cloudflare, not as a new Docker release. Roll back using an archived release/image rather than building that old Dockerfile against the current source.

## Verification record

Local validation covers:

- Content schema, duplicate/reserved project slugs, public portrait existence and identity metadata.
- Formatting, lint, TypeScript, Worker failure-handling tests, static export, SEO and artifact performance budgets.
- Wrangler dry-run and Worker/static asset package limits.
- Local Cloudflare HTTP contract, including headers, cache policy, real 404s and metadata assets.
- Chromium/Edge browser checks at 320, 390, 820 and 1440 pixels: animation with two reported cores, changing Canvas frames, portrait, both themes, overflow, keyboard menu behavior, real health display and persistent motion off.
- OS reduced-motion default and explicit user override; content/contact access without JavaScript.
- Automated mobile accessibility scan for WCAG A/AA rules supported by axe.

Final outcomes: `npm run release:check` passed, including formatting, lint, TypeScript, all sixteen Worker tests, static build, performance/SEO checks, dry-run and package limits. All 73 local deployment checks passed. The production-browser matrix passed, including connected/degraded versus unavailable monitor cases, reduced-motion controls and reading without JavaScript. The mobile light-theme axe scan reported no violations for the selected WCAG rule tags; that automated result is not a full accessibility certification.

Measured artifact: 154.6 KiB raw home HTML, 600.9 KiB initial raw JavaScript / 161.4 KiB Brotli, 188.3 KiB compressed critical route, 53.5 KiB transparent portrait, and an 11.2 KiB API Worker. The current page remains below the original 160 KiB HTML budget; future content allowance scales with the project count while transfer/JavaScript ceilings remain fixed. Targeted credential-pattern scanning found no matches in publishable source; it is not an exhaustive secrets audit.

Schema probes also accepted a minimal project without a diagram, multiple degrees and empty optional social/credential arrays, and rejected an invalid project slug. Interactive components receive only the profile fields/skills they use rather than importing the complete content file.

Browser artifacts are local under ignored `release-artifacts/browser-review/`; they are not published or included in the asset bundle.

## Outstanding items and limits

1. External homelab monitoring is not connected. The default portfolio health view is functional; see [STATUS_INTEGRATION.md](STATUS_INTEGRATION.md) for the real endpoint contract and setup.
2. The live Cloudflare page injects an analytics beacon which its current CSP blocks. This does not explain the working GSAP/Canvas test, but analytics collection is affected. Decide whether to disable automatic Web Analytics injection or deliberately allow its exact domains; this review does not silently enable additional tracking.
3. The full dependency audit still reports eight moderate development-tool findings in the ESLint/typescript-eslint/minimatch chain. The production dependency audit is clear. An npm-recommended force fix would downgrade the Next ESLint config across major versions; it was not applied. Track the upstream fix rather than claiming a zero-finding full audit.
4. Real iOS Safari, Firefox, physical-device low-power behavior and assistive-technology review remain manual acceptance checks. Chromium viewport tests do not certify those engines or screen readers.
5. No live monitoring credentials, private photographs or new external account integrations have been uploaded. GitHub CLI authentication was expired during the public-source audit; the maintenance claim was verified through its public raw source instead.

## Recommended release path

The next release candidate is v1.2.0, with its package, environment examples and Worker version values synchronized. Review the local preview and remaining limits, then commit the candidate, use the protected preview workflow, review the hosted result and promote through the existing production reviewer. The public v1.1.0 tag remains unchanged. Release notes are in [releases/v1.2.0.md](releases/v1.2.0.md); a new public tag is created only after acceptance.

The priority integrations are a sanitized heartbeat summary, a build-time writing feed, automated preview publication with protected production, and a printable résumé from the same JSON. Each should have an independent fallback and a clear reason to exist. A Spotify embed or game is optional personality rather than a production-readiness requirement.

**Candidate status: READY FOR PROTECTED PREVIEW.** All local release checks pass. A hosted preview plus the physical-device/cross-engine acceptance review remains before public promotion. The optional homelab monitor does not block the default health view. The development-only audit findings and blocked live analytics beacon remain recorded above rather than being presented as resolved.
