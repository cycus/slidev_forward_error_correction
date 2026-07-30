# FEC Presentation — Backlog

**Project:** "Approaching Shannon: Forward Error Correction for 5G Engineers" — an interactive Slidev presentation.
**Audience:** 5G/LTE L1/L2 engineers (the author included). Assumes familiarity with SNR/SINR, modulation, PHY processing chains; does NOT assume coding-theory background.
**Scope decisions (agreed 2026-07-29):** Comprehensive deck (~85 slides, presentable in parts or self-studied) · Full interactive simulators (custom Vue components) · Engineer's math depth (key equations + numeric worked examples, no formal proofs).
**Style pillars:** every concept gets a concrete example · trivia/anecdote cards throughout (all verified, sourced) · quantified claims only — every dB figure carries a citation · interactivity used where it teaches, not decorates.

Detailed per-item specs (acceptance criteria, requirements, factual basis with sources) live in `tasks/T##-*.md`. Research digests underpinning the facts are summarized inside each task file.

---

## Deck structure (target ~85 slides)

| Part | Title | Slides | Core message | Interactive centerpiece |
|---|---|---|---|---|
| 0 | Prologue — Every bit is a guess | 4 | Noise is physics; FEC is why radio works | — |
| 1 | Shannon's Promise (1948) | 11 | Capacity is a provable limit; the 60-year march closed an 11 dB gap | `CapacityExplorer` |
| 2 | The Toolbox — parity, distance, soft bits | 9 | Decoding is probabilistic inference; soft beats hard by ~2 dB | `LlrVisualizer`, `HammingPlayground` |
| 3 | LDPC — the workhorse of 5G data | 17 | Sparse graphs + message passing; QC structure = Gbps decoding | `TannerBpSimulator` |
| 4 | Turbo — the 1993 revolution | 14 | Two gossiping decoders exchanging extrinsic beliefs | `RscEncoderStepper`, `TurboIterationDemo` |
| 5 | Polar — the theorist's triumph | 12 | Channel polarization; provably capacity-achieving; owns 5G control | `PolarizationExplorer` |
| 6 | Redundancy, Quantified — BLER vs SINR | 13 | Code rate is a dial: ~29 dB of SINR span; HARQ makes 10% BLER optimal | `BlerExplorer`, `HarqIrDemo` |
| 7 | Epilogue — three codes, one phone | 5 | LDPC/Turbo/Polar compared; how close to Shannon we actually fly | comparison matrix |

## Interactive component inventory

| Component | Teaches | Used in |
|---|---|---|
| `CapacityExplorer` | C = B·log₂(1+SNR); Eb/N0 limits vs spectral efficiency; historical codes plotted against the limit | Part 1 |
| `HammingPlayground` | (7,4) encode → flip bits → syndrome decode | Part 2 |
| `LlrVisualizer` | LLR = sign+confidence; soft-vs-hard repetition demo; QAM soft demapping | Part 2, reused in 3/4 |
| `TannerBpSimulator` | Belief propagation on a Tanner graph, iteration by iteration, min-sum vs sum-product | Part 3 |
| `RscEncoderStepper` | LTE RSC encoder (13,15)₈ shift register; why recursion matters | Part 4 |
| `TurboIterationDemo` | Extrinsic-information exchange on Sklar's 2×2 product code; confidence flowing | Part 4 |
| `PolarizationExplorer` | BEC polarization tree N=2→8 (exact numbers); frozen-bit selection; SC/SCL intuition | Part 5 |
| `BlerExplorer` | BLER-vs-SNR waterfalls per MCS/code rate/block length; 10% target line | Part 6 |
| `HarqIrDemo` | Circular buffer + RV pointers; effective rate 0.80→0.40→0.27 across retransmissions | Part 6 |

## Backlog items

Order = recommended implementation order. Sizes: S ≈ ≤2h, M ≈ half-day, L ≈ day, XL ≈ 2 days.

