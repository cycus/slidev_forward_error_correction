# T01 — Design system + shared components

## Goal
The visual and structural conventions that make 85 slides feel like one deck, plus the small shared components every part reuses.

## Deliverables
1. `styles/index.css` (+ UnoCSS shortcuts): color tokens, spacing, typography scale.
2. Shared components in `components/`:
   - `SectionCover.vue` — part number, title, one-line thesis, progress dots (7 parts).
   - `TriviaCard.vue` — visually distinct "did you know" card (icon, source line). Used ≥8× across the deck; must be scannable and not clash with content slides.
   - `SourceFoot.vue` — tiny footnote bar for citations: `<SourceFoot refs="[('Shannon 1948', 'url'), …]" />`. Every slide with a quantitative claim uses it.
   - `BigNumber.vue` — hero stat display ("0.0045 dB", "−1.59 dB") with label + source.
   - `DbGauge.vue` — small horizontal gauge showing "distance from Shannon limit" reused in Parts 1/3/4/5/7 as a running visual motif (the deck's connective tissue: each code family plants its flag on the same gauge).
3. Conventions doc `styles/CONVENTIONS.md` (color semantics, math notation, click choreography rules).

## Design decisions (binding for all later items)
- **Color semantics, used consistently everywhere:** systematic/information bits = blue; parity/redundancy = amber; erroneous/flipped = red; corrected/converged = green; frozen (polar) = gray. Light+dark variants; validate contrast in both schemes.
- **Math notation:** LLR positive ⇒ bit 0 more likely (3GPP/MATLAB polarity); Eb/N0 in dB; code rate R = k/n; block length n or N per each family's literature convention. Define once on a notation slide in Part 2, never redefine.
- **Click choreography rule:** reveals advance an *argument*, not decoration. Max ~6 clicks/slide. Component-internal steps are driven by `$clicks` (so presenter remote works) unless free exploration is the point (then explicit UI buttons).
- **Charts:** one shared look for BER/BLER-style plots (log-y grid, dB x-axis). Decide the charting approach here and stick to it: hand-rolled SVG for pedagogical animations (Tanner graph, polarization tree); a single lightweight chart util (or thin Chart.js wrapper) for curve plots (`CapacityExplorer`, `BlerExplorer`). Lazy-init in `onSlideEnter`, dispose in `onSlideLeave`, wrap in `<RenderWhen context="main">`.

## Acceptance criteria
- [ ] Demo slide (`pages/_styleguide.md`, `hide: true` in final deck) shows all shared components in light + dark.
- [ ] `TriviaCard`, `SourceFoot`, `BigNumber`, `DbGauge`, `SectionCover` render correctly in overview grid (`o`) and PDF export without console errors.
- [ ] Color tokens exposed as CSS vars + UnoCSS shortcuts; both schemes pass a quick contrast sanity check.
- [ ] CONVENTIONS.md covers: colors, notation, click rules, chart style, citation format.
- [ ] `DbGauge` renders the fixed reference points: uncoded BPSK @ 9.6 dB, ultimate limit @ −1.59 dB, rate-1/2 limit @ 0 dB (see T02 factual basis).

## Technical notes (from Slidev research, verified)
- Slide component instances persist while hidden: `onMounted/onUnmounted` unavailable in slide context — use `onSlideEnter`/`onSlideLeave` from `@slidev/client`.
- `useSlideContext()` gives `$clicks`; `$renderContext` distinguishes `slide|overview|presenter|previewNext` — gate heavy canvases.
- `<RenderWhen context="main">` is the documented tool to keep simulators out of thumbnails.
- Cross-slide state: plain reactive module store (`state.ts`) works and persists across navigation.

## Dependencies
T00.
