# T19 — Visual polish: overflow clips, recap-gauge legibility, marker declutter

## Goal
Fix the layout defects found by inspecting the rendered deck (2026-07-31 local `npm run export`, all 87 pages rasterized; page numbers below refer to that PDF). None change content — presentation only.

## Findings & fixes

### 1. Bottom-edge clipping (text lost)
- **Part 4 slide 5 "The LTE encoder, step by step" (p47) — worst offender.** The trellis-termination `v-click` paragraph clips into/behind the SourceFoot: text cut mid-sentence at "12 tail bits (4 per…". The termination beat (12 tail bits, 4/stream, D=K+4) is the slide's payoff — it must be fully visible. Fix: tighten the left column (smaller table padding / `text-sm` → `text-xs` on the trace table) or move the termination note to the right column under the stepper.
- **Part 2 slide 3 "Hamming (7,4)" (p19).** The TriviaCard's source line overlaps the SourceFoot bar. Fix: reduce the card's `mt-3` / trim card copy; the footer and card source must not overlap.
- **Part 5 slide 12 "Polar plants its flag" (p68).** TriviaCard bottom border clipped by the footer. Same class of fix.

### 2. Recap-gauge legibility (motif consistency)
Parts 1, 3 and 7 render their recap `DbGauge` full-width — labels legible. Parts 4 and 5 squeeze the gauge into a half-width right column, where flag/reference labels render ~5px and unreadable (p56, p68):
- **Part 4 slide 14 "Turbo's living legacy"** and **Part 5 slide 12 "Polar plants its flag"**: restructure so the DbGauge sits full-width below the two-column content (the Part 3 slide 17 pattern). The flag-planting moment is the part's payoff; it currently whispers.

### 3. "The gauge, final form" claim vs rendering (Part 7 slide 3, p84)
Intro line says "**Every** flag this deck has planted, on one scale", but only the three family flags are plotted (Turbo 0.7, LDPC 0.04, Polar 2.8). Missing: Voyager 2.3, Galileo 0.8, LDPC-5G 1.4, BPSK-input-½ 0.19. Either:
- (a) add Voyager + Galileo (and optionally LDPC 5G) to the flags array — strengthens the "read left to right, the whole story is one line" beat; verify DbGauge label staggering keeps 0.04 / 0.7 / 0.8 legible; or
- (b) reword the intro to "The three family flags, on one scale."
Prefer (a) if labels stay clean, else (b). The claim and the rendering must agree.

### 4. CapacityExplorer view 2 — historical-marker label collisions (p11)
On the Eb/N0-vs-η plane, the march markers' year labels collide: the 1993/2001 cluster near 0.2–0.7 dB renders as an unreadable "20093" blob; the 1950s-era markers near 9.0–9.6 dB also touch. Affects the PDF fallback and the live final click state (all markers shown). Fix in `components/CapacityExplorer.vue`: stagger labels above/below alternately or add short leader lines. Pure presentation — marker positions/data untouched (they are T15-verified).

### 5. Optional (do only if trivially safe)
- **Part 3 slide 13 (p38):** mermaid pipeline at `scale: 0.52` is small and the slide's bottom ~40% is empty; try `scale: 0.65–0.7`.
- **SourceFoot ellipsis** swallows the 2nd+ ref on Part 5 slide 9, Part 6 slide 11, Part 7 slide 3 (by-design `nowrap` truncation). Where a load-bearing citation is fully hidden, put it first or shorten labels. No component change.

## Acceptance criteria
- [ ] Re-export; pages 19, 38, 47, 56, 68, 84 (and 11) show: no clipped/overlapping text, recap gauges full-width with legible labels, final-gauge intro matching its flags, no colliding marker labels.
- [ ] No content/data edits: every dB value, source and colour token unchanged (diff review).
- [ ] `npm test` green; SFC compile-check passes if `CapacityExplorer.vue` is touched.
- [ ] Slide count still 87 (parser and exported pages).

## Factual basis
All findings are rendered-output observations from the 2026-07-31 export inspection; no factual claims are altered by this task.

## Dependencies
T17 (touches two of the same slides — land T17 first to avoid conflicts).