| ID | Item | Type | Size | Depends on | Status |
|---|---|---|---|---|---|
| T00 | Scaffold Slidev project | infra | S | — | ☑ |
| T01 | Design system + shared components (TriviaCard, SourceFoot, SectionCover, math conventions) | infra | M | T00 | ☑ |
| T02 | Part 0 + Part 1 slides — Prologue & Shannon's Promise | slides | L | T01 | ☑ |
| T03 | `CapacityExplorer` component | component | M | T01 | ☑ |
| T04 | Part 2 slides — Toolbox: parity, distance, soft bits | slides | M | T01 | ☑ |
| T05 | `LlrVisualizer` + `HammingPlayground` components | component | L | T01 | ☑ |
| T06 | Part 3 slides — LDPC theory + 5G NR specifics | slides | XL | T01 | ☑ |
| T07 | `TannerBpSimulator` component (deck centerpiece #1) | component | XL | T01 | ☑ |
| T08 | Part 4 slides — Turbo theory + LTE specifics + coding wars | slides | L | T01 | ☑ |
| T09 | `RscEncoderStepper` + `TurboIterationDemo` components | component | L | T01 | ☑ |
| T10 | Part 5 slides — Polar theory + 5G NR control channels | slides | L | T01 | ☑ |
| T11 | `PolarizationExplorer` component | component | L | T01 | ☑ |
| T12 | Part 6 slides — BLER vs SINR, MCS/CQI, HARQ, link adaptation | slides | L | T01 | ☑ |
| T13 | `BlerExplorer` + `HarqIrDemo` components (deck centerpiece #2) | component | XL | T01, T12 data | ☑ |
| T14 | Part 7 slides — Epilogue, comparison matrix, references | slides | M | T02–T13 | ☑ |
| T15 | Fact-check pass — verify all flagged claims against primary sources | QA | M | T02–T14 | ☐ |
| T16 | Polish, presenter notes, build, export, deploy | QA/infra | M | T15 | ☐ |

### Milestones

1. **M1 — Walking skeleton** (T00–T03): project builds, theme set, Part 1 presentable with the capacity explorer. Proves the component pipeline end-to-end.
2. **M2 — Codes core** (T04–T11): all three code families presentable with their simulators.
3. **M3 — The payoff** (T12–T14): quantified redundancy story + epilogue; deck is content-complete.
4. **M4 — Ship** (T15–T16): fact-checked, polished, exported, deployed.

### Definition of Done

*Slides items:* content matches the task file's slide outline; every quantitative claim carries its source (footnote component); KaTeX renders; click choreography works in presenter mode; presenter notes drafted; no slide overflows at 16:9.
*Component items:* meets the interaction spec in its task file; numerically correct (validated against the task file's reference values); keyboard/click driven via `$clicks` where slide-sequenced; heavy work gated with `<RenderWhen context="main">`; state cleanup in `onSlideLeave`; degrades gracefully in PDF export (static fallback frame).
*QA items:* checklist in task file fully ticked.

### Standing risks / notes

- 3GPP spec PDFs were proxy-blocked during research; all TS 38.212/38.214/36.212 statements were triangulated from ≥2 secondary sources + srsRAN production code. T15 re-verifies the critical ones against actual spec copies.
- Research flagged specific numbers as UNVERIFIED (each task file lists its own); T15 owns the consolidated list.
- Slidev v52.x: use `comark: true` (not `mdc:`), Node ≥ 20.12; slide components stay mounted — use `onSlideEnter/Leave`, never `onMounted/onUnmounted`.

### Risk notes / for final review (T-review)

- **[2026-07-30 pre-flight]** `CLAUDE.md` showed a whole-file CRLF↔LF diff on checkout (content byte-identical); reverted to LF. Likely a Windows-editor EOL flip that will recur. T16 should add a `.gitattributes` (`* text=auto eol=lf`) to normalize and stop the churn. **Low risk** — content unaffected.
- **[2026-07-30 pre-flight]** T16 spec (`tasks/T16-polish-build-deploy.md`) tells the README to point data provenance at `.claude/tasks/`, but task specs actually live in top-level `tasks/`; `.claude/` holds only local Cowork settings (now gitignored). T-review/T16 should correct that path in the README instructions. **Low risk** — doc-only.
- **[2026-07-30 pre-flight]** Repo mount denies `unlink`, so git leaves stale `.git/index.lock` and `.git/objects/*/tmp_obj_*` files after operations (worked around by renaming the lock aside). Harmless to history, but a stale `index.lock` can block a later git run until renamed away. Environment-only; not a deck defect.
- **[2026-07-30 T03]** Full `slidev build` could NOT be run to completion in the automation sandbox: `node_modules` is on a high-latency mount (walking it times out), general web-font fetch is network-blocked, only 2 CPUs, and each shell call is capped at ~45s with no background persistence — so the production build stalls in "transforming". Verified T03 instead via `npm test` (30/30, incl. `ebn0LimitDb` reference values) + `@vue/compiler-sfc` compile-check + `@slidev/parser` load (52 slides). **T16 must run the real `npm run build`/`npm run export` on a normal machine (real internet, local disk) to confirm the full deck bundles and to catch any error the fast checks can't (bundle-time/runtime render).** Also note: the linux-native `@rolldown/binding-linux-x64-gnu` and `@oxc-parser/binding-linux-x64-gnu` (x2) were added to `node_modules` in-sandbox alongside the win32 bindings; they are gitignored build artifacts and do not affect the Windows dev setup.
- **[2026-07-30 T03 marker data]** `CapacityExplorer` view 2 includes a **Hamming** marker at 9.0 dB @ η=1 that the T03 spec left unspecified — flagged in-code as *illustrative, not primary-sourced*. BPSK-input curve is anchored at the sourced rate-½→0.19 dB with intermediate points approximate (±~0.1 dB). **T15 should verify/replace the Hamming point and the BPSK-input intermediate values against primary sources.**
- **[2026-07-30 T12/T13]** All Part 6 numbers flow from `snippets/blerData.ts` + `snippets/harq.ts` (single source of truth; slides quote, components import). T15 flags carried on-slide as hedged: pyAerial MCS9→modulation identity unconfirmed; Sādhanā URLLC rows non-monotonic (kept as published); Chase +3 dB/doubling = theoretical; α=0.75 upper fit (Mogensen) unverified; TR 36.942 A.1 cited for lineage only (its SNIR_MIN/MAX not quoted). Minor: `pyAerialWaterfall` last point BLER=0 (below sim floor) is clamped to 1e-5 for the log axis in `BlerExplorer` — cosmetic, not a data edit.
- **[2026-07-30 T13 — for T14/presenter]** Slides 5 & 8 embed `<BlerExplorer guided>` / `<HarqIrDemo guided>`, so the components step on the slide's `$clicks` stream (4 steps each). Each of those two slides also has ONE prose `<v-click>` card that shares that stream (reveals on click 1, then persists) — functionally fine, but if T14 wants the prose fully decoupled from the component walk, that is the one place to adjust the click budget. `HarqIrDemo` uses Zc=48 (valid 5G lifting size) so Ncb=66·Zc yields clean k0=num·Zc pointer marks; ring geometry only, never printed as a figure.
- **[2026-07-30 T12/T13 build]** Verified via `npm test` (59/59), `@vue/compiler-sfc` compile-check (BlerExplorer + HarqIrDemo OK), and `@slidev/parser` load (**88 slides**, up from 76 — Part 6 grew from 1 stub to 13). Full `slidev build`/`export` still NOT run (same sandbox limits as T03) — remains T16's responsibility to confirm on a normal machine.
- **[2026-07-30 T14 build]** Part 7 (`pages/part7-epilogue.md`) grown from the SectionCover stub to **6 slides** (cover + matrix + gauge finale + what's-next + 5 takeaways + references). No new components (reused SectionCover/SourceFoot/DbGauge/TriviaCard; BigNumber not needed). Verified via `npm test` (**59/59**), `@slidev/parser` load (**93 slides**, up from 88), scope confirmed single-file (`git status` shows only `pages/part7-epilogue.md`). No `.vue` added → no SFC check needed. Full `slidev build`/`export` still NOT run — T16 owns it. **The deck is now content-complete across all 7 parts.**
- **[2026-07-30 T14 — for T15 fact-check]** New/carried items:
  - **LDPC 0.0045 dB vs 0.04 dB rounding**: matrix "flag on gauge" cell cites Chung's underlying 0.0045 dB threshold, while the running `DbGauge` (Part 7 slide 2, matching Parts 1/3) plots LDPC at **0.04 dB**. Same lab result, two roundings — kept both per spec; T15 should decide one deck-wide convention.
  - **"11 dB" gap**: Part 7 slide 2 uses "11 dB" to match Part 1's existing "11 dB chasm" (exact = 9.6 − (−1.59) ≈ 11.19; the T14 spec said "11.2 dB"). Consistent within the deck; verify the rounding is acceptable.
  - **"~30 dB dial"** (takeaway 4): Part 6 quantified the CQI1–15 span as **~29 dB**; Part 7 rounds to "~30 dB" (tilde signals rounding). Confirm acceptable or align to 29.
  - **"What's next" citations** (web-verified July 2026): 6G continuity → *"Channel Coding Toward 6G"* arXiv:2405.07547; ML decoding → *"Deep Learning for Channel Coding: A Survey"* arXiv:2406.19664; finite-blocklength → PPV 2010 (already in deck). **No specific 3GPP Rel-19/20 channel-coding study-item number is asserted** (couldn't confirm a dedicated coding SI exists; only survey-sourced). T15: if a firm Rel-19/20 coding SI reference surfaces it may be added — do NOT invent one.
  - Part 7 references slide uses **markdown lists inside grid `<div>` columns** (comark, blank-line-delimited, same pattern as Part 6 slide 9). Parser loads clean, but tests can't confirm visual layout — T15/T16 should eyeball in-browser that the references grid, the 7-row comparison matrix, and the 3-flag `DbGauge` do not overflow at 1080px.
- **[2026-07-30 T14 — for T16 packaging]** Part 7 references slide (slide 5) ends with a **placeholder** repo/hosted-URL card reading "hosted URL / QR pending" — **no URL fabricated**. T16 must supply the real repo URL (and a QR image if wanted; note there is **no QR component** in `components/` yet, so one must be added or the line simplified to a plain URL). Also unchanged from prior batches: T16 must set `hide: true` on the `_styleguide.md` include in `slides.md` (line ~199–201, TODO already in place) to drop the styleguide from the final build, and run the real `npm run build`/`npm run export` on a normal machine. No remaining content stubs anywhere in the deck.
