# T07 — `TannerBpSimulator` component (centerpiece #1)

## Goal
A live belief-propagation simulator on a small Tanner graph. The single most important interactive in the deck: it must make "iterative + probabilistic" *visible* — beliefs flowing along edges, confidence building, parity checks going green.

## The reference code (fixed, do not improvise)
Johnson's (2,3)-regular example — H (4×6):
```
1 1 0 1 0 0
0 1 1 0 1 0
1 0 0 0 1 1
0 0 1 1 0 1
```
Canonical scenario: codeword c = [0 0 1 0 1 1] sent over BSC p=0.2; bit 1 flipped → y = [1 0 1 0 1 1]. Channel LLRs ±ln(0.8/0.2) = ±1.3863 (convention: negative ⇒ bit 1, per deck polarity).

**Reference trajectory (sum-product) — component must reproduce EXACTLY:**
- CN→VN messages iteration 1: |E| = 2·tanh⁻¹(tanh(1.3863/2)²) = **0.7538** (degree-3 checks ⇒ 2 inputs each).
- Posterior after iteration 1: L = [**+0.1213**, +1.3863, −2.8938, +1.3863, −1.3863, −1.3863] → bit 1 flips to 0 → decoded [0 0 1 0 1 1], syndrome = 0, halt after 1 iteration.
- Min-sum on same input: |E| = 1.3863 (overestimate ×1.84); normalized min-sum α=0.75: |E| = 1.0397. (Derived values — sanity-check in unit tests, they follow directly from the update rules.)

## Interaction spec
- **Layout:** VNs bottom (circles, labeled v0…v5 with current LLR bar inside), CNs top (squares c0…c3), edges curved; per T01 colors (satisfied check = green, violated = red; message arrows animate along edges).
- **Modes:**
  1. *Guided* (`$clicks`-driven, for slide 6 of Part 3): click steps = [show channel LLRs] → [VN→CN half-iteration, arrows down… up] → [CN→VN messages with values] → [posterior update, bit 1 flips] → [syndrome green, halt banner "1 iteration"].
  2. *Explore* (self-serve UI): buttons Step-half-iteration / Step-iteration / Auto-play (rAF, ≤2 steps/s) / Reset; click any VN to flip its received bit (re-derives channel LLRs); noise slider p ∈ {0.05…0.45} regenerates LLR magnitudes ln((1−p)/p); algorithm toggle SP / MS / NMS(α=0.75); iteration counter + "parity checks satisfied k/4" indicator.
  3. *Failure showcase:* preset button "flip 2 bits" → oscillation/non-convergence within max 10 iterations → banner explaining decoding failure & why more redundancy/longer codes help (bridge to Part 6).
- **Message inspection:** hover any edge mid-iteration → tooltip with the numeric message value (this is where 0.7538 becomes real).

## Technical requirements
- Decoder implemented as pure TS in `snippets/bp.ts`: `spDecode(H, llr, opts) → {trace: Iteration[]}` — full message trace, UI is a pure renderer of the trace. Unit tests against the reference trajectory above (±1e-3).
- Algorithms: sum-product (tanh rule), min-sum, normalized min-sum (α param). Max iterations 10, early stop on zero syndrome.
- All animation driven from the trace; rAF loops started in `onSlideEnter`, killed in `onSlideLeave`; `<RenderWhen context="main">`.
- Props: `mode: 'guided'|'explore'`, `algorithm`, `scenario` (preset id). State in module store so the explore state survives navigating away/back.
- PDF fallback: static SVG of iteration-1 state with message values labeled.
- Performance: 4×6 graph is trivial; keep code generic enough to load a slightly larger H (e.g. 8×16) for the failure showcase if the 4×6 converges too easily with 2 flips — decide during implementation, document choice.

## Acceptance criteria
- [ ] Unit tests: reference trajectory reproduced exactly (0.7538 / +0.1213 / halt@1); MS and NMS values (1.3863 / 1.0397) verified.
- [ ] Guided mode fully drivable by presenter remote (pure `$clicks`).
- [ ] Explore mode: bit-flipping, noise slider, algorithm toggle all live; syndrome indicator correct at every step.
- [ ] Failure showcase reliably fails to converge and shows the explanation banner.
- [ ] Hover tooltips show correct per-edge values at every half-iteration.
- [ ] No timers/rAF running while the slide is hidden (verify via console instrumentation in dev).

## Factual basis
- Example + update rules + all reference numbers: Sarah Johnson, "Introducing Low-Density Parity-Check Codes" (Examples 1.12/2.3/2.5).
- Sum-product/min-sum formulas: Johnson; normalization α=0.75 default: MathWorks nrLDPCDecode.
- BSC LLR = ±ln((1−p)/p): standard.

## Dependencies
T01 (colors/store/RenderWhen); exports `bp.ts` reused nowhere else (LLR helpers come from T05's snippets).
