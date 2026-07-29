# T11 — `PolarizationExplorer` component

## Goal
Make channel polarization *watchable*: the recursion tree splitting mediocre channels into great and terrible ones, and the butterfly that implements it.

## Interaction spec
**View 1 — Polarization tree (`mode="tree"`):**
- Start: one node, BEC(ε), ε slider (0.1…0.9, default 0.5). Click/step: apply kernel → level n+1; animate node splitting into W⁻ (up, worse, redder) / W⁺ (down, better, greener); node label = exact erasure probability Z (fraction + decimal at N≤8; decimal only at N=16+).
- Exact recursion: Z(W⁺)=Z², Z(W⁻)=2Z−Z². Reference values at ε=0.5 (must match exactly):
  - N=2: {0.75, 0.25}
  - N=4: {15/16, 9/16, 7/16, 1/16}
  - N=8: {255/256, 225/256, 207/256, 81/256, 175/256, 49/256, 31/256, 1/256}
- Depth up to N=64 (tree collapses into a sorted bar strip beyond N=8 for readability); histogram side-panel: distribution of Z piling up at 0 and 1; running counter "channels with Z<0.1: k/N (capacity 1−ε = X)".
- Rate selector: given target R, highlight the ⌈R·N⌉ best channels (info set, blue) vs frozen (gray); at N=8, R=1/2 must select {u3,u5,u6,u7}.
- ε slider interplay: drag ε → whole tree recolors; shows the info set *changes* with channel quality — then a callout: "5G freezes ONE universal sequence instead" (bridge to slide 5).
**View 2 — Butterfly encoder (`mode="butterfly"`):**
- N=8 encoder butterfly (3 stages); user toggles the 8 u-bits (frozen ones locked at 0, grayed); XOR values propagate live left→right; stage-by-stage `$clicks` stepping in guided mode; XOR-count readout (N/2·log₂N = 12 at N=8).
**View 3 — SC decode walk (`mode="sc"`, stretch goal):**
- Replay a decode on the N=8 tree: bits decided left-to-right; a deliberately injected LLR flip at u3 shows error propagation cascading — the "one wrong turn kills the block" story. Optional list-of-2 mini-visual (two paths, CRC picks). Descope to a static sequence of frames if time-boxed out.

## Technical requirements
- Pure TS in `snippets/polar.ts`: `polarize(eps, n) → Z[]` (exact rationals at n≤3 via numerator/denominator ints, floats beyond), `infoSet(Z, k)`, `encode(u, n)`. Unit tests: all reference values above; `encode` linearity spot-checks; infoSet(N=8, k=4, ε=0.5) = {3,5,6,7}.
- SVG rendering; layout precomputed per depth; animations CSS/spring, no rAF except transient transitions; `<RenderWhen context="main">`; cleanup on leave; PDF fallback = N=8 tree final frame with values.
- Props: `mode`, `guided: boolean`, `maxN`.

## Acceptance criteria
- [ ] Reference Z values reproduced exactly at ε=0.5 (display rounds, internal exact).
- [ ] Histogram + counter tell the capacity story (counter → N·(1−ε) as N grows).
- [ ] Rate selector at N=8/R=1/2 highlights {3,5,6,7}; frozen set {0,1,2,4}.
- [ ] Butterfly propagates XORs correctly for arbitrary u (property-test vs `encode`).
- [ ] Guided modes fully `$clicks`-drivable; explorer usable standalone.
- [ ] View 3 either functional or explicitly descoped with static frames delivered.

## Factual basis
- BEC recursion exactness + all values: Arıkan 2009 (Prop. 5); values re-derivable in one line each — also embed as test fixtures.
- N=8 info set {3,5,6,7}: follows from Z ordering above; coincides with 5G sequence restriction (flagged derivation — T15 checks Table 5.3.1.2-1, but the component's own math stands independent of the spec claim).
- Butterfly structure/XOR count: standard G₂^⊗n factor graph (ShareTechnote).

## Dependencies
T01. Feeds T10 slides 4, 5, 6, 7.
