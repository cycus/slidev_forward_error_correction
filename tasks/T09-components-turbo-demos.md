# T09 — `RscEncoderStepper` + `TurboIterationDemo` components

## Goal
Two Part 4 interactives: the LTE RSC encoder as a steppable machine, and extrinsic-information exchange made visible on Sklar's 4-bit example.

## `RscEncoderStepper` — interaction spec
- Visual: 3-cell shift register (s1,s2,s3), XOR taps drawn per LTE polynomials — feedback a = x ⊕ s2 ⊕ s3 (g0=1+D²+D³), parity z = a ⊕ s1 ⊕ s3 (g1=1+D+D³); systematic passthrough shown.
- **Reference trace (must reproduce):** input x = 1,1,0,1 from state 000:

  | k | x | state in | a | z | state out |
  |---|---|---|---|---|---|
  | 1 | 1 | 000 | 1 | 1 | 100 |
  | 2 | 1 | 100 | 1 | 0 | 110 |
  | 3 | 0 | 110 | 1 | 0 | 111 |
  | 4 | 1 | 111 | 1 | 1 | 111 |

  (⚠ author-derived from the spec polynomials; verify against TS 36.212 Fig. 5.1.3-2 conventions during implementation — acceptance test is internal consistency + spec-figure check.)
- User can edit the input bit string (≤16 bits); Step / Run; active taps flash on each step; state-transition trace table builds up.
- **Termination mode:** switch flips to feedback (x_tail = s2⊕s3): show 3 tail steps driving state → 000, emitting tail parities; counter shows "6 tail input bits → 12 transmitted bits (4/stream)".
- **"Why recursive" preset:** input 1,0,0,0,… → parity keeps toggling forever (IIR); side-by-side toggle to non-recursive FIR mode (taps only forward) → parity dies after constraint length. This is slide 4's punchline; make the contrast unmissable.
- Optional trellis mini-view (8 states, path highlighting) — stretch goal, descope freely.

## `TurboIterationDemo` — interaction spec
- Sklar's 2×2 product code (single-parity rows+cols) as turbo stand-in. Grid: d1..d4 + row parities + column parities; each cell shows LLR bar + value.
- **Reference numbers (Sklar, "Fundamentals of Turbo Codes" — must reproduce):**
  - Channel LLRs: data {d1:+1.5, d2:+0.1, d3:+0.2, d4:+0.3}\*, parity {2.5, 2.0, 6.0, 1.0}. (\*Signs per Sklar's example mapping d=1,0,0,1 — transcribe exactly from the paper during implementation; the magnitudes and the narrative below are the verified spine.)
  - Soft-XOR extrinsic rule: L(a⊞b) ≈ −sgn(La)·sgn(Lb)·min(|La|,|Lb|).
  - Pass 1 horizontal extrinsics ≈ {−0.1, −1.5, −0.3, +0.2} → d2 rescued by strong d1.
  - Pass 1 vertical (with horizontal as priors) ≈ {+0.1, −0.1, −1.4, +1.0} → d3, d4 fixed.
  - After 2 full iterations: final |LLR| ≈ {2.6, 2.5, 2.6, 2.5}, all bits correct, uniform high confidence.
- Interaction: click-stepped half-iterations (guided via `$clicks`); each half-iteration animates extrinsic values flowing from row/col parities into cells; a "belief meter" per bit grows; final state celebration (all green).
- Explore mode: user can drag any channel LLR and re-run — see when decoding breaks (e.g. weaken d1 → d2 no longer rescued: extrinsic quality depends on neighbor confidence — the deck's probabilistic thesis in one interaction).
- Explicit epilogue caption: "scale this 4-bit game to 6144 bits × 8 iterations through a QPP interleaver — that's LTE."

## Technical requirements
- Pure TS logic in `snippets/rsc.ts` (encoder: polynomial-parameterized) and `snippets/product-turbo.ts` (soft-XOR iteration, returns full trace); unit tests against both reference traces.
- Reuse LLR bar sub-component from T05.
- `$clicks`-driven guided modes; explore modes behind explicit UI; `onSlideLeave` cleanup; `<RenderWhen context="main">`; PDF fallbacks (final-state frame).

## Acceptance criteria
- [ ] RSC trace table matches reference exactly; termination returns to 000 in 3 steps from every reachable state (exhaustive test over 8 states).
- [ ] FIR/IIR contrast preset behaves as specified.
- [ ] Turbo demo reproduces Sklar's trajectory (±0.05 on extrinsics after sign-convention alignment); final LLRs ≈ ±2.5–2.6.
- [ ] Dragging d1 low enough visibly breaks d2's rescue in explore mode.
- [ ] Unit tests in CI; components clean up timers on slide leave.

## Factual basis
- LTE polys/termination: ETSI TS 136 212 §5.1.3.2 (verbatim-fetched during research).
- Sklar example: B. Sklar, "Fundamentals of Turbo Codes" (UML mirror PDF) = IEEE Comm. Mag. 1997 primer material.
- Soft-XOR min approximation: Sklar same source; standard.

## Dependencies
T01, T05 (LLR bar). Feeds T08 slides 4, 5, 9.
