# Accessibility baseline

Accessibility is a release requirement across keyboard, screen, motion and contrast behavior. The portfolio is progressively enhanced: its content, navigation and system diagrams remain usable without animation or a precision pointer.

## Verified interface contract

- A visible-on-focus skip link moves keyboard focus directly to `#main-content` on both the home and not-found routes.
- The desktop and mobile navigation expose descriptive accessible names while preserving the visible `RSP` site mark.
- Opening the mobile menu moves focus into it, makes background content inert and traps focus within the available actions.
- Escape closes the mobile menu and restores focus to its trigger.
- Closed mobile navigation is removed from the accessibility tree and tab order.
- Project topology SVGs are named by unique titles instead of being announced as unlabelled images.
- Live system-state changes use a polite atomic status region.
- Links that open a new browser tab disclose that behavior to assistive technology.
- Focus indicators use a two-pixel high-contrast outline and are not removed from interactive controls.
- Reduced-motion mode disables Canvas, route, map and footer animation while retaining the complete information architecture; changing the system preference also detaches or restores the optional hero signal layer without a reload.
- The color-theme control is keyboard operable, exposes one stable accessible action and participates in mobile-menu focus containment.
- System, light and dark themes update native control color scheme and browser theme color without changing content semantics.
- The mobile light-theme SVG fallback uses an explicit contrast treatment so reduced-motion users receive a visible topology rather than a decorative trace.
- Fine-pointer packets and touch pulses are decorative Canvas feedback only; the operating-system cursor, content order and interactive targets remain unchanged.
- The capability map exposes one keyboard tab stop for its selected layer; Arrow keys move between adjacent layers, Home and End move to the boundaries, and focus, route, node and detail state remain synchronized.
- Mobile project depth is exposed through native, descriptively labelled disclosure controls. The first case study starts expanded, later studies remain reachable by keyboard or touch, and desktop/tablet retain their complete visible case-study layouts.
- The mobile capability selector scrolls horizontally within its own boundary. Keyboard focus brings the selected item into view while the active route, node and detail remain synchronized.

## Lighthouse result

Measured locally on 31 August 2026 against the production build. Lighthouse scores can vary slightly with browser and machine versions.

| Profile | Baseline | Current | Scored failures |
| ------- | -------: | ------: | --------------: |
| Desktop |       99 |     100 |               0 |
| Mobile  |       99 |     100 |               0 |

The baseline failures were missing SVG image names and a mismatch between the visible site mark and its accessible label. Both are resolved in the current result.

## Manual keyboard and motion review

The following paths were exercised at the mobile breakpoint in a real browser:

1. Open the menu from the keyboard and confirm focus enters the menu.
2. Tab forward from Contact and confirm focus wraps to Close.
3. Shift+Tab backward from Close and confirm focus wraps to Contact.
4. Press Escape and confirm the menu closes and focus returns to Menu.
5. Activate the skip link and confirm focus moves to the main content.
6. Enable reduced motion and confirm the page reports reduced mode, Canvas enhancement is absent and project, capability-map and footer animations are disabled.
7. Confirm the page and mobile overlay introduce no horizontal overflow.
8. Focus the selected capability control, exercise all four Arrow keys plus Home and End, and confirm focus and the announced detail move together.
9. Below 768 CSS pixels, open and close each project disclosure with Enter and Space; confirm its label remains visible, content returns in document order and no project link or outcome is hidden.
10. At 320–430 CSS pixels, move through the capability rail with Tab and Arrow keys; confirm focused controls scroll into view without moving the page horizontally.

Automated and keyboard checks do not replace assistive-technology testing. Before a public release that materially changes navigation or page structure, perform a smoke test with NVDA plus Chrome or Firefox on Windows and, when available, VoiceOver plus Safari on Apple hardware.

## Contrast review

The primary dark theme tokens were checked against the `#0b0c0c` page background:

| Token      | Contrast ratio |
| ---------- | -------------: |
| Foreground |        16.72:1 |
| Muted      |         6.97:1 |
| Accent     |        14.10:1 |
| Status     |        11.46:1 |
| Warning    |        10.38:1 |
| Error      |         7.06:1 |

All measured text-color combinations meet WCAG AA for normal text. Visual meaning is not communicated by color alone.

The light theme tokens were checked against the `#f3f1e9` page background:

| Token           | Contrast ratio |
| --------------- | -------------: |
| Foreground      |        15.62:1 |
| Foreground soft |        10.22:1 |
| Muted           |         5.12:1 |
| Accent          |         5.59:1 |
| Status          |         5.66:1 |
| Warning         |         5.73:1 |
| Error           |         5.83:1 |

Both palettes meet WCAG AA for normal text. The system preference initializes before first paint, while a stored light or dark selection remains stable across reloads.

## Regression workflow

Start and audit the release artifact through the target Cloudflare runtime:

```bash
npm run release:check
npm run preview:cloudflare
npx --yes lighthouse http://127.0.0.1:8788 --only-categories=accessibility --preset=desktop
npx --yes lighthouse http://127.0.0.1:8788 --only-categories=accessibility
```

For every release:

1. Run formatting, linting, type checking and the production build.
2. Require 100 Lighthouse accessibility on both desktop and mobile, with no scored failures.
3. Repeat the skip-link, menu focus, Escape and focus-restoration paths.
4. Verify reduced-motion behavior and horizontal overflow at mobile and desktop widths.
5. Cycle system, light and dark themes, reload each explicit selection and confirm the preference, native color scheme and browser theme color remain synchronized.
6. Repeat a screen-reader smoke test after navigation, heading, live-region or diagram changes.

The current viewport, theme and motion matrix is recorded in [VISUAL_REGRESSION.md](./VISUAL_REGRESSION.md). It separates locally verified Chromium behavior from the physical-device and cross-engine checks that remain before the public tag.

Future topology, pointer and mobile-density changes are governed by [INTERACTION_SYSTEM.md](./INTERACTION_SYSTEM.md), including equivalent pointer, keyboard and touch paths and the requirement that the static interface remain complete when enhancement is unavailable.
