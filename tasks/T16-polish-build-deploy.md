# T16 — Polish, presenter notes, build, export, deploy

## Goal
From content-complete to presentation-grade: consistent choreography, complete notes, clean builds in all output formats, hosted deck.

## Workstreams

### 1. Consistency sweep
- Color semantics (T01) applied everywhere: systematic=blue / parity=amber / error=red / corrected=green / frozen=gray — audit all 9 components + all diagrams.
- Notation audit: LLR polarity, Eb/N0 vs SNR vs SINR usage per slide (Part 1–2 use Eb/N0; Part 6 uses SNR/SINR — transitions signposted on Part 6 slide 4).
- `DbGauge` appearances (Parts 0,1,3,4,5,6,7) use identical scale and accumulated flags.
- TriviaCard density: ≥8 across deck, ≤1 per slide, none on math-heavy slides.
- Click-count budget: no slide >6 clicks; guided component scripts rehearsed against presenter remote.

### 2. Presenter notes & timing
- Notes on 100% of slides (`<!-- -->` blocks) with `[click]` markers synced to reveals.
- Timing pass: full run-through ≤ 3.5 h total; each part's cover slide notes its standalone duration (Part 1 ≈ 30 min, Parts 3/4 ≈ 45 min each, etc.) so the deck works as a series.
- `hideInToc`/`routeAlias` set for section navigation; `Toc` slide after title.

### 3. Robustness
- Overview grid (`o`): no heavy component renders (all behind `RenderWhen`); `overviewSnapshots: true` if any slip through.
- rAF/timer leak audit: navigate through all simulator slides, confirm zero background loops (dev instrumentation from T07).
- Dark mode: full deck pass in both schemes.
- 4:3 not supported (16:9 only) — note in README.

### 4. Outputs
- [ ] `slidev build` SPA: all interactivity works from `vite preview`; asset paths absolute (`/public`-rooted) — the classic post-build 404 trap.
- [ ] Hosted deploy (GitHub Pages workflow from T00, `--base` set) — live URL in README + QR on final slide (T14).
- [ ] `slidev export` PDF (`withClicks: false`): every simulator slide shows its static fallback frame, not a blank; page count sane.
- [ ] Optional PPTX export (images-only, for corporate sharing) — generate, spot-check.
- [ ] README.md: how to run/present/export; parts map; component inventory; data provenance note pointing at `.claude/tasks/` and `snippets/blerData.ts`.

## Acceptance criteria
- [ ] All four workstream checklists complete.
- [ ] A cold run-through by the author (presenter mode, remote only, no mouse) hits zero broken reveals or missing notes.
- [ ] Live URL loads on desktop + phone; PDF artifact archived in repo releases.
- [ ] Repo tagged v1.0.

## Dependencies
T15 (facts frozen). Final item.
