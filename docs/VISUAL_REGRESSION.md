# Visual regression record

This record validates the release-candidate interface against the optimized production build. It exercises the explicit theme and motion controls and treats desktop as the primary composition while retaining a usable tablet and mobile layout.

## Environment

- Audit date: 9 September 2026
- Candidate state: uncommitted local release refinement
- Runtime: Next.js 16.3.3 static export through Wrangler 4.129.0
- Browser engine: Chromium
- Production-compatible URL under test: `http://127.0.0.1:8788`
- Motion validation: native reduced-motion preference plus the documented `?motion=full` diagnostic override

This is a local browser-engine audit, not a claim of physical-device or cross-engine certification. Safari, Firefox, Android Chrome, iOS Safari and Windows Edge remain manual release smoke tests.

## Audited viewport matrix

| Viewport    | Theme          | Motion  | Result | Notes                                                                                                   |
| ----------- | -------------- | ------- | ------ | ------------------------------------------------------------------------------------------------------- |
| 1920 × 1080 | Light and dark | Full    | Pass   | Large desktop grid, project compositions and generated diagrams remain within the viewport.             |
| 1440 × 900  | Light and dark | Full    | Pass   | Identity, topology and portrait occupy separate columns; both themes retain clear portrait contrast.    |
| 1280 × 720  | Dark           | Full    | Pass   | Primary desktop composition, Canvas enhancement and section transitions render without console errors.  |
| 900 × 900   | Light and dark | Full    | Pass   | Five-node tablet topology avoids the portrait and retains crisp route and label rendering.              |
| 768 × 1024  | Light and dark | Full    | Pass   | Tablet layout and navigation overlay retain a coherent reading order.                                   |
| 430 × 932   | Light and dark | Full    | Pass   | Three-node hero topology and compact project/system interactions remain distinct with no page overflow. |
| 390 × 844   | Light and dark | Full    | Pass   | Three-node hero topology and compact project/system interactions remain distinct with no page overflow. |
| 390 × 844   | Light          | Reduced | Pass   | The complete identity and static SVG topology remain available without enhanced motion.                 |
| 320 × 700   | Light          | Reduced | Pass   | No element extends beyond the viewport; the complete Proton Mail address fits on one line.              |

No user-facing horizontal overflow was found. Chromium's 320-pixel test viewport reports a 15-pixel overlay-scrollbar difference between the root client width and `innerWidth`; a bounding-box scan confirmed that no rendered element crosses the viewport boundary.

The pre-disclosure mobile document height was `21,499` CSS pixels at 390 × 844. The default compact view now measures `18,608` CSS pixels, a reduction of `2,891` pixels or approximately `13.4%`. The first project remains expanded, later projects retain visible summaries/outcomes/stacks/destinations, and all implementation content remains available through native disclosure controls.

## Interaction checks

- System, light and dark selections update the applied theme without changing page structure.
- Full motion progressively enables the hero enhancement; reduced motion keeps the complete static SVG composition.
- Pointer proximity highlights the nearest topology node and applies a bounded backdrop shift on pointer-capable layouts.
- Pointer packets decay toward the nearest route, ambient packets remain visible without pointer input, and Canvas signals fade inside protected title, portrait and metadata regions.
- Mobile receives ambient packets at a lower frame-rate ceiling and a restrained touch pulse instead of hover-only trail behavior.
- Direct diagram selection synchronizes the active route, node, named control and detail content. Arrow keys, Home and End preserve the same synchronization while moving focus.
- Mobile project disclosures respond to touch/click, Enter and Space. Their controls describe the enclosed topology and engineering decisions rather than using an ambiguous “More” label.
- The mobile capability controls form a scroll-contained 63 CSS pixel horizontal rail. Keyboard movement scrolls the focused layer into view without allowing incidental pointer entry to overwrite its active state.
- The capability detail remains 320 CSS pixels high on desktop and 304 CSS pixels high on mobile across the longest and shortest layer content tested; the surrounding map does not jump when selection changes.
- The tablet menu moves focus to Close, locks background scrolling and exposes the six primary destinations.
- Closing the tablet menu restores focus to Menu and releases the body scroll lock.
- The theme control remains reachable in both the site header and the open-menu focus boundary.
- Representative production routes and interactions produced no browser-console errors or warnings.
- Project topology and engineering-detail widths remain paired at every tested breakpoint. At 1440 × 900, all three case studies render both regions at 1,088 CSS pixels without horizontal overflow.

