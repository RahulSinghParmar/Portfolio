# Interaction system contract

This document defines the responsive interaction and rendering contract for the portfolio. It exists to keep visual experimentation measurable: animation may add depth and feedback, but it must not obscure content, weaken accessibility or compromise the static Cloudflare delivery model.

## Design intent

The interface should feel like an operating surface rather than a collection of effects. Network routes, signals and topology reinforce Rahul's infrastructure practice. They are not generic decoration and they never replace the written evidence on the page.

The next interaction refinement has three outcomes:

1. Turn the boxed hero topology into a crisp, full-bleed network layer that uses the hero's unused space.
2. Make the seven-layer operational map respond consistently to its visual nodes and its text controls.
3. Reduce mobile reading length through progressive disclosure while keeping essential professional and project information immediately available.

## Non-goals

- Do not copy the visual identity or source code of another portfolio.
- Do not add Three.js, a second animation framework or another production dependency.
- Do not replace the operating-system cursor or make navigation depend on pointer effects.
- Do not hide role, employer, project outcomes, technologies, links or contact information on small screens.
- Do not introduce animation that cannot be disabled by the user's reduced-motion preference.

## Hero composition

The hero uses four ordered layers:

1. **Structural grid** — the existing theme-aware page grid.
2. **Topology SVG** — scalable routes, nodes and labels spanning the hero without a surrounding card or square frame.
3. **Signal Canvas** — transient route packets and pointer traces only; it contains no text or essential information.
4. **Content plane** — name, discipline, portrait, employment metadata and scroll cue.

The SVG owns every line and label that must remain sharp. Canvas must not render typography. The content plane remains above both visual layers and receives an exclusion field so routes fade before crossing high-contrast text or the subject's face.

### Responsive topology density

| Viewport                  | Visible topology                               | Interaction                                                      |
| ------------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| Desktop, at least 1024 px | Seven labelled nodes and primary routes        | Pointer parallax, nearest-node emphasis and bounded signal trail |
| Tablet, 768–1023 px       | Five labelled nodes and simplified routes      | Nearest-node emphasis; lower trail density                       |
| Mobile, below 768 px      | Three large nodes and two or three quiet paths | Ambient packets and optional tap pulse; no hover-only behavior   |

Mobile retains a recognizable topology instead of setting the visual to `display: none`. Minor captions and diagnostic coordinates may be omitted when they compete with the identity.

### Protected content regions

- Desktop identity occupies approximately columns 1–5; the portrait occupies columns 10–12.
- Tablet identity occupies approximately columns 1–4; the portrait occupies columns 7–8.
- Mobile places the title first and the portrait to the lower-right of the hero.
- Nodes must not sit beneath the title glyphs, the face or employment metadata.
- Routes may pass behind low-density whitespace but must fade beneath protected content using a mask or explicit opacity zone.
- The visual background must never create horizontal overflow.

### Rendering quality

- SVG text must render at no less than 11 CSS pixels on desktop, 10 pixels on tablet and 10 pixels on mobile.
- Node outlines and important routes use at least one CSS pixel after scaling.
- Canvas is reserved for particles and may remain capped at a `1.5` device-pixel ratio because it no longer carries text or structural lines.
- SVG coordinates use a responsive `viewBox`; CSS pixels must not be baked into topology data.
- Light and dark palettes use existing semantic color tokens. No hard-coded theme color belongs in the renderer.

## Signal-packet trail

The pointer trail is interpreted as network traffic, not a starfield. Small packets spawn near a fine-pointer cursor, inherit the accent or foreground token and decay toward nearby routes.

| Constraint           | Desktop                  | Tablet                   | Mobile/touch               |
| -------------------- | ------------------------ | ------------------------ | -------------------------- |
| Concurrent particles | Maximum 24               | Maximum 12               | No pointer trail           |
| Lifetime             | 450–700 ms               | 400–600 ms               | Ambient packets only       |
| Spawn threshold      | At least 18 px and 24 ms | At least 24 px and 32 ms | Not applicable             |
| Frame rate           | Maximum 30 FPS           | Maximum 30 FPS           | Maximum 20 FPS when active |

Particles use a preallocated pool. The runtime stops when the hero is outside the observer margin, the document is hidden, Save Data is enabled or reduced motion is requested. Pointer input is sampled; it must not cause React state updates on every event.

The normal system cursor remains visible. Links and controls continue to use their native cursor and focus behavior.

## Operational topology interactions

The seven-layer map has one `activeId` state and two synchronized input surfaces:

- **Visual nodes:** pointer enter, click or tap activates the corresponding layer.
- **Ordered controls:** pointer enter, focus or activation selects the same layer and remains the canonical keyboard interface.

