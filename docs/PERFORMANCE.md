# Performance baseline

Performance is treated as a release constraint rather than a one-time score. The portfolio keeps a fully rendered server response, then adds motion only when the device and user preferences can support it.

## Critical-path strategy

- The page remains a statically prerendered Server Component route.
- GSAP, ScrollTrigger and Lenis are imported after hydration and only on fine-pointer devices with sufficient viewport, hardware and network capacity.
- Mobile, coarse-pointer, reduced-motion, low-power and data-saving clients keep the static SVG composition and do not request the motion libraries.
- The Canvas network renders at 30 FPS, caps its pixel ratio and pauses outside the viewport.
- The system-status request and polling interval activate only when the status interface is within 600 px of the viewport, and polling stops again when it leaves that range.
- Raster source assets use WebP with transparency preserved where required.

## Enforced budgets

Run a production build before checking budgets:

```bash
npm run build
npm run performance:check
```

The budget script profiles the prerendered home route from `.next/server/app/index.html`, measures its actual initial script and stylesheet references, calculates Brotli sizes, and audits public raster assets.

| Metric                      | RC measurement |  Budget |
| --------------------------- | -------------: | ------: |
| Home HTML, raw              |      138.8 KiB | 160 KiB |
| Initial JavaScript, raw     |      582.6 KiB | 620 KiB |
| Initial JavaScript, Brotli  |      156.0 KiB | 190 KiB |
| Initial CSS, raw            |       48.1 KiB |  64 KiB |
| Critical home route, Brotli |      178.6 KiB | 225 KiB |
| Public raster assets, total |      172.6 KiB | 350 KiB |
| Largest public raster asset |      172.6 KiB | 200 KiB |

The raw HTML budget includes the semantic SVG topology labels used when animation is unavailable. The release audit raised that budget from 140 KiB to 160 KiB to preserve practical regression headroom; the compressed critical-route budget remains unchanged.

## Lighthouse review

Measured locally on 31 August 2026 against the optimized production build with Chrome Lighthouse simulation. Scores can vary by machine, Chrome version and background activity.

| Profile | Performance |   FCP |   LCP |   TBT | CLS | Speed Index |
| ------- | ----------: | ----: | ----: | ----: | --: | ----------: |
| Desktop |         100 | 0.3 s | 0.7 s |  0 ms |   0 |       0.5 s |
| Mobile  |          94 | 1.0 s | 3.1 s | 50 ms |   0 |       1.7 s |

The remaining Lighthouse unused-JavaScript estimate is approximately 55 KiB and comes from shared Next.js/React framework chunks rather than the deferred motion libraries. The application-specific motion payload is no longer part of the initial route.

## Regression workflow

For every release:

1. Run formatting, linting, type checking and the production build.
2. Run `npm run performance:check` and treat a failed budget as a release blocker.
3. Run desktop and mobile Lighthouse against a production server when dependencies, layouts or animation behavior change materially.
4. Confirm the initial home view does not request `/api/system-status`; the request should appear only when approaching the Under the Hood section.
5. Confirm mobile reports `data-motion="reduced"`, uses the static topology and has no horizontal overflow.