## Findings corrected

### Hero composition and responsive topology

The earlier desktop hero placed the portrait and topology in the same visual region, which reduced legibility and obscured the intended hierarchy. The final composition keeps the identity and portrait in distinct foreground regions while the topology spans the hero as an unframed background system. Dedicated seven-, five- and three-node SVG scenes preserve the concept at desktop, tablet and mobile widths without crowding the content. Decorative project-index parallax remains desktop/tablet-only so its transform cannot widen the mobile document.

### Light reduced-motion topology contrast

The mobile hero applied the same low-opacity treatment to the dark and light static topology. On the light surface, the reduced-motion fallback was present but visually too faint. The mobile light theme now increases the topology opacity, with a slightly stronger value when reduced motion is active. Canvas and desktop behavior are unchanged.

### Narrow-screen contact address

At 390 pixels, the previous mobile type scale wrapped the last two characters of `rahulsinghparmar4@protonmail.com` onto a separate line. The mobile-only scale now fits the address at 390 and 320 pixels while leaving tablet and desktop typography unchanged.

### Mobile scan length

The original mobile case studies presented every topology and decision block in one uninterrupted stream. Native project disclosures now keep the first case study open and collapse the later two by default, while retaining title, operational outcome, principal technologies and destination in the scan path. Mobile section spacing and decorative indices are smaller, and the seven-layer selector is a horizontally scrollable rail rather than a seven-row stack. Desktop and tablet case studies remain fully visible.

## Reviewed non-defects

- Oversized `02` and `03` project indices deliberately extend beyond their own text boxes. Their parent compositions clip this decorative type by design; they do not create page overflow or hide semantic content.
- The long `Infrastructure Maintenance Edge` title has a small intrinsic-width difference at narrow viewports, but it wraps visibly within its case-study column and is not clipped.
- Tablet delivery-stage labels exceed individual intrinsic column widths by a few pixels but remain visible because the row does not clip text. The five-stage reading order remains clear.

## Repository preview assets

The repository overview uses a color-scheme-aware `<picture>` element so GitHub presents the matching portfolio surface without JavaScript:

- `docs/assets/portfolio-preview-light.webp` — 1440 × 900, 38.3 KiB.
- `docs/assets/portfolio-preview-dark.webp` — 1440 × 900, 37.2 KiB.

Both images were captured from the local Wrangler runtime with the explicit reduced-motion diagnostic and then encoded as WebP at quality 82. This makes the capture deterministic, keeps the README payload small and prevents a transient entrance frame or signal particle from becoming the repository's permanent preview. Recapture both files after any material hero, identity, typography or theme change.

## Manual release checks still required

Before the public `v1.0.0` tag:

1. Smoke-test current Firefox and Edge on Windows at desktop and tablet widths.
2. Smoke-test current Safari on macOS and iOS, including theme persistence and reduced motion.
3. Smoke-test Android Chrome at 360–412 CSS pixels.
4. Check one physical 1920-pixel desktop and one high-density mobile screen for font rendering and touch targets.
5. Repeat the navigation and theme checks against the hosted Cloudflare preview, then the final HTTPS hostname after cutover.

## Cloudflare-runtime check

On 7 September 2026, the exported candidate was rechecked through Wrangler `4.129.0` at `http://127.0.0.1:8788`, rather than through `next dev` or the retired Node container path.

| View                         | Evidence                                                                                                                | Result                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1280 × 720 desktop           | Full-motion Canvas present; primary navigation visible; skip link moved focus to `main-content`; no horizontal overflow | Pass                      |
| 847 × 912 constrained/tablet | Responsive menu shown; full-motion Canvas present; light and dark surfaces both resolved; no horizontal overflow        | Pass                      |
| Reduced-motion contract      | Source/CSS fallback retained and the earlier 390 × 844 reduced-motion result remains valid                              | Not newly device-emulated |

This check proves the Cloudflare local runtime preserves the validated interface. It does not replace checks on a hosted preview, native reduced-motion settings, Firefox/Edge/Safari or physical iOS/Android hardware.
