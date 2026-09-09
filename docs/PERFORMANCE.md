# Performance baseline

Performance is treated as a release constraint rather than a one-time score. The portfolio keeps a fully rendered server response, then adds motion only when the device and user preferences can support it.

## Critical-path strategy

- The page remains a statically prerendered Server Component route.
- GSAP, ScrollTrigger and Lenis are imported after hydration when motion preferences, hardware and network capacity permit.
- A dependency-free inline initializer applies the stored or system color theme before first paint.
- Reduced-motion, low-power and data-saving clients keep the static SVG composition and do not request the motion libraries. Touch and mobile devices are not classified as low-power solely by pointer type or viewport width.
- The Canvas network renders at no more than 30 FPS on desktop/tablet and 20 FPS on mobile, caps its pixel ratio at 1.5, uses fixed particle pools and releases its animation frame while hidden or outside the viewport.
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
| Home HTML, raw              |      158.7 KiB | 160 KiB |
| Initial JavaScript, raw     |      596.1 KiB | 620 KiB |
| Initial JavaScript, Brotli  |      160.2 KiB | 190 KiB |
| Initial CSS, raw            |       56.4 KiB |  64 KiB |
| Critical home route, Brotli |      186.3 KiB | 225 KiB |
| Public raster assets, total |       53.5 KiB | 350 KiB |
| Largest public raster asset |       53.5 KiB | 200 KiB |

The raw HTML budget includes the three breakpoint-specific SVG topology scenes used when animation is unavailable. Their repeated presentation markup is kept compact so the responsive system remains below the existing 160 KiB limit; the compressed critical-route budget remains unchanged.

The planned responsive topology and pointer-signal behavior must follow [INTERACTION_SYSTEM.md](./INTERACTION_SYSTEM.md). That contract keeps structural routes and typography in scalable SVG, restricts Canvas to bounded particles and prohibits a new animation dependency.

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
5. Confirm mobile uses progressive motion by default, `?motion=full` forces the enhanced runtime, and an explicit reduced-motion preference retains the static topology without horizontal overflow.
