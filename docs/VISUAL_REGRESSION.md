# Visual regression record

Phase 17 validates the release-candidate interface without changing its information architecture or adding features. The audit uses the optimized production build, exercises the explicit theme and motion controls, and treats desktop as the primary composition while retaining a usable tablet and mobile layout.

## Environment

- Audit date: 1 September 2026
- Candidate base commit: `0e0f28d`
- Runtime: Next.js 16.3.3 production server
- Browser engine: Chromium through the Codex in-app browser
- Production URL under test: `http://localhost:3105`
- Motion validation: native reduced-motion preference plus the documented `?motion=full` diagnostic override

This is a local browser-engine audit, not a claim of physical-device or cross-engine certification. Safari, Firefox, Android Chrome, iOS Safari and Windows Edge remain manual release smoke tests.

## Audited viewport matrix

| Viewport    | Theme                 | Motion  | Result | Notes                                                                                                  |
| ----------- | --------------------- | ------- | ------ | ------------------------------------------------------------------------------------------------------ |
| 1920 × 1080 | System, resolved dark | Full    | Pass   | Large desktop grid, project compositions and generated diagrams remain within the viewport.            |
| 1440 × 900  | Light                 | Full    | Pass   | Hero, selected work, About and Contact retain hierarchy and readable contrast.                         |
| 1280 × 720  | Dark                  | Full    | Pass   | Primary desktop composition, Canvas enhancement and section transitions render without console errors. |
| 768 × 1024  | Dark                  | Full    | Pass   | Tablet layout and navigation overlay retain a coherent reading order.                                  |
| 390 × 844   | Dark                  | Full    | Pass   | Progressive topology treatment remains available on a touch-sized viewport.                            |
| 390 × 844   | Light                 | Reduced | Pass   | Static topology fallback is visible and no animation is required to understand the hero.               |
| 320 × 700   | Light                 | Reduced | Pass   | No element extends beyond the viewport; the complete Proton Mail address fits on one line.             |

No user-facing horizontal overflow was found. Chromium's 320-pixel test viewport reports a 15-pixel overlay-scrollbar difference between the root client width and `innerWidth`; a bounding-box scan confirmed that no rendered element crosses the viewport boundary.

## Interaction checks

- System, light and dark selections update the applied theme without changing page structure.
- Full motion progressively enables the hero enhancement; reduced motion keeps the complete static SVG composition.
- The tablet menu moves focus to Close, locks background scrolling and exposes the six primary destinations.
- Closing the tablet menu restores focus to Menu and releases the body scroll lock.
- The theme control remains reachable in both the site header and the open-menu focus boundary.
- Representative production routes and interactions produced no browser-console errors or warnings.

## Findings corrected

### Light reduced-motion topology contrast

The mobile hero applied the same low-opacity treatment to the dark and light static topology. On the light surface, the reduced-motion fallback was present but visually too faint. The mobile light theme now increases the topology opacity, with a slightly stronger value when reduced motion is active. Canvas and desktop behavior are unchanged.

### Narrow-screen contact address

At 390 pixels, the previous mobile type scale wrapped the last two characters of `rahulsinghparmar4@protonmail.com` onto a separate line. The mobile-only scale now fits the address at 390 and 320 pixels while leaving tablet and desktop typography unchanged.

## Reviewed non-defects

- Oversized `02` and `03` project indices deliberately extend beyond their own text boxes. Their parent compositions clip this decorative type by design; they do not create page overflow or hide semantic content.
- The long `Infrastructure Maintenance Edge` title has a small intrinsic-width difference at narrow viewports, but it wraps visibly within its case-study column and is not clipped.
- Tablet delivery-stage labels exceed individual intrinsic column widths by a few pixels but remain visible because the row does not clip text. The five-stage reading order remains clear.

## Manual release checks still required

Before the public `v1.0.0` tag:

1. Smoke-test current Firefox and Edge on Windows at desktop and tablet widths.
2. Smoke-test current Safari on macOS and iOS, including theme persistence and reduced motion.
3. Smoke-test Android Chrome at 360–412 CSS pixels.
4. Check one physical 1920-pixel desktop and one high-density mobile screen for font rendering and touch targets.
5. Repeat the navigation and theme checks against the final HTTPS hostname after the Coolify/Cloudflare cutover.