When selection changes:

1. The route from `OPERATE` to the active node receives the strongest treatment.
2. The active node and its matching control share the same state token.
3. The detail panel updates without changing its outer height unexpectedly.
4. Pointer leave does not reset the selection.

The SVG nodes do not need a duplicate keyboard tab stop because every node has an equivalent named button immediately beside the visual. Buttons support Arrow Up/Left and Arrow Down/Right navigation, with Home and End moving to the first and last layers. Focus always remains visible.

The implemented control set uses roving focus: only the selected button participates in the page Tab sequence. Pointer entry, click, touch, control focus and keyboard navigation all update the same `activeId`; selection persists after pointer leave. The detail region has a fixed minimum block size and announces its complete replacement atomically.

## Mobile scan mode

The mobile layout presents summaries before implementation detail:

- Project title, operational outcome, principal technologies and destination remain visible.
- Architecture diagrams, detailed decisions and extended metrics move into native disclosure regions.
- The first project may be expanded initially; later projects start collapsed.
- Disclosure labels state what will be revealed, not only "More".
- Section spacing and oversized decorative indices reduce at the mobile breakpoint.
- The systems selector becomes a compact horizontally scrollable control row with visible focus and scroll padding.
- No content is removed from the document, preserving search indexing and screen-reader access.

The implemented project case studies use native `details` and `summary` elements below the mobile breakpoint. The first case study starts expanded; the remaining two expose the same descriptive control and start collapsed. Desktop and tablet layouts keep every topology and decision block visibly expanded. The systems selector becomes a scroll-contained horizontal rail on mobile while retaining its single roving Tab stop and Arrow/Home/End keyboard model.

The 390 × 844 document measured `21,499` CSS pixels before disclosure and `18,608` after implementation: a reduction of `2,891` pixels, or approximately `13.4%`. Every section and essential project summary remains in the default reading path.

## Performance contract

The latest accepted release measurement leaves approximately `24.6 KiB` of raw initial JavaScript, `10.1 KiB` of raw initial CSS and `4.5 KiB` of raw HTML headroom. Interaction work must stay inside the existing budgets:

| Metric                      | Current measurement | Release budget |
| --------------------------- | ------------------: | -------------: |
| Home HTML, raw              |           158.7 KiB |        160 KiB |
| Initial JavaScript, raw     |           596.1 KiB |        620 KiB |
| Initial JavaScript, Brotli  |           160.2 KiB |        190 KiB |
| Initial CSS, raw            |            56.4 KiB |         64 KiB |
| Critical home route, Brotli |           186.3 KiB |        225 KiB |

The topology enhancement should be isolated behind a dynamic import initiated after hydration and near-viewport detection. Its optional chunk must not become a blocking initial asset. Reuse the existing GSAP/Lenis runtime; do not add a new animation package.

Canvas and pointer listeners have one owner and one cleanup path. ResizeObserver, IntersectionObserver, media-query listeners and animation frames must all be released when the component unmounts.

## Accessibility and resilience

- The static SVG is meaningful without JavaScript and has a concise accessible name.
- Decorative signal particles are `aria-hidden`.
- Full, reduced and failed-enhancement states preserve the same written content and navigation.
- Reduced motion removes pointer trails, route travel, parallax and continuous drift.
- Touch and coarse-pointer devices do not receive hover instructions.
- Active states use shape, weight or text in addition to color.
- The system remains usable at 200% zoom and at 320 CSS pixels without horizontal page scrolling.
- Runtime failure falls back to the static SVG without an error surface.

## Acceptance matrix

Implementation is complete only when all of the following pass against `npm run preview:cloudflare`:

1. 1440 × 900 and 1920 × 1080 in light and dark themes.
2. 768 × 1024 and 900 × 900 tablet layouts.
3. 320 × 700, 390 × 844 and 430 × 932 mobile layouts.
4. Fine-pointer hover, keyboard-only navigation and touch-equivalent interaction.
5. Native reduced motion, Save Data fallback and the documented full-motion diagnostic override.
6. No horizontal overflow, layout shift, console error or restart loop.
7. `npm run release:check` and the deployment contract remain green.
8. The visual-regression record includes hero quality, map selection, mobile height and both themes.

## Implementation sequence

1. Split the static SVG foundation from the optional signal runtime.
2. Establish responsive node sets and protected regions.
3. Replace the framed hero widget with the full-bleed topology layer.
4. Add the bounded signal-packet runtime.
5. Synchronize visual nodes and controls in the operational map.
6. Introduce mobile disclosures and compact spacing.
7. Run the complete acceptance matrix before producing repository preview images.
