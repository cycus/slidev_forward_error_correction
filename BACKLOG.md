# FEC Presentation — Backlog

**Project:** "Approaching Shannon: Forward Error Correction for 5G Engineers" — an interactive Slidev presentation.
**Audience:** 5G/LTE L1/L2 engineers (the author included). Assumes familiarity with SNR/SINR, modulation, PHY processing chains; does NOT assume coding-theory background.
**Scope decisions (agreed 2026-07-29):** Comprehensive deck (~85 slides, presentable in parts or self-studied) · Full interactive simulators (custom Vue components) · Engineer's math depth (key equations + numeric worked examples, no formal proofs).
**Style pillars:** every concept gets a concrete example · trivia/anecdote cards throughout (all verified, sourced) · quantified claims only — every dB figure carries a citation · interactivity used where it teaches, not decorates.

Detailed per-item specs (acceptance criteria, requirements, factual basis with sources) live in `tasks/T##-*.md`. Research digests underpinning the facts are summarized inside each task file.

---

## Deck structure (target ~85 slides · shipped 87)

| Part | Title | Slides | Core message | Interactive centerpiece |
|---|---|---|---|---|
| 0 | Prologue — Every bit is a guess | 4 | Noise is physics; FEC is why radio works | — |
| 1 | Shannon's Promise (1948) | 12 | Capacity is a provable limit; the 60-year march closed an 11 dB gap | `CapacityExplorer` |
| 2 | The Toolbox — parity, distance, soft bits | 9 | Decoding is probabilistic inference; soft beats hard by ~2 dB | `LlrVisualizer`, `HammingPlayground` |
| 3 | LDPC — the workhorse of 5G data | 17 | Sparse graphs + message passing; QC structure = Gbps decoding | `TannerBpSimulator` |
| 4 | Turbo — the 1993 revolution | 14 | Two gossiping decoders exchanging extrinsic beliefs | `RscEncoderStepper`, `TurboIterationDemo` |
| 5 | Polar — the theorist's triumph | 12 | Channel polarization; provably capacity-achieving; owns 5G control | `PolarizationExplorer` |
| 6 | Redundancy, Quantified — BLER vs SINR | 13 | Code rate is a dial: ~29 dB of SINR span; HARQ makes 10% BLER optimal | `BlerExplorer`, `HarqIrDemo` |
| 7 | Epilogue — three codes, one phone | 6 | LDPC/Turbo/Polar compared; how close to Shannon we actually fly | comparison matrix |

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
| T15 | Fact-check pass — verify all flagged claims against primary sources | QA | M | T02–T14 | ☑ |
| T16 | Polish, presenter notes, build, export, deploy | QA/infra | M | T15 | ☑ |
| T17 | Fix raw (unrendered) KaTeX inside HTML blocks — 7 spots, Parts 4–5 | QA | S | — | ☐ |
| T18 | Restore guided click choreography on Part 6 slides 5 & 8 (`clicks: 4`) | QA | S | — | ☐ |
| T19 | Visual polish — overflow clips, recap-gauge legibility, marker declutter | QA | S | T17 | ☐ |

### Milestones

1. **M1 — Walking skeleton** (T00–T03): project builds, theme set, Part 1 presentable with the capacity explorer. Proves the component pipeline end-to-end.
2. **M2 — Codes core** (T04–T11): all three code families presentable with their simulators.
3. **M3 — The payoff** (T12–T14): quantified redundancy story + epilogue; deck is content-complete.
4. **M4 — Ship** (T15–T16): fact-checked, polished, exported, deployed. ☑ **All items T00–T16 complete (2026-07-30).** Deck is content-complete + fact-checked; final **audience slide count = 87** (styleguide dropped via `hide: true`). Build/export/Pages deploy delegated to `.github/workflows/deploy.yml` (local build impossible in sandbox). Human must: (1) push local commits (`git push origin main` — no sandbox credentials), (2) GitHub Settings → Pages → Source = "GitHub Actions" + allow Actions. See `DEPLOY.md`. Live URL: https://cycus.github.io/slidev_forward_error_correction/
5. **M5 — Post-ship QA** (T17–T19): fixes from the 2026-07-31 flow/structure/presentation review (see the review note below).

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

### Flow/structure/presentation review (2026-07-31) — T17–T19 sourced here

Full deck re-read (all 8 source files) **plus rendered-output inspection**: local `npm run export` now works on the dev machine (87 pages; the sandbox-era "cannot export locally" notes no longer apply) — pages rasterized via pdftoppm and the dense/risky ones eyeballed. Verdict on the things that work: the narrative arc (gap → toolbox → three families → quantified payoff → epilogue) is sound; SectionCover progress dots, per-part recap-with-flag rhythm, and the callback web (LLR polarity, QAM bit reliability → rate matching, PPV → URLLC, extrinsic-only → BP exclusion, professor/student) all land; the thrice-told 2016 coding-wars story is per-part framing and reads as intended given parts are presentable standalone. New defects found (none previously tracked):

