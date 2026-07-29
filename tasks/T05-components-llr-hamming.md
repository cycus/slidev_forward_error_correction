# T05 — `LlrVisualizer` + `HammingPlayground` components

## Goal
Two small, high-clarity widgets for Part 2. These are the "training wheels" components — simpler than the Part 3+ simulators, they also validate the T01 conventions early.

## `HammingPlayground` — interaction spec
- 4 editable data bits (click to toggle). Parity bits p1,p2,p3 computed live: p1=d1⊕d2⊕d4, p2=d1⊕d3⊕d4, p3=d2⊕d3⊕d4 (standard (7,4), bit order documented in code comment).
- "Channel" row: click any of the 7 transmitted bits to flip (red). Syndrome (s1,s2,s3) displayed as binary + decimal pointer to the flipped position; corrected word shown (green).
- Flip a second bit → syndrome points at the WRONG position → visible miscorrection banner: "d_min = 3: one error correctable, two errors fool it." This failure mode is the pedagogical payload.
- Reset button; optional `$clicks` script mode for presenting: click 1 = encode, click 2 = single flip + correct, click 3 = double flip + miscorrect.
- Numeric validation: all 16 codewords have pairwise distance ≥ 3 (checkable by exhaustive test in dev).

## `LlrVisualizer` — interaction spec
**Tab 1 — BPSK/AWGN:**
- Horizontal axis: y ∈ [−2.5, +2.5]. Draggable received-sample marker; σ slider (0.3…1.2).
- Live: two Gaussian likelihood curves p(y|0), p(y|1); LLR bar = 2y/σ² with sign→decision color, |LLR|→bar length; readout "hard says X, confidence Y".
**Tab 2 — Repetition demo (slide 8's example):**
- Three received samples preset (+0.9, −0.15, −0.25) but draggable; hard majority verdict vs LLR-sum verdict recomputed live; mismatch highlighted. Preset button restores the canonical failing case.
**Tab 3 — 16QAM (stretch, keep simple):**
- Gray-mapped 16QAM constellation; click near any point → 4 LLR bars (max-log: nearest 0-set vs 1-set distance difference per bit); shows outer bits high-|LLR|, inner bits weaker at same noise.

## Technical requirements
- Pure SVG; no chart lib. Pure functions `llrBpsk(y, sigma2)`, `llrMaxLogQam16(z, sigma2)` in `snippets/` (importable + unit-testable + reusable by T07/T09 demos).
- Reference values for tests: llrBpsk(0.9, 0.5)=+3.6; llrBpsk(−0.25, 0.5)=−1.0; repetition sum = +2.0 → decodes 0 while majority says 1.
- Both components: work standalone (docs/styleguide page) and embedded; `<RenderWhen context="main">`; dark-mode compliant; PDF fallback = static frame.

## Acceptance criteria
- [ ] Hamming: all three scripted clicks work; miscorrection case reproduces reliably; exhaustive d_min test passes in dev.
- [ ] LLR tab 1: dragging y across 0 flips decision color exactly at 0; growing σ visibly shrinks |LLR|.
- [ ] Tab 2 reproduces the canonical example exactly (values above).
- [ ] Tab 3 (if built): outer/inner bit reliability asymmetry visible; otherwise explicitly descoped with note in PR.
- [ ] Shared LLR functions exported and unit-tested; T07/T09 can import them.

## Factual basis
- (7,4) Hamming standard construction (Hamming 1950, BSTJ 29(2)).
- Max-log LLR: min-distance difference formula (MathWorks demodulator docs; Tosato-Bisaglia ICC 2002 is the canonical citation — flagged, cite as "canonical" without page-level verification until T15).
- Repetition example numbers: constructed, self-consistent (T04 slide 8).

## Dependencies
T01 (colors, RenderWhen pattern). Feeds T04.