- **T17 — raw KaTeX (7 spots, Parts 4–5):** math inside HTML blocks without blank-line delimiters prints literally (`$$ \Rcode = … $$` on Part 4 s3, the L_c/L_a/L_e legend on s8, `$(1,1)$` on s12; `$I(W⁻)+I(W⁺)$` P5 s3, `$N\to\infty$` s7, `$O(L\,N\log N)$` s8, `$\EbNo$` s10). The known comark gotcha; DoD "KaTeX renders" violated.
- **T18 — Part 6 guided walks unreachable:** slides 5/8 embed `BlerExplorer`/`HarqIrDemo` guided (4 `$clicks` steps) but declare no `clicks:` frontmatter — the lone prose v-click makes Slidev's click total 1, so steps 2–4 never play. **Corrects the earlier T13 note calling the shared stream "functionally fine."** (Part 1 s10 / Part 3 s6 show the correct `clicks: 4` pattern.) Also: guided BlerExplorer never draws the Sionna block-length layer the slide-5 card says is "dashed in the plot."
- **T19 — layout polish:** P4 s5 termination paragraph clips into the footer (payoff text cut mid-sentence); P2 s3 + P5 s12 TriviaCards touch/overlap the SourceFoot; P4 s14 + P5 s12 render the recap DbGauge half-width with illegible labels (Parts 1/3/7 are full-width — motif inconsistency); P7 s3 says "every flag this deck has planted" but plots only the 3 family flags; CapacityExplorer view-2 march-marker year labels collide (1993/2001 → "20093" blob). Optional: P3 s13 mermaid small + bottom 40% empty; SourceFoot ellipsis swallows 2nd refs on P5 s9 / P6 s11 / P7 s3.
- Doc drift fixed inline: structure table said Part 1 = 11 / Part 7 = 5 slides; actuals are 12 / 6 (total 87, matching the parser count minus the hidden styleguide).
- Not actioned (deliberate): presenter-note slide numbering mixes global (Parts 1–2) and per-file (Parts 3–7) schemes — cosmetic, notes-only; `year="1948"` vs `:year="2008"` SectionCover binding styles — renders identically.

### T15 fact-check ledger (2026-07-30) — for human review

Full item-by-item Resolution log lives in `tasks/T15-fact-check-pass.md`. Summary:

**Rounding convention adopted (deck-wide):** the LDPC lab result is reported as two distinct, both-sourced quantities — **0.0045 dB = Chung's design/ensemble threshold** (Chung 2001, IEEE Comm. Lett. 5(2)); **0.04 dB = the simulated gap at n=10⁷**. Every `DbGauge` *flag* plots the **0.04 dB** gap (uniform in Parts 1/3/4/5/7); the 0.0045 dB threshold appears only in prose/BigNumbers/TriviaCards that explicitly name "Chung's threshold." Parts 1 & 3 already state both on-slide.

**Verified (internal, against `snippets/*.ts` + 59 passing tests):** capacity Eb/N0 limits {−0.82, 5.74, 15.03} dB for η∈{0.5,4,8}, ultimate −1.59 dB, rate-½ 0 dB; all DbGauge flags match their home parts (Turbo 0.7, LDPC 0.04, Polar 2.8 short-block, Voyager 2.3, Galileo 0.8, BPSK-input½ 0.19); "11.9 dB" CQI6→CQI1 = 11.902 and "~29 dB" span = 29.29 (blerData.ts); "11 dB" Shannon gap (=11.19) used uniformly; CapacityExplorer LDPC 0.23 dB = 0.19 + 0.04 composition sound. Author arithmetic (BP messages, HARQ effective rates, RSC trace, RV k0) covered by snippet tests.

**Verified (web, secondary sources):** Chung 2001 "within 0.0045 dB" (Comm. Lett. 5(2), Feb 2001); Berrou ICC'93 turbo "within ~0.5 dB" popular framing; arXiv:2405.07547 (6G coding survey), PPV 2010 finite-blocklength, Arıkan 0807.3917 (polar) all confirmed; arXiv:2406.19664 confirmed as the DL-for-channel-coding survey. Do-not-use phrase grep clean — the only "RV2 self-decodable" hit is Part 6's deliberate debunk of that misconception.

**Corrected (`pages/part7-epilogue.md`):** (1) comparison-matrix "Flag on gauge" LDPC cell `0.0045 dB (lab)` → **`0.04 dB (lab)`** to match the gauge on the next slide; (2) ML-decoding citation title → **"Recent Advances in Deep Learning for Channel Coding: A Survey"** (arXiv:2406.19664, verified); (3) two stale "T15: reconcile" presenter-note TODOs updated to record the resolution.

**Still-unverified (primary spec PDFs proxy-blocked in sandbox — a human must confirm against the actual documents; none are asserted on-slide without a hedge/SourceFoot, and NO spec value or citation was fabricated):** TS 38.212 (RV k0 table, polar sequence/prefix, puncture-shorten rule, CRC/PC-bit rules), TS 38.214 (MCS/CQI rows + BLER targets), TS 36.212 (188 sizes / QPP / k0 formula), TR 36.942 Annex A LTE attenuated-Shannon values, Berrou ICC'93 constituent generators (37,21)₈ (IEEE Xplore paywalled), Mogensen VTC'07 α≈0.75, Tosato–Bisaglia demapper page-level cite.

**Kept as-is (hedges adequate):** "~30 dB dial" takeaway (tilde + SourceFoot "~29–30 dB" disclose rounding); CapacityExplorer Hamming 9.0 dB marker (hedged in-code as illustrative); Part 6 flags (pyAerial MCS9, Sādhanā non-monotonic, Chase +3 dB theoretical, Mogensen α unverified, TR 36.942 lineage) all still hedged on-slide / in `blerData.ts`.
